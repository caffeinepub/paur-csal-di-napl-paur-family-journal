import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PhotosSection from '../components/PhotosSection';
import VideosSection from '../components/VideosSection';
import RecipesSection from '../components/RecipesSection';
import AlbumsSection from '../components/AlbumsSection';
import { Images, Video, ChefHat, FolderOpen } from 'lucide-react';

type Section = 'home' | 'photos' | 'videos' | 'recipes' | 'albums';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<Section>('home');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {activeSection === 'home' && (
          <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16 space-y-6">
              <img 
                src="/assets/generated/paur-logo-transparent.dim_200x200.png" 
                alt="Paur Logo" 
                className="w-32 h-32 mx-auto object-contain drop-shadow-lg"
              />
              <h1 className="text-5xl md:text-6xl font-bold text-heritage-dark tracking-tight">
                Paur Családi Napló
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Őrizze meg és ossza meg családja legszebb pillanatait, emlékeit és receptjeit
              </p>
            </div>

            {/* Tree Image */}
            <div className="mb-16 max-w-4xl mx-auto">
              <img 
                src="/assets/generated/heritage-tree.dim_800x600.jpg" 
                alt="Családfa" 
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <button
                onClick={() => setActiveSection('photos')}
                className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-heritage-medium transition-all duration-300 shadow-lg hover:shadow-2xl p-8 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-heritage-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-heritage-light/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Images className="w-10 h-10 text-heritage-dark" />
                  </div>
                  <h2 className="text-2xl font-bold text-heritage-dark mb-3">Fotók</h2>
                  <p className="text-muted-foreground">
                    Tekintse meg és kezelje a családi fotókat
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveSection('videos')}
                className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-heritage-medium transition-all duration-300 shadow-lg hover:shadow-2xl p-8 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-heritage-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-heritage-light/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-10 h-10 text-heritage-dark" />
                  </div>
                  <h2 className="text-2xl font-bold text-heritage-dark mb-3">Videók</h2>
                  <p className="text-muted-foreground">
                    Nézze meg és rendezze a családi videókat
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveSection('recipes')}
                className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-heritage-medium transition-all duration-300 shadow-lg hover:shadow-2xl p-8 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-heritage-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-heritage-light/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChefHat className="w-10 h-10 text-heritage-dark" />
                  </div>
                  <h2 className="text-2xl font-bold text-heritage-dark mb-3">Receptek</h2>
                  <p className="text-muted-foreground">
                    Családi receptek és kulináris hagyományok
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveSection('albums')}
                className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-heritage-medium transition-all duration-300 shadow-lg hover:shadow-2xl p-8 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-heritage-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-heritage-light/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-10 h-10 text-heritage-dark" />
                  </div>
                  <h2 className="text-2xl font-bold text-heritage-dark mb-3">Albumok</h2>
                  <p className="text-muted-foreground">
                    Rendezze és kezelje a családi albumokat
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeSection === 'photos' && <PhotosSection onBack={() => setActiveSection('home')} />}
        {activeSection === 'videos' && <VideosSection onBack={() => setActiveSection('home')} />}
        {activeSection === 'recipes' && <RecipesSection onBack={() => setActiveSection('home')} />}
        {activeSection === 'albums' && <AlbumsSection onBack={() => setActiveSection('home')} />}
      </main>

      <Footer />
    </div>
  );
}
