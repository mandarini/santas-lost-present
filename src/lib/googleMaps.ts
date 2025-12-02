export const LONDON_BOUNDS = {
  north: 51.7,
  south: 51.3,
  west: -0.5,
  east: 0.3,
};

export const LONDON_CENTER = {
  lat: 51.5,
  lng: -0.1,
};

export async function loadGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    throw new Error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
  }

  if (!(window as any).google) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,geometry,places&v=weekly`;
    script.async = true;
    script.defer = true;

    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return (window as any).google.maps;
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (!(window as any).google?.maps?.geometry) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  const google = (window as any).google;
  const point1 = new google.maps.LatLng(lat1, lng1);
  const point2 = new google.maps.LatLng(lat2, lng2);
  return google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
}

export function getMarkerColor(distanceM: number): string {
  if (distanceM > 5000) return '#3B82F6';
  if (distanceM > 2000) return '#06B6D4';
  if (distanceM > 1000) return '#10B981';
  if (distanceM > 500) return '#84CC16';
  if (distanceM > 200) return '#F59E0B';
  if (distanceM > 100) return '#F97316';
  if (distanceM > 50) return '#EF4444';
  return '#DC2626';
}

export function randomLondonLocation() {
  return {
    lat: LONDON_BOUNDS.south + Math.random() * (LONDON_BOUNDS.north - LONDON_BOUNDS.south),
    lng: LONDON_BOUNDS.west + Math.random() * (LONDON_BOUNDS.east - LONDON_BOUNDS.west),
  };
}
