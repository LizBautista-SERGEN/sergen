
'use client'

import { Suspense, lazy, useState, useEffect } from 'react'

const Spline = lazy(() => {
  return new Promise((resolve) => {
    import('@splinetool/react-spline')
      .then((module) => {
        resolve(module);
      })
      .catch((error) => {
        console.error('Error loading Spline:', error);
        // Resolver con un componente de fallback en caso de error
        resolve({
          default: () => (
            <div className="w-full h-full flex items-center justify-center bg-black/[0.96] rounded-lg">
              <div className="text-center">
                <p className="text-gray-400">Error al cargar el modelo 3D</p>
                <p className="text-sm text-gray-500">Por favor, recarga la página</p>
              </div>
            </div>
          ),
        });
      });
  });
});

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Verificar si la escena está accesible
    fetch(scene)
      .then(response => {
        if (!response.ok) {
          throw new Error('Scene not found');
        }
        setHasError(false);
      })
      .catch(() => {
        setHasError(true);
        console.error('Error loading scene:', scene);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [scene]);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/[0.96] rounded-lg">
        <div className="text-center">
          <p className="text-gray-400">Error al cargar la escena 3D</p>
          <p className="text-sm text-gray-500">Por favor, verifica la URL de la escena</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-black/[0.96] rounded-lg">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <span className="loader"></span>
              <p className="text-gray-400 mt-4">Cargando modelo 3D...</p>
            </div>
          ) : (
            <p className="text-gray-400">Inicializando...</p>
          )}
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  )
}
