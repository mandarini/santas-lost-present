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
  // Smooth gradient from blue (cold/far) to red (hot/close)
  // Max distance considered is 30km, min is 0m
  const maxDistance = 30000; // 30km
  const minDistance = 0;

  // Clamp distance between min and max
  const clampedDistance = Math.max(minDistance, Math.min(maxDistance, distanceM));

  // Calculate ratio (0 = close/hot, 1 = far/cold)
  const ratio = clampedDistance / maxDistance;

  // HSL color: 0 = red, 240 = blue
  // We go from red (0) when close to blue (240) when far
  const hue = ratio * 240;

  return `hsl(${hue}, 100%, 50%)`;
}

export function getTemperatureLabel(distanceM: number): string {
  if (distanceM <= 1000) return '🎁 YOU WIN!';
  if (distanceM <= 2000) return '🔥 BURNING HOT!';
  if (distanceM <= 5000) return '🔥 Very Hot!';
  if (distanceM <= 10000) return '🌡️ Hot';
  if (distanceM <= 15000) return '🌡️ Warm';
  if (distanceM <= 20000) return '😐 Lukewarm';
  if (distanceM <= 25000) return '❄️ Cool';
  if (distanceM <= 30000) return '🥶 Very Cold';
  return '🧊 Freezing!';
}

export function randomLondonLocation() {
  return {
    lat: LONDON_BOUNDS.south + Math.random() * (LONDON_BOUNDS.north - LONDON_BOUNDS.south),
    lng: LONDON_BOUNDS.west + Math.random() * (LONDON_BOUNDS.east - LONDON_BOUNDS.west),
  };
}
