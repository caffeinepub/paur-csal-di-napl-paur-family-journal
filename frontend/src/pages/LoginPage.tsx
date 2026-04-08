import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-heritage-light via-background to-heritage-lighter p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/generated/paur-logo-transparent.dim_200x200.png" 
            alt="Paur Logo" 
            className="w-48 h-48 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Welcome Text */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-heritage-dark tracking-tight">
            Paur
          </h1>
          <p className="text-xl text-heritage-medium font-medium">
            Családi Fotóalbum
          </p>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Üdvözöljük a Paur család privát fotó- és videógyűjteményében. 
            Kérjük, jelentkezzen be a folytatáshoz.
          </p>
        </div>

        {/* Login Button */}
        <div className="pt-8">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full max-w-xs mx-auto bg-heritage-dark hover:bg-heritage-darker text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            {isLoggingIn ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Bejelentkezés...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                Bejelentkezés
              </>
            )}
          </Button>
        </div>

        {/* Tree Image */}
        <div className="pt-12">
          <img 
            src="/assets/generated/heritage-tree.dim_800x600.jpg" 
            alt="Családfa" 
            className="w-full max-w-md mx-auto rounded-lg shadow-2xl opacity-90"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>© 2025. Készült szeretettel a <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">caffeine.ai</a> segítségével.</p>
      </footer>
    </div>
  );
}
