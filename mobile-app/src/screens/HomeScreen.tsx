import React, { JSX } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '@/interfaces';
import { useAuthStore } from '@/store/useAuthStore';
import { usePermissions } from '@/hooks/usePermissions';
import * as Location from 'expo-location';

export default function HomeScreen(): JSX.Element {
  const user = useAuthStore((state): User | null => state.user);
  const logout = useAuthStore((state): (() => void) => state.logout);

  const { isGranted, request, backgroundStatus, status } = usePermissions();

  const handleEnablePermissions = async (): Promise<void> => {
    const success = await request();
    if (!success) {
      Alert.alert(
        'Permissions Required',
        "To detect geofences, you must select 'Allow all the time' in settings.",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: (): void => {
              void Linking.openSettings();
            },
          },
        ],
      );
    }
  };

  // PERMISSION GUARD
  if (!isGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Setup Required</Text>
            <Text style={styles.subtitle}>Geofencing needs location access.</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoText}>
              To enable automatic detection, please grant the following permissions:
            </Text>
            <View style={styles.permRow}>
              <Text style={styles.permLabel}>1. While using the app</Text>
              <Text
                style={[
                  styles.permStatus,
                  { color: status === Location.PermissionStatus.GRANTED ? '#34C759' : '#FF3B30' },
                ]}
              >
                {status === Location.PermissionStatus.GRANTED ? 'GRANTED' : 'MISSING'}
              </Text>
            </View>
            <View style={styles.permRow}>
              <Text style={styles.permLabel}>2. Always allow (Background)</Text>
              <Text
                style={[
                  styles.permStatus,
                  {
                    color:
                      backgroundStatus === Location.PermissionStatus.GRANTED
                        ? '#34C759'
                        : '#FF3B30',
                  },
                ]}
              >
                {backgroundStatus === Location.PermissionStatus.GRANTED ? 'GRANTED' : 'MISSING'}
              </Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                void handleEnablePermissions();
              }}
            >
              <Text style={styles.primaryButtonText}>Enable Location</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={logout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // DASHBOARD
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Hello, {user?.name}</Text>
          <Text style={styles.subtitle}>@{user?.username}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>
            Role: <Text style={styles.bold}>{user?.role}</Text>
          </Text>
          <Text style={styles.infoText}>
            ID: <Text style={styles.bold}>{user?.id}</Text>
          </Text>
          <Text style={styles.statusText}>● Monitoring Active</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Open Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  infoBlock: {
    marginBottom: 40,
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  permLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  permStatus: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bold: {
    fontWeight: '600',
    color: '#000',
  },
  statusText: {
    marginTop: 8,
    color: '#34C759',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
