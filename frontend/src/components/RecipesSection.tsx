import { Button } from '@/components/ui/button';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RecipesSectionProps {
  onBack: () => void;
}

export default function RecipesSection({ onBack }: RecipesSectionProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="icon"
            className="border-heritage-medium hover:bg-heritage-light"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-heritage-dark flex items-center gap-3">
              <ChefHat className="h-10 w-10" />
              Receptek
            </h1>
            <p className="text-muted-foreground mt-1">
              Családi receptek és kulináris hagyományok
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Card className="max-w-2xl mx-auto mt-16 border-2 border-heritage-light">
        <CardHeader className="text-center pb-4">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-heritage-light/30 flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-heritage-dark" />
          </div>
          <CardTitle className="text-3xl text-heritage-dark">Hamarosan elérhető</CardTitle>
          <CardDescription className="text-lg mt-2">
            A Receptek funkció jelenleg fejlesztés alatt áll
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Hamarosan megoszthatja családja kedvenc receptjeit és kulináris hagyományait. 
            A funkció lehetővé teszi majd:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-heritage-medium mt-1">•</span>
              <span>Receptek létrehozása hozzávalókkal és elkészítési útmutatóval</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-heritage-medium mt-1">•</span>
              <span>Fotók feltöltése az elkészült ételekről</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-heritage-medium mt-1">•</span>
              <span>Receptek értékelése és hozzászólások írása</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-heritage-medium mt-1">•</span>
              <span>Keresés és szűrés kategóriák és hozzávalók szerint</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-heritage-medium mt-1">•</span>
              <span>Receptek szerkesztése és megosztása a családdal</span>
            </li>
          </ul>
          <div className="pt-4">
            <Button
              onClick={onBack}
              className="bg-heritage-dark hover:bg-heritage-darker text-white"
            >
              Vissza a főoldalra
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
