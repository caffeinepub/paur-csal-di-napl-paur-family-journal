import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Photo, Video, Album, PhotoUploadInput, VideoUploadInput, AlbumInput, AlbumEntryInput, UserProfile, DeleteAlbumResponse, PhotoId, AlbumId } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllPhotos() {
  const { actor, isFetching } = useActor();

  return useQuery<Photo[]>({
    queryKey: ['photos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPhotos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: PhotoUploadInput) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.uploadPhoto(photo);
      } catch (error: any) {
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
          throw new Error('Nincs jogosultsága a feltöltéshez. Kérjük, jelentkezzen be újra.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('jogosultsága')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useDeletePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePhoto(photoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useRearrangePhotos() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoIds: bigint[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rearrangePhotos(photoIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}

export function useMovePhotoToAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, albumId }: { photoId: PhotoId; albumId: AlbumId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.movePhotoToAlbum(photoId, albumId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useGetAllVideos() {
  const { actor, isFetching } = useActor();

  return useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: VideoUploadInput) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        await actor.uploadVideo(video);
      } catch (error: any) {
        if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
          throw new Error('Nincs jogosultsága a feltöltéshez. Kérjük, jelentkezzen be újra.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('jogosultsága')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useRearrangeVideos() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoIds: bigint[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rearrangeVideos(videoIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

export function useGetAllAlbums() {
  const { actor, isFetching } = useActor();

  return useQuery<Album[]>({
    queryKey: ['albums'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAlbums();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumInput: AlbumInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAlbum(albumInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useDeleteAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (albumId: bigint): Promise<DeleteAlbumResponse> => {
      if (!actor) throw new Error('Actor not available');
      const response = await actor.deleteAlbum(albumId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useAddEntryToAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, entry }: { albumId: bigint; entry: AlbumEntryInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addEntryToAlbum(albumId, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}
