import { useEffect, useRef, useState } from 'react';

// Spitalfields, London coordinates
const SPITALFIELDS_CENTER = {
  lat: 51.5197,
  lng: -0.0754,
  altitude: 50,
};

export default function Spitalfields3D() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let map3d: any = null;

    async function init3DMap() {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
          throw new Error('Google Maps API key is not configured.');
        }

        // Load Google Maps with 3D library using dynamic import
        if (!(window as any).google?.maps?.importLibrary) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.innerHTML = `
              (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\${c}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
                key: "${apiKey}",
                v: "beta",
                internalUsageAttributionIds: "gmp_mcp_codeassist_v0.1_github"
              });
            `;
            document.head.appendChild(script);

            // Wait for the loader to be available
            const checkGoogle = setInterval(() => {
              if ((window as any).google?.maps?.importLibrary) {
                clearInterval(checkGoogle);
                resolve();
              }
            }, 100);

            setTimeout(() => {
              clearInterval(checkGoogle);
              reject(new Error('Timeout loading Google Maps'));
            }, 10000);
          });
        }

        // Import the maps3d library
        const { Map3DElement } = await (window as any).google.maps.importLibrary('maps3d');

        // Camera settings for the fly-around
        const flyAroundCamera = {
          center: {
            lat: SPITALFIELDS_CENTER.lat,
            lng: SPITALFIELDS_CENTER.lng,
            altitude: SPITALFIELDS_CENTER.altitude,
          },
          range: 800,
          tilt: 65,
          heading: 0,
        };

        // Create the 3D map
        map3d = new Map3DElement({
          center: {
            lat: SPITALFIELDS_CENTER.lat,
            lng: SPITALFIELDS_CENTER.lng,
            altitude: SPITALFIELDS_CENTER.altitude + 200,
          },
          range: 1500,
          tilt: 55,
          heading: -45,
          mode: 'SATELLITE',
        });

        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = '';
          mapContainerRef.current.appendChild(map3d);
        }

        setIsLoading(false);

        // Start the fly-around animation after a short delay
        setTimeout(() => {
          if (map3d) {
            // First fly to the optimal viewing position
            map3d.flyCameraTo({
              endCamera: flyAroundCamera,
              durationMillis: 5000,
            });

            // When fly-to completes, start the continuous orbit
            map3d.addEventListener('gmp-animationend', () => {
              map3d.flyCameraAround({
                camera: flyAroundCamera,
                durationMillis: 60000,
                rounds: 2,
              });
            }, { once: true });
          }
        }, 1000);

        // Click to stop animation
        map3d.addEventListener('gmp-click', () => {
          map3d.stopCameraAnimation();
        });

      } catch (err) {
        console.error('Error initializing 3D map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load 3D map');
        setIsLoading(false);
      }
    }

    init3DMap();

    return () => {
      if (map3d) {
        map3d.stopCameraAnimation?.();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h1 className="text-2xl font-bold mb-4">Error Loading 3D Map</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading Spitalfields 3D...</p>
          </div>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />

      {!isLoading && (
        <div className="absolute bottom-6 left-6 bg-black/70 text-white px-4 py-3 rounded-lg backdrop-blur-sm">
          <h2 className="font-bold text-lg">Spitalfields, London</h2>
          <p className="text-sm text-gray-300">Click anywhere to stop the animation</p>
        </div>
      )}
    </div>
  );
}
