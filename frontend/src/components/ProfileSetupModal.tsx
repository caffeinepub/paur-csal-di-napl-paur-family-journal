import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Kérem, adja meg a nevét');
      return;
    }

    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success('Profil sikeresen létrehozva!');
    } catch (error) {
      toast.error('Hiba történt a profil létrehozása során');
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-heritage-dark">Üdvözöljük!</DialogTitle>
          <DialogDescription>
            Kérem, adja meg a nevét a folytatáshoz.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Név</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Teljes név"
              autoFocus
              disabled={saveProfile.isPending}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-heritage-dark hover:bg-heritage-darker"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Mentés...' : 'Folytatás'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
