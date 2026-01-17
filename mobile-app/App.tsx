import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '@/store/useAuthStore';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import HomeScreen from '@/screens/HomeScreen';

import '@/services/GeofencingTask'; 
import { useGeofenceStore } from '@/store/useGeofenceStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  
  const geofences = useGeofenceStore((state) => state.geofences);
  const isMonitoring = useGeofenceStore((state) => state.isMonitoring)
  const startMonitoring = useGeofenceStore((state) => state.startMonitoring);
  const stopMonitoring = useGeofenceStore((state) => state.stopMonitoring);

  const { isGranted, check } = usePermissions();

  useEffect(() => {
    const manageMonitoring = async () => {      
      const shouldMonitor = isAuthenticated && isGranted && geofences.length > 0 && !isMonitoring;

      if (shouldMonitor) {
        console.log("[App] Conditions met. Ensuring monitoring is ACTIVE.");
        await startMonitoring();
      } else {
        console.log("[App] Conditions NOT met. Ensuring monitoring is STOPPED.");
        await stopMonitoring();
      }
    };

    manageMonitoring();
    
    void check();

  }, [isAuthenticated, isGranted, geofences.length]);


  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        { isAuthenticated ? (<Stack.Screen name="Home" component={HomeScreen}/>
        ) : (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )
      }
      </Stack.Navigator>
    </NavigationContainer>
  )
}