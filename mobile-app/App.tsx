import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '@/store/useAuthStore';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import HomeScreen from '@/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
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