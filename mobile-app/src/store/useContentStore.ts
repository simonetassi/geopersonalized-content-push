import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import { ContentMeta, ContentType } from '@/interfaces';
import { getContentProxyUrl } from '@/api/Content';

interface ContentState {
  cachedFiles: Record<string, string>;
  loadingItems: Record<string, boolean>;
  downloadContent: (content: ContentMeta) => Promise<string | null>;
  deleteContent: (contentId: string) => void;
  isCached: (contentId: string) => boolean;
}

const getFileExtension = (content: ContentMeta): string => {
  switch (content.type) {
    case ContentType.IMAGE:
      return 'jpg';
    case ContentType.VIDEO:
      return 'mp4';
    case ContentType.JSON:
      return 'json';
    case ContentType.HTML:
      return 'html';
    case ContentType.TEXT:
      return 'txt';
    case ContentType.PDF:
      return 'pdf';
    default:
      return 'bin';
  }
};

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      cachedFiles: {},
      loadingItems: {},

      isCached: (contentId: string): boolean => {
        const path = get().cachedFiles[contentId];
        return !!path;
      },

      downloadContent: async (content: ContentMeta): Promise<string | null> => {
        const { cachedFiles, loadingItems } = get();

        if (cachedFiles[content.id]) {
          const existingFile = new File(cachedFiles[content.id]);
          if (existingFile.exists) {
            console.log(`[Content] Already cached: ${content.descriptor}`);
            return existingFile.uri;
          }
        }

        set({ loadingItems: { ...loadingItems, [content.id]: true } });

        try {
          const proxyUrl = getContentProxyUrl(content.id);
          const extension = getFileExtension(content);

          const destinationFile = new File(Paths.document, `${content.id}.${extension}`);

          console.log(`[Content] Downloading from: ${proxyUrl}`);

          const result = await File.downloadFileAsync(proxyUrl, destinationFile);

          console.log(`[Content] Downloaded to: ${result.uri}`);

          set(state => ({
            cachedFiles: { ...state.cachedFiles, [content.id]: result.uri },
            loadingItems: { ...state.loadingItems, [content.id]: false },
          }));

          return result.uri;
        } catch (error) {
          console.error(`[Content] Download Error:`, error);
          set(state => ({
            loadingItems: { ...state.loadingItems, [content.id]: false },
          }));
          return null;
        }
      },

      deleteContent: (contentId: string): void => {
        const { cachedFiles } = get();
        const uri = cachedFiles[contentId];

        if (uri) {
          const fileToDelete = new File(uri);
          if (fileToDelete.exists) {
            fileToDelete.delete();
          }

          const newCache = { ...cachedFiles };
          delete newCache[contentId];
          set({ cachedFiles: newCache });
        }
      },
    }),
    {
      name: 'content-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ cachedFiles: state.cachedFiles }),
    },
  ),
);
