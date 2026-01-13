import { loginUser } from '@/api/Auth';
import { Input } from '@/components/Input';
import { User } from '@/interfaces';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { JSX, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface LoginScreenNavigationProp {
  navigate: (screen: string) => void;
}

export default function LoginScreen(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const loginAction = useAuthStore((state): ((user: User) => void) => state.login);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async (): Promise<void> => {
    if (!username || !password) return Alert.alert('Error! All fields must be filled.');

    setLoading(true);

    try {
      const user: User = await loginUser(username, password);
      loginAction(user);
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            void handleLogin();
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Sign In</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Register');
          }}
          style={styles.link}
        >
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#007AFF' },
});
