import { registerUser } from '@/api/Auth';
import { Input } from '@/components/Input';
import { User } from '@/interfaces';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { JSX, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

export default function RegisterScreen(): JSX.Element {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const loginAction = useAuthStore((state): ((user: User) => void) => state.login);
  const navigation = useNavigation();

  const handleRegister = async (): Promise<void> => {
    if (!username || !password || !name || !surname) return Alert.alert('Error', 'Fill all fields');

    setLoading(true);

    try {
      const newUser = await registerUser({
        username,
        password,
        name,
        surname,
      });

      loginAction(newUser);
    } catch (error) {
      Alert.alert('Registration Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={styles.title}>Create Account</Text>
      <Input placeholder="Name" value={name} onChangeText={setName} />
      <Input placeholder="Surname" value={surname} onChangeText={setSurname} />
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
          void handleRegister();
        }}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign Up</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  button: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#007AFF' },
});
