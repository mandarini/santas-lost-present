# Santa's Lost Present

A real-time, multiplayer Christmas treasure hunt game built with React, Supabase, and Google Maps.

## Game Overview

**Santa's Lost Present** is an interactive game where players use their phones to guess the location of a hidden present somewhere in Greater London. An admin controls the game on a big screen, showing all player markers color-coded by how close they are to the target (hot/cold system).

### Features

- **Real-time multiplayer** - All players see updates instantly via Supabase Realtime
- **Two game modes:**
  - **Normal Mode** - Target stays in one place
  - **Elf Mode** - Target moves every 20 seconds (powered by pg_cron)
- **Mobile-optimized** - Players use their phones to place guesses
- **Admin dashboard** - Control the game and display markers for the audience
- **Automatic nickname assignment** - Players get fun Christmas names like "JollyElfHunter"
- **Distance-based colors** - Markers show how close players are (blue = cold, red = hot)
- **Win detection** - Automatic finale when someone gets within 10 meters

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

### For Players (Mobile)

1. Navigate to the game URL on your phone
2. You'll automatically be assigned a Christmas nickname
3. Wait for the admin to start the round
4. Tap anywhere on the map to place your guess
5. Update your guess as many times as you want
6. Get within 10 meters to win!

### For Admin (Big Screen)

1. Navigate to `/admin` on the presentation screen
2. Log in with GitHub OAuth (email must be in admin allowlist)
3. Click "Start Normal Mode" or "Start Elf Mode"
4. Watch as player markers appear and change colors based on distance
5. The game automatically detects when someone wins
6. Use "Stop Round" or "Reset Round" to control the game

## Game Controls

### Admin Actions

- **Start Normal Mode** - Begin a round with a fixed target location
- **Start Elf Mode** - Begin a round where the target moves every 20 seconds
- **Stop Round** - End the current round manually
- **Reset Round** - Clear all guesses and return to idle state
- **Click Map** - Set a custom target location before starting

### Distance Colors

- 🔵 Blue (>5km) - Freezing
- 🔵 Cyan (2-5km) - Cold
- 🟢 Green (1-2km) - Cool
- 🟢 Lime (500m-1km) - Warm
- 🟠 Amber (200-500m) - Warmer
- 🟠 Orange (100-200m) - Hot
- 🔴 Red (50-100m) - Very Hot
- 🔴 Dark Red (<50m) - On Fire!

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
  - `/admin` - Admin dashboard (big screen)

- **Key Features:**
  - Device ID authentication for players
  - Real-time subscriptions for instant updates
  - Google Maps integration with custom markers
  - Responsive design for mobile and desktop

## Technical Details

### Distance Calculation

Distances are calculated client-side using Google Maps Geometry library:
- Players never see how close they are (blind guessing)
- Admin sees all distances and colors markers accordingly
- Win condition (≤10m) is detected by admin client

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
