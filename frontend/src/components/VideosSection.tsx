import { useState, useRef, useEffect } from 'react';
import { useGetAllVideos, useUploadVideo, useDeleteVideo, useRearrangeVideos } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Trash2, GripVertical, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface VideosSectionProps {
  onBack: () => void;
}

function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'm4v': 'video/x-m4v',
    '3gp': 'video/3gpp',
  };
  return mimeTypes[ext || ''] || 'video/mp4';
}

export default function VideosSection({ onBack }: VideosSectionProps) {
  const { actor, isFetching: actorLoading } = useActor();
  const { data: videos = [], isLoading } = useGetAllVideos();
  const uploadVideo = useUploadVideo();
  const deleteVideo = useDeleteVideo();
  const rearrangeVideos = useRearrangeVideos();
  
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; filename: string; mimeType: string } | null>(null);
  const [deleteVideoId, setDeleteVideoId] = useState<bigint | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set());
  const [videoBlobUrls, setVideoBlobUrls] = useState<Map<string, string>>(new Map());
  const [loadingVideos, setLoadingVideos] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      videoBlobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [videoBlobUrls]);

  const getVideoBlobUrl = async (videoId: string, storageRef: ExternalBlob, mimeType: string): Promise<string> => {
    if (videoBlobUrls.has(videoId)) {
      return videoBlobUrls.get(videoId)!;
    }

    setLoadingVideos(prev => new Set(prev).add(videoId));

    try {
      const bytes = await storageRef.getBytes();
      const blob = new Blob([bytes], { type: mimeType || 'video/mp4' });
      const blobUrl = URL.createObjectURL(blob);
      
      setVideoBlobUrls(prev => new Map(prev).set(videoId, blobUrl));
      setLoadingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
      
      return blobUrl;
    } catch (error) {
      console.error('Error fetching video blob:', error);
      setLoadingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
      throw error;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!actor || actorLoading) {
      toast.error('Kérjük, várjon amíg a kapcsolat létrejön...');
      return;
    }

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('video/')) {
        toast.error(`${file.name} nem videó fájl`);
        continue;
      }

      try {
        setUploadProgress(0);
        
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });

        await uploadVideo.mutateAsync({
          filename: file.name,
          content: blob,
        });

        toast.success('Videó sikeresen feltöltve!');
        setUploadProgress(null);
      } catch (error: any) {
        console.error('Upload error:', error);
        
        if (error?.message?.includes('jogosultsága') || error?.message?.includes('Unauthorized')) {
          toast.error('Nincs jogosultsága a feltöltéshez. Kérjük, jelentkezzen be újra.');
        } else if (error?.message?.includes('Actor not available')) {
          toast.error('A kapcsolat nem elérhető. Kérjük, frissítse az oldalt.');
        } else {
          toast.error('Hiba történt a videó feltöltése során');
        }
        
        setUploadProgress(null);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deleteVideoId) return;

    try {
      const videoIdStr = deleteVideoId.toString();
      if (videoBlobUrls.has(videoIdStr)) {
        URL.revokeObjectURL(videoBlobUrls.get(videoIdStr)!);
        setVideoBlobUrls(prev => {
          const newMap = new Map(prev);
          newMap.delete(videoIdStr);
          return newMap;
        });
      }

      await deleteVideo.mutateAsync(deleteVideoId);
      toast.success('Videó sikeresen törölve');
      setDeleteVideoId(null);
    } catch (error) {
      toast.error('Hiba történt a videó törlése során');
      console.error(error);
      setDeleteVideoId(null);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newVideos = [...videos];
    const draggedVideo = newVideos[draggedIndex];
    newVideos.splice(draggedIndex, 1);
    newVideos.splice(index, 0, draggedVideo);

    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    const videoIds = videos.map(v => v.id);
    
    try {
      await rearrangeVideos.mutateAsync(videoIds);
      toast.success('Videók sorrendje frissítve');
    } catch (error) {
      toast.error('Hiba történt az átrendezés során');
      console.error(error);
    }

    setDraggedIndex(null);
  };

  const handleVideoError = (videoId: string, error: any) => {
    console.error('Video load error for', videoId, ':', error);
    setVideoErrors(prev => new Set(prev).add(videoId));
    toast.error('Hiba történt a videó betöltése során');
  };

  const handleVideoPlay = async (video: typeof videos[0]) => {
    if (isReordering) return;

    const videoId = video.id.toString();
    const mimeType = video.mimeType || getMimeTypeFromFilename(video.filename);

    try {
      const blobUrl = await getVideoBlobUrl(videoId, video.storageRef, mimeType);
      setSelectedVideo({ url: blobUrl, filename: video.filename, mimeType });
    } catch (error) {
      console.error('Error loading video:', error);
      toast.error('Nem sikerült betölteni a videót');
    }
  };

  const isUploadDisabled = uploadProgress !== null || !actor || actorLoading;
  const isUploading = uploadProgress !== null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Vissza
          </Button>
          <h2 className="text-3xl font-bold text-heritage-dark">Videók</h2>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsReordering(!isReordering)}
            variant={isReordering ? "default" : "outline"}
            size="sm"
            className={isReordering ? "bg-heritage-dark hover:bg-heritage-darker" : ""}
          >
            <GripVertical className="h-4 w-4 mr-2" />
            {isReordering ? 'Kész' : 'Átrendezés'}
          </Button>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadDisabled}
            className="bg-heritage-dark hover:bg-heritage-darker disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Feltöltés folyamatban... {uploadProgress}%
              </>
            ) : actorLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kapcsolódás...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Videók feltöltése
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-heritage-dark border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Videók betöltése...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground text-lg">Még nincsenek videók feltöltve</p>
          <p className="text-sm text-muted-foreground mt-2">Kattintson a "Videók feltöltése" gombra az első videó hozzáadásához</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video, index) => {
            const videoId = video.id.toString();
            const hasError = videoErrors.has(videoId);
            const isLoadingVideo = loadingVideos.has(videoId);
            const mimeType = video.mimeType || getMimeTypeFromFilename(video.filename);
            
            return (
              <div
                key={videoId}
                draggable={isReordering}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group relative aspect-video rounded-lg overflow-hidden bg-muted shadow-md hover:shadow-xl transition-all ${
                  isReordering ? 'cursor-move' : 'cursor-pointer'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
                onClick={() => !isReordering && !hasError && handleVideoPlay(video)}
              >
                {hasError ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="text-center p-4">
                      <p className="text-sm text-destructive font-medium">Videó betöltési hiba</p>
                      <p className="text-xs text-muted-foreground mt-1">{video.filename}</p>
                      <p className="text-xs text-muted-foreground mt-2">A videó nem játszható le</p>
                    </div>
                  </div>
                ) : isLoadingVideo ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-heritage-dark border-t-transparent" />
                      <p className="text-xs text-muted-foreground mt-2">Betöltés...</p>
                    </div>
                  </div>
                ) : (
                  <VideoThumbnail
                    video={video}
                    mimeType={mimeType}
                    onError={() => handleVideoError(videoId, new Error('Thumbnail load failed'))}
                  />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {!isReordering && !hasError && !isLoadingVideo && (
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-8 w-8 text-heritage-dark ml-1" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-medium truncate">{video.filename}</p>
                  </div>
                </div>

                {!isReordering && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteVideoId(video.id);
                    }}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                {isReordering && (
                  <div className="absolute top-2 left-2 bg-heritage-dark text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedVideo && (
            <div className="relative bg-black">
              <video
                key={selectedVideo.url}
                controls
                autoPlay
                className="w-full h-auto max-h-[90vh]"
                onError={(e) => {
                  console.error('Video playback error:', e);
                  toast.error('Hiba történt a videó lejátszása során. A videó formátuma nem támogatott.');
                }}
                playsInline
              >
                <source src={selectedVideo.url} type={selectedVideo.mimeType} />
                A böngésző nem támogatja a videó lejátszást.
              </video>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
                <p className="text-white text-sm font-medium">{selectedVideo.filename}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteVideoId} onOpenChange={() => setDeleteVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törli ezt a videót?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet nem vonható vissza. A videó véglegesen törlődik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteVideo.isPending}
            >
              {deleteVideo.isPending ? 'Törlés...' : 'Törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function VideoThumbnail({ 
  video, 
  mimeType, 
  onError 
}: { 
  video: { storageRef: ExternalBlob; filename: string }; 
  mimeType: string; 
  onError: () => void;
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    const loadThumbnail = async () => {
      try {
        const directUrl = video.storageRef.getDirectURL();
        if (mounted) {
          setThumbnailUrl(directUrl);
        }
      } catch (error) {
        console.error('Error loading thumbnail:', error);
        if (mounted) {
          onError();
        }
      }
    };

    loadThumbnail();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [video.storageRef, onError]);

  if (!thumbnailUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-heritage-dark border-t-transparent" />
      </div>
    );
  }

  return (
    <video
      src={thumbnailUrl}
      preload="metadata"
      className="w-full h-full object-cover"
      onError={onError}
      playsInline
      muted
    >
      <source src={thumbnailUrl} type={mimeType} />
    </video>
  );
}
