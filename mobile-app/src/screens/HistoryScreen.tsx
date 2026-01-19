import { ContentMeta, Event } from '@/interfaces';
import { useAuthStore } from '@/store/useAuthStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { Text } from '@react-navigation/elements';
import { useNavigation } from 'expo-router';
import { JSX, useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContentScreenNavigationProp {
  navigate: (screen: string, params: { content: ContentMeta }) => void;
}

const HistoryItem = ({ item }: { item: Event }): JSX.Element => {
  const navigation = useNavigation<ContentScreenNavigationProp>();
  const isEntry = item.type === 'entry';

  const firstContent = item.fence?.contents?.[0];
  const repoUrl = firstContent?.repoUrl;

  const handleOpenRepo = (): void => {
    if (firstContent) {
      navigation.navigate('ContentViewer', { content: firstContent });
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeContainer}>
          <View style={[styles.dot, { backgroundColor: isEntry ? '#34C759' : '#FF9500' }]} />
          <Text style={styles.typeText}>{isEntry ? 'ENTERED' : 'EXITED'}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>

      <Text style={styles.fenceName}>{item.fence?.name || 'Unknown Zone'}</Text>
      <Text style={styles.fenceId}>ID: {item.fence?.id}</Text>

      {isEntry && repoUrl && (
        <TouchableOpacity style={styles.repoButton} onPress={handleOpenRepo}>
          <Text style={styles.repoButtonText}>Open Content</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function HistoryScreen(): JSX.Element {
  const navigation = useNavigation();
  const user = useAuthStore(state => state.user);
  const { history, isLoading, fetchHistory } = useHistoryStore();

  useEffect(() => {
    if (user?.id) {
      void fetchHistory(user.id);
    }
  }, [user?.id]);

  const onRefresh = useCallback(() => {
    if (user?.id) {
      void fetchHistory(user.id);
    }
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
      </View>
      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <HistoryItem item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              void onRefresh();
            }}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No events recorded yet.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    paddingRight: 15,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  listContent: {
    padding: 20,
  },
  // Card Styles
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  fenceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  fenceId: {
    fontSize: 10,
    fontFamily: 'monospace', // Monospaced font for IDs
    color: '#AAA',
    marginBottom: 12,
  },
  repoButton: {
    backgroundColor: '#007AFF', // Standard Blue
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  repoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});
