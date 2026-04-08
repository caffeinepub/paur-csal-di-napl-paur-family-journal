import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, FolderOpen, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useGetAllAlbums, useCreateAlbum, useDeleteAlbum } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Album } from '../backend';

interface AlbumsSectionProps {
  onBack: () => void;
}

export default function AlbumsSection({ onBack }: AlbumsSectionProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  const { data: albums = [], isLoading } = useGetAllAlbums();
  const createAlbumMutation = useCreateAlbum();
  const deleteAlbumMutation = useDeleteAlbum();

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      toast.error('Kérjük, adjon meg egy album nevet');
      return;
    }

    try {
      await createAlbumMutation.mutateAsync({ name: newAlbumName.trim() });
      toast.success('Az album sikeresen létrehozva');
      setNewAlbumName('');
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Hiba történt az album létrehozása során');
    }
  };

  const handleDeleteAlbum = async (albumId: bigint) => {
    try {
      const response = await deleteAlbumMutation.mutateAsync(albumId);
      
      if (response.__kind__ === 'success') {
        toast.success(response.success);
      } else if (response.__kind__ === 'error') {
        toast.error(response.error);
      } else if (response.__kind__ === 'permissionDenied') {
        toast.error(response.permissionDenied);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Hiba történt az album törlése során');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-heritage-light/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-heritage-dark">Albumok</h1>
            <p className="text-muted-foreground mt-1">
              Rendezze és kezelje a családi albumokat
            </p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-heritage-medium hover:bg-heritage-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              Új Album
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Új Album Létrehozása</DialogTitle>
              <DialogDescription>
                Adjon meg egy nevet az új albumnak
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="album-name">Album Neve</Label>
                <Input
                  id="album-name"
                  placeholder="pl. Nyári Vakáció 2025"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateAlbum();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewAlbumName('');
                }}
              >
                Mégse
              </Button>
              <Button
                onClick={handleCreateAlbum}
                disabled={createAlbumMutation.isPending || !newAlbumName.trim()}
                className="bg-heritage-medium hover:bg-heritage-dark text-white"
              >
                {createAlbumMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Létrehozás
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-heritage-medium" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && albums.length === 0 && (
        <Card className="border-2 border-dashed border-heritage-light/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-heritage-light/20 flex items-center justify-center mb-4">
              <FolderOpen className="w-10 h-10 text-heritage-medium" />
            </div>
            <h3 className="text-xl font-semibold text-heritage-dark mb-2">
              Még nincsenek albumok
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Hozza létre az első albumot, hogy rendszerezhesse a családi fotókat és videókat
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-heritage-medium hover:bg-heritage-dark text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Első Album Létrehozása
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Albums Grid */}
      {!isLoading && albums.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album: Album) => (
            <Card
              key={album.id.toString()}
              className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-heritage-medium"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-heritage-light/30 flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-6 h-6 text-heritage-dark" />
                    </div>
                    <CardTitle className="text-lg truncate">{album.name}</CardTitle>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Biztosan törli az albumot?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ez a művelet nem vonható vissza. Az album törlésre kerül, de a benne lévő
                          fotók és videók megmaradnak.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Mégse</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="bg-destructive hover:bg-destructive/90"
                          disabled={deleteAlbumMutation.isPending}
                        >
                          {deleteAlbumMutation.isPending && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          Törlés
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {album.contents.length === 0 ? (
                    <p>Üres album</p>
                  ) : (
                    <p>
                      {album.contents.length} elem
                      {album.contents.length > 1 ? '' : ''}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
