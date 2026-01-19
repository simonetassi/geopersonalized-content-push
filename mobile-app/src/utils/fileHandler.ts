import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystemLegacy from 'expo-file-system/legacy';

const getMimeType = (uri: string): string => {
  const ext = uri.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'json':
      return 'application/json';
    case 'mp4':
      return 'video/mp4';
    case 'txt':
      return 'text/plain';
    case 'html':
      return 'text/html';
    default:
      return '*/*';
  }
};

export const openFileViewer = async (localUri: string) => {
  try {
    if (Platform.OS === 'android') {
      const mimeType = getMimeType(localUri);
      const contentUri = await FileSystemLegacy.getContentUriAsync(localUri);

      try {
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          type: mimeType,
          // flags:
          // 1 = FLAG_GRANT_READ_URI_PERMISSION
          // 268435456 = FLAG_ACTIVITY_NEW_TASK
          flags: 1 | 268435456,
        });
      } catch (intentError) {
        console.warn('[FileHandler] Direct open failed. Falling back to Share.', intentError);

        await Sharing.shareAsync(localUri, {
          mimeType: mimeType,
          dialogTitle: 'Open with...',
        });
      }
    } else {
      await Sharing.shareAsync(localUri);
    }
  } catch (e) {
    console.error('[FileHandler] Fatal Error:', e);
    Alert.alert('Error', 'Unable to open or share this file.');
  }
};
