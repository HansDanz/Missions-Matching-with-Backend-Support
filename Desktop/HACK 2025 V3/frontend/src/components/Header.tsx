import { ImageWithFallback } from './figma/ImageWithFallback';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ImageWithFallback
              src="https://iili.io/KOqDIjf.png"
              alt="Mission Matching Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="app-title text-3xl">Mission Matching</h1>
          </div>
          
          <div className="w-12"></div>
        </div>
      </div>
    </header>
  );
}
