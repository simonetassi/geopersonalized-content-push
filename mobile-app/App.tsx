import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '@/store/useAuthStore';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import HomeScreen from '@/screens/HomeScreen';

import '@/services/GeofencingTask';
import { useGeofenceStore } from '@/store/useGeofenceStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HistoryScreen from '@/screens/HistoryScreen';
import ContentViewerScreen from '@/screens/ContentViewerScreen';

export const navigationRef = createNavigationContainerRef<any>();

const Stack = createNativeStackNavigator();

export default function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const hasHydrated = useAuthStore(state => state._hasHydrated);

  const geofences = useGeofenceStore(state => state.geofences);
  const isMonitoring = useGeofenceStore(state => state.isMonitoring);
  const startMonitoring = useGeofenceStore(state => state.startMonitoring);
  const stopMonitoring = useGeofenceStore(state => state.stopMonitoring);

  const { isGranted, check } = usePermissions();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      
      const data = response.notification.request.content.data;
      const geofenceId = data.geofenceId;

      if (geofenceId) {
        console.log(`[App] Notification clicked for fence: ${geofenceId}`);

        const currentGeofences = useGeofenceStore.getState().geofences;
        const targetFence = currentGeofences.find(g => g.id === geofenceId);
        
        const contentToView = targetFence?.contents?.[0];

        if (contentToView && navigationRef.isReady()) {
          navigationRef.navigate('ContentViewer', { content: contentToView });
        } else {
          console.warn("[App] Content not found or Navigation not ready");
        }
      }
    });

    return () => subscription.remove();
  }, []);


  useEffect(() => {
    const manageMonitoring = async () => {
      const shouldMonitor = isAuthenticated && isGranted && geofences.length > 0 && !isMonitoring;

      if (shouldMonitor) {
        console.log('[App] Conditions met. Ensuring monitoring is ACTIVE.');
        await startMonitoring();
      } else {
        console.log('[App] Conditions NOT met. Ensuring monitoring is STOPPED.');
        await stopMonitoring();
      }
    };

    manageMonitoring();

    void check();
  }, [isAuthenticated, isGranted, geofences.length]);

  if (!hasHydrated) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="ContentViewer" 
                component={ContentViewerScreen} 
                options={{ headerShown: false }} 
              />
            </>
          ) : (
            <Stack.Group screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

