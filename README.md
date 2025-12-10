# Santa's Lost Present

A real-time, multiplayer Christmas treasure hunt game built with React, Supabase, and Google Maps.

## Game Overview

**Santa's Lost Present** is an interactive game where players use their phones to guess the location of a hidden present somewhere in Greater London. An admin controls the game on a big screen, showing all player markers color-coded by how close they are to the target (hot/cold system).

### Features

- **Real-time multiplayer** - All players see updates instantly via Supabase Realtime
- **Three game modes:**
  - **Normal Mode** - Target stays in one place
  - **Elf Mode** - Target moves every 20 seconds (powered by pg_cron)
  - **Polygon Hunt Mode** - Collaborative mode with hidden polygon area
- **Mobile-optimized** - Players use their phones to place guesses
- **Admin dashboard** - Control the game and display markers for the audience
- **Automatic nickname assignment** - Players get fun Christmas names like "JollyElfHunter"
- **Distance-based colors** - Markers show how close players are (blue = cold, red = hot)
- **Win detection** - Automatic finale when someone gets within 1 kilometer (Normal/Elf) or 10 players fill polygon

## Prerequisites

1. **Supabase Project** - Already configured with database and edge functions
2. **Google Maps API Key** - Required for map functionality
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API
   - Create API key with Maps, Marker, and Geometry libraries
3. **Optional: Custom Map ID** - For Christmas-styled map appearance

## Setup Instructions

### 1. Configure Environment Variables

Update the `.env` file with your Google Maps credentials:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here  # Optional
```

### 2. Add Admin User

To access the admin dashboard, add your email to the admin allowlist:

```sql
INSERT INTO admin_allowlist (email) VALUES ('your-email@example.com');
```

Run this query in your Supabase SQL Editor.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## How to Play

📖 **For detailed game instructions covering all three game modes, see [INSTRUCTIONS.md](INSTRUCTIONS.md)**

### Quick Start

**For Players (Mobile):**
1. Navigate to the game URL on your phone
2. Click "Join the Hunt!" to get assigned a Christmas nickname
3. Wait for the admin to start the round
4. Tap anywhere on the map to place your guess
5. Update your guess as many times as you want
6. Get within 1 kilometer to win (Normal/Elf mode) or help fill the polygon (Polygon mode)!

**For Admin (Big Screen):**
1. Navigate to `/admin` on the presentation screen
2. Log in with GitHub OAuth (email must be in admin allowlist)
3. Click "Start Normal Mode", "Start Elf Mode", or "Start Polygon Mode"
4. Watch as player markers appear and change colors based on distance
5. The game automatically detects when someone wins
6. Use "Stop Round" or "Reset Round" to control the game

## Game Controls

### Admin Actions

- **Start Normal Mode** - Begin a round with a fixed target location
- **Start Elf Mode** - Begin a round where the target moves every 20 seconds
- **Start Polygon Mode** - Begin a collaborative round with a hidden polygon area
- **Stop Round** - End the current round manually
- **Reset Round** - Clear all guesses and return to idle state
- **Click Map** - Set a custom target location before starting
- **Toggle Show Distance** - Enable/disable exact distance display for players

## Architecture

### Backend (Supabase)

- **Database Tables:**
  - `rounds` - Single active round state
  - `players` - Player information and nicknames
  - `guesses` - Player guess locations
  - `nickname_words` - Christmas-themed name components
  - `rate_limits` - Anti-abuse protection
  - `admin_allowlist` - Admin authorization

- **Edge Functions:**
  - `assign_nickname` - Creates player with unique Christmas name
  - `submit_guess` - Validates and stores player guesses
  - `admin_actions` - Protected admin operations

- **pg_cron Jobs:**
  - Target movement (every 20s in Elf mode)
  - Rate limit cleanup (hourly)

### Frontend (React)

- **Routes:**
  - `/` - Join page with nickname assignment
  - `/game` - Player game view (mobile)
  - `/instructions` - Detailed game instructions
  - `/admin` - Admin dashboard (big screen)

- **Key Features:**
  - Device ID authentication for players
  - Real-time subscriptions for instant updates
  - Google Maps integration with custom markers
  - Responsive design for mobile and desktop

## Technical Details

### Distance Calculation

**Normal/Elf Modes:** Distances are calculated using the Haversine formula or [Google Maps Geometry library](https://developers.google.com/maps/documentation/javascript/geometry) (when available). See the implementation:

- **[`calculateDistance()`](src/lib/googleMaps.ts#L36-L61)** - Calculates distance between two lat/lng coordinates in meters using [`google.maps.geometry.spherical.computeDistanceBetween()`](https://developers.google.com/maps/documentation/javascript/reference/geometry#spherical.computeDistanceBetween)
- **[`getMarkerColor()`](src/lib/googleMaps.ts#L63-L80)** - Generates HSL color gradient from red (close) to blue (far), max distance 30km
- **[`getTemperatureLabel()`](src/lib/googleMaps.ts#L82-L92)** - Returns temperature label based on distance thresholds (1km, 2km, 5km, 10km, 15km, 20km, 25km, 30km)

**Polygon Mode:** Uses Google Maps Geometry library's [`containsLocation()`](https://developers.google.com/maps/documentation/javascript/geometry#containsLocation) method to check if a player's guess point is inside the polygon. See [`AdminDashboard.tsx`](src/pages/AdminDashboard.tsx#L136-L138):

- [`google.maps.geometry.poly.containsLocation(point, polygon)`](https://developers.google.com/maps/documentation/javascript/geometry#containsLocation) - Checks if a lat/lng point is inside a polygon (returns `true` if the point is within the polygon or on its edge)
- Players inside the polygon are marked green, outside are marked gray

**Distance thresholds (Normal/Elf modes):**
- ≤ 1 km → 🎁 YOU WIN!
- ≤ 2 km → 🔥 BURNING HOT!
- ≤ 5 km → 🔥 Very Hot!
- ≤ 10 km → 🌡️ Hot
- ≤ 15 km → 🌡️ Warm
- ≤ 20 km → 😐 Lukewarm
- ≤ 25 km → ❄️ Cool
- ≤ 30 km → 🥶 Very Cold
- > 30 km → 🧊 Freezing!

**Win detection:**
- **Normal/Elf Mode:** Win detected when distance ≤ 1000m (1km) - see [`AdminDashboard.tsx`](src/pages/AdminDashboard.tsx#L179)
- **Polygon Mode:** Win detected when 10 players are inside polygon using `containsLocation()` - see [`AdminDashboard.tsx`](src/pages/AdminDashboard.tsx#L153)

### Rate Limiting

- Player creation: 10 per IP per minute
- Guess submission: 2 per second per player
- Automatic cleanup of old rate limit records

### Security

- All database tables have Row Level Security (RLS) enabled
- Public read-only access for game state
- All writes go through Edge Functions with validation
- Admin actions require authentication and email allowlist

## Troubleshooting

### Google Maps Not Loading

- Verify `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Check that Maps JavaScript API is enabled in Google Cloud Console
- Ensure API key has proper restrictions (not too strict)

### Players Can't Join

- Check Supabase connection in browser console
- Verify Edge Functions are deployed correctly
- Check rate limiting isn't blocking requests

### Admin Can't Start Game

- Verify email is in `admin_allowlist` table
- Check authentication is working (GitHub OAuth)
- Confirm Edge Functions are accessible

## License

MIT

## Credits

Built with:
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
