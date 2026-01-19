import React, { JSX } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ContentMeta, ContentType } from '@/interfaces';
import { useContentStore } from '@/store/useContentStore';
import { openFileViewer } from '@/utils/fileHandler';

type ParamList = {
  ContentViewer: { content: ContentMeta };
};

export default function ContentViewerScreen(): JSX.Element {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'ContentViewer'>>();
  const { content } = route.params;

  const cachedUri = useContentStore(state => state.cachedFiles[content.id]);
  const isDownloading = useContentStore(state => state.loadingItems[content.id]);
  const downloadContent = useContentStore(state => state.downloadContent);
  const deleteContent = useContentStore(state => state.deleteContent);

  const handleDownload = async (): Promise<void> => {
    const uri = await downloadContent(content);
    if (!uri) Alert.alert('Error', 'Download failed.');
    else {
      if (content.type !== ContentType.IMAGE) {
        await openFileViewer(uri);
      }
    }
  };

  const handleDelete = (): void => {
    Alert.alert('Delete File', 'Remove this file from device storage?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: (): void => deleteContent(content.id) },
    ]);
  };

  const renderMainContent = (): JSX.Element => {
    if (isDownloading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.statusText}>Downloading {content.type}...</Text>
        </View>
      );
    }

    if (!cachedUri) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.iconLarge}>☁️</Text>
          <Text style={styles.title}>{content.descriptor}</Text>
          <Text style={styles.subtitle}>This content is not on your device yet.</Text>

          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => {
              void handleDownload();
            }}
          >
            <Text style={styles.downloadText}>Download ({content.type})</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (content.type === ContentType.IMAGE) {
      return (
        <View style={styles.viewerContainer}>
          <Image source={{ uri: cachedUri }} style={styles.fullImage} resizeMode="contain" />
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.iconLarge}>📄</Text>
        <Text style={styles.title}>{content.descriptor}</Text>
        <Text style={styles.successText}>File Saved Successfully</Text>

        <TouchableOpacity
          style={[styles.downloadBtn, { marginTop: 20, backgroundColor: '#34C759' }]}
          onPress={() => {
            void openFileViewer(cachedUri);
          }}
        >
          <Text style={styles.downloadText}>Open File</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.headerActionText}>Done</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {content.descriptor}
        </Text>
        <View style={styles.rightHeader}>
          {cachedUri && !isDownloading && (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={[styles.headerActionText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.body}>{renderMainContent()}</View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  backButton: {
    minWidth: 60,
  },
  rightHeader: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  headerActionText: {
    fontSize: 16,
    color: '#007AFF',
  },
  body: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  iconLarge: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  successText: {
    color: '#34C759',
    fontWeight: '600',
    marginTop: 10,
  },
  pathText: {
    marginTop: 10,
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
  },
  downloadBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
