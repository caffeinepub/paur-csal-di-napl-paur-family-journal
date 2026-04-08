import { useState, useRef, useEffect } from 'react';
import { useGetAllPhotos, useUploadPhoto, useDeletePhoto, useRearrangePhotos, useGetAllAlbums, useMovePhotoToAlbum } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Trash2, GripVertical, X, FolderPlus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PhotosSectionProps {
  onBack: () => void;
}

export default function PhotosSection({ onBack }: PhotosSectionProps) {
  const { actor, isFetching: actorLoading } = useActor();
  const { data: photos = [], isLoading } = useGetAllPhotos();
  const { data: albums = [] } = useGetAllAlbums();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const rearrangePhotos = useRearrangePhotos();
  const movePhotoToAlbum = useMovePhotoToAlbum();
  
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<bigint | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [showAlbumSelectDialog, setShowAlbumSelectDialog] = useState(false);
  const [selectedPhotoForAlbum, setSelectedPhotoForAlbum] = useState<bigint | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!actor || actorLoading) {
      toast.error('Kérjük, várjon amíg a kapcsolat létrejön...');
      return;
    }

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} nem kép fájl`);
        continue;
      }

      try {
        setUploadProgress(0);
        
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });

        await uploadPhoto.mutateAsync({
          filename: file.name,
          content: blob,
        });

        toast.success('Fotó sikeresen feltöltve!');
        setUploadProgress(null);
      } catch (error: any) {
        console.error('Upload error:', error);
        
        if (error?.message?.includes('jogosultsága') || error?.message?.includes('Unauthorized')) {
          toast.error('Nincs jogosultsága a feltöltéshez. Kérjük, jelentkezzen be újra.');
        } else if (error?.message?.includes('Actor not available')) {
          toast.error('A kapcsolat nem elérhető. Kérjük, frissítse az oldalt.');
        } else {
          toast.error('Hiba történt a fotó feltöltése során');
        }
        
        setUploadProgress(null);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!deletePhotoId) return;

    try {
      await deletePhoto.mutateAsync(deletePhotoId);
      toast.success('Kép sikeresen törölve');
      setDeletePhotoId(null);
    } catch (error) {
      toast.error('Hiba történt a kép törlése során');
      console.error(error);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);

    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    const photoIds = photos.map(p => p.id);
    
    try {
      await rearrangePhotos.mutateAsync(photoIds);
      toast.success('Képek sorrendje frissítve');
    } catch (error) {
      toast.error('Hiba történt az átrendezés során');
      console.error(error);
    }

    setDraggedIndex(null);
  };

  const handleAddToAlbum = (photoId: bigint) => {
    setSelectedPhotoForAlbum(photoId);
    setShowAlbumSelectDialog(true);
  };

  const handleAlbumSelect = async (albumId: bigint) => {
    if (!selectedPhotoForAlbum) return;

    try {
      await movePhotoToAlbum.mutateAsync({
        photoId: selectedPhotoForAlbum,
        albumId,
      });
      toast.success('Kép sikeresen hozzáadva az albumhoz!');
      setShowAlbumSelectDialog(false);
      setSelectedPhotoForAlbum(null);
    } catch (error: any) {
      console.error('Add to album error:', error);
      toast.error('Hiba történt a kép albumhoz adása során');
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const goToPrevious = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos.length]);

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
          <h2 className="text-3xl font-bold text-heritage-dark">Képek</h2>
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
                Képek feltöltése
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-heritage-dark border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Képek betöltése...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground text-lg">Még nincsenek képek feltöltve</p>
          <p className="text-sm text-muted-foreground mt-2">Kattintson a "Képek feltöltése" gombra az első kép hozzáadásához</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo, index) => (
            <div
              key={photo.id.toString()}
              draggable={isReordering}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-square rounded-lg overflow-hidden bg-muted shadow-md hover:shadow-xl transition-all ${
                isReordering ? 'cursor-move' : 'cursor-pointer'
              } ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <img
                src={photo.storageRef.getDirectURL()}
                alt={photo.filename}
                className="w-full h-full object-cover"
                onClick={() => !isReordering && openLightbox(index)}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium truncate">{photo.filename}</p>
                </div>
              </div>

              {!isReordering && (
                <>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToAlbum(photo.id);
                    }}
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hozzáadás albumhoz"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletePhotoId(photo.id);
                    }}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}

              {isReordering && (
                <div className="absolute top-2 left-2 bg-heritage-dark text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 rounded-full bg-heritage-dark/80 hover:bg-heritage-dark p-3 text-white transition-all hover:scale-110 shadow-lg"
            title="Bezárás"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Bezárás</span>
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-heritage-dark/80 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 z-50 rounded-full bg-heritage-dark/80 hover:bg-heritage-dark p-3 text-white transition-all hover:scale-110 shadow-lg"
              title="Előző"
            >
              <ChevronLeft className="h-8 w-8" />
              <span className="sr-only">Előző</span>
            </button>
          )}

          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 z-50 rounded-full bg-heritage-dark/80 hover:bg-heritage-dark p-3 text-white transition-all hover:scale-110 shadow-lg"
              title="Következő"
            >
              <ChevronRight className="h-8 w-8" />
              <span className="sr-only">Következő</span>
            </button>
          )}

          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].storageRef.getDirectURL()}
              alt={photos[lightboxIndex].filename}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-heritage-dark/90 text-white px-6 py-3 rounded-full shadow-lg max-w-md">
              <p className="text-sm font-medium text-center truncate">
                {photos[lightboxIndex].filename}
              </p>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showAlbumSelectDialog} onOpenChange={setShowAlbumSelectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hozzáadás albumhoz</DialogTitle>
            <DialogDescription>
              Válassza ki az albumot, amelyhez hozzá szeretné adni a képet
            </DialogDescription>
          </DialogHeader>

          {albums.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Még nincsenek albumok létrehozva</p>
              <p className="text-sm text-muted-foreground mt-2">Először hozzon létre egy albumot az Albumok szekcióban</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-2">
                {albums.map((album) => (
                  <button
                    key={album.id.toString()}
                    onClick={() => handleAlbumSelect(album.id)}
                    disabled={movePhotoToAlbum.isPending}
                    className="w-full p-4 text-left rounded-lg border-2 border-border hover:border-heritage-medium hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-heritage-dark">{album.name}</p>
                        <p className="text-sm text-muted-foreground">{album.contents.length} elem</p>
                      </div>
                      {movePhotoToAlbum.isPending && (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-heritage-dark border-t-transparent" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePhotoId} onOpenChange={() => setDeletePhotoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törli ezt a képet?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet nem vonható vissza. A kép véglegesen törlődik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
