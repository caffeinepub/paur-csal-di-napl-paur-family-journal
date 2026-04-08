import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Header() {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/paur-logo-transparent.dim_200x200.png" 
            alt="Paur" 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-2xl font-bold text-heritage-dark">Paur</h1>
        </div>

        <div className="flex items-center gap-4">
          {userProfile && (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-heritage-light">
                <AvatarFallback className="bg-heritage-light text-heritage-dark font-semibold">
                  {getInitials(userProfile.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                {userProfile.name}
              </span>
            </div>
          )}
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-heritage-medium hover:bg-heritage-light hover:text-heritage-dark"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Kijelentkezés
          </Button>
        </div>
      </div>
    </header>
  );
}
