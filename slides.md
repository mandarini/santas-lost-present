# Multiplayer Xmas (Geo)-spatial Supabase Edition

**Presented by Katerina Skroumpelou**

---

## About Me

**Katerina Skroumpelou**

- Software Engineer at **Supabase**
- **Google Developer Expert** for Angular & **Maps**
- Loves cats, chocolate, and being on stage
- psyber.city | @psybercity

**Speaker Notes:**
Quick intro - I'm Katerina, working at Supabase, and I'm a GDE for both Angular and Google Maps. Today we're combining two of my favorite technologies to build something festive and fun - a real-time Christmas treasure hunt game!

---

## What We're Building Today

**Santa's Lost Present** - A real-time multiplayer geospatial treasure hunt

- Players join via QR code on their phones
- Drop guesses on a map of London
- Watch markers change from blue to red as players get closer to the present
- Three game modes: Normal, Elf Mode (moving target!), and Polygon Hunt

**Speaker Notes:**
Before we dive into the tech, let me show you what we're building. It's a multiplayer game where everyone in this room can play simultaneously. You'll see how Supabase and Google Maps work together to create a smooth, real-time experience.

---

## The Power of Supabase

**Build in a weekend. Scale to millions.**

Supabase is the open-source Postgres development platform developers love

**What makes it special:**
- Production-ready Postgres backend
- Everything integrated: Auth, Storage, Realtime, Edge Functions
- Open source, no vendor lock-in
- **Your real backend is also your test backend**

**Speaker Notes:**
For those new to Supabase - it's everything you need for a backend, built on top of Postgres. The key difference from other platforms? It's all open source, which means you can self-host or migrate anytime. No lock-in. And because it uses standard Postgres, you get 30+ years of database stability and all the extensions you could want.

---

## Supabase: What's Inside?

| Feature | What it does |
|---------|--------------|
| **Database** | Full Postgres with 50+ extensions (PostGIS, pgvector, etc.) |
| **Auth** | Email/password, OAuth, Magic Links, Enterprise SSO |
| **Storage** | S3-compatible file storage with RLS |
| **Edge Functions** | Server-side TypeScript/Deno at the edge |
| **Realtime** | WebSockets for live updates & multiplayer |
| **Auto-generated APIs** | REST and GraphQL from your schema |

**Speaker Notes:**
Here's what you get with Supabase. For our game today, we're using three key features: Realtime for live updates, Edge Functions for game logic validation, and PostGIS for geospatial queries. But the beauty is - all of this runs locally too. Same Docker images. That's production parity you can trust.

---

## The Supabase Features We're Using

**1. Realtime Channels** 
- Live synchronization of player guesses
- Instant game state updates for all players
- Built on Postgres logical replication

**2. Edge Functions**
- Validate guesses server-side
- Calculate distances from target
- Rate limiting and security

**3. PostGIS Extension**
- Store geographic coordinates efficiently
- Fast geospatial queries at scale
- Distance calculations and polygon containment

**Speaker Notes:**
Let me break down the three Supabase features powering our game. Realtime gives us instant updates - when anyone drops a pin, everyone sees it immediately. Edge Functions handle the game logic - we can't trust the client to calculate distances fairly! And PostGIS is Postgres's geospatial extension - it's incredibly efficient for location-based queries.

---

## Realtime in Action

```typescript
// Subscribe to game state changes
const channel = supabase
  .channel('game-state')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'guesses' 
    }, 
    (payload) => {
      // Update UI with new guess
      updatePlayerMarkers(payload.new)
    }
  )
  .subscribe()
```

**Real Postgres replication** → **WebSocket** → **Your app**

**Speaker Notes:**
Here's how simple Realtime is. You subscribe to changes on your database tables, and Supabase streams them to you via WebSockets. Under the hood, it's using Postgres logical replication - the same technology that powers database replicas. When a player submits a guess, it hits our Edge Function, gets stored in Postgres, and Realtime broadcasts it to everyone instantly.

---

## PostGIS: Geospatial Superpowers in Postgres

**Why PostGIS?**
- Efficient storage of geographic data types (Point, Polygon, LineString)
- Spatial indexing for blazing fast queries
- Distance calculations using real Earth geometry
- Polygon containment checks

```sql
-- Find guesses within 1km of target
SELECT * FROM guesses
WHERE ST_Distance(
  location, 
  ST_Point(-0.0754, 51.5197)::geography
) <= 1000;
```

**Speaker Notes:**
PostGIS is a game-changer for location-based apps. Instead of storing lat/long as two decimal fields, you store them as a geography type. PostGIS can then use spatial indexes to query millions of points efficiently. For our game, we use it to calculate distances from the target and check if points fall within a polygon.

---

## Now... Let's Talk About Google Maps! 🗺️

**The platform you didn't know could do all this**

**Speaker Notes:**
Okay, now for the fun part - Google Maps Platform! Most developers know Google Maps for basic map display, but it's evolved into an incredibly powerful platform. Let me show you what's possible.

---

## What Can You Do With Google Maps Platform?

**Beyond "just a map":**

- **Photorealistic 3D cities** with Street View imagery
- **Custom map styling** to match your brand
- **Advanced markers** with HTML/CSS
- **WebGL overlays** for custom 3D graphics
- **Geometry calculations** (distances, polygons, routing)
- **AI integration** via Vertex AI and MCP

**Speaker Notes:**
Google Maps Platform has evolved dramatically. You can render photorealistic 3D cities, create custom styled maps that match your brand, add interactive 3D objects with WebGL, and now even integrate with AI through Vertex AI and Model Context Protocol. Let's dive into the features we're using in the game.

---

## Feature #1: Advanced Markers with HTML Content

**Dynamic, customizable markers that are fast and beautiful**

```typescript
const marker = new google.maps.marker.AdvancedMarkerElement({
  map,
  position: { lat: 51.5197, lng: -0.0754 },
  content: markerContent, // Your custom HTML!
  title: player.nickname
});

// Change color based on distance
markerContent.style.background = getMarkerColor(distance);
```

**What makes them special:**
- Render custom HTML/CSS
- Dynamic updates without recreating
- Hardware-accelerated rendering
- Click events and interactions

**Speaker Notes:**
Advanced Markers let you use HTML and CSS for your map markers. In our game, each player gets a marker with their nickname, and the background color changes from blue to red based on how close they are to the target. It's all hardware-accelerated, so even with 100 players, it stays smooth.

---

## Feature #2: Geometry Library

**Mathematical operations on geographic coordinates**

```typescript
// Calculate distance between two points
const distance = google.maps.geometry.spherical
  .computeDistanceBetween(
    playerGuess,
    targetLocation
  ); // Returns meters

// Check if point is inside polygon
const isInside = google.maps.geometry.poly
  .containsLocation(
    playerGuess,
    polygonShape
  ); // Returns true/false
```

**Powered by real spherical geometry** - accurate calculations on Earth's surface

**Speaker Notes:**
The Geometry library handles the math so you don't have to. For distance-based gameplay, we use computeDistanceBetween which uses the Haversine formula - it accounts for Earth's curvature. For Polygon Hunt mode, containsLocation checks if a point is inside our gift-shaped polygon. Both are incredibly fast and accurate.

---

## Feature #3: WebGL Overlay View

**Render custom 3D graphics on the map**

```typescript
const webglOverlay = new google.maps.WebGLOverlayView();

webglOverlay.onDraw = ({ gl, transformer }) => {
  // Your custom WebGL rendering
  const matrix = transformer.fromLatLngAltitude({
    lat: 51.5197, 
    lng: -0.0754, 
    altitude: 100
  });
  
  // Render 3D present at location
  camera.projectionMatrix = new THREE.Matrix4()
    .fromArray(matrix);
  renderer.render(scene, camera);
};
```

**Perfect for:** 3D objects, particle effects, custom visualizations

**Speaker Notes:**
This is where it gets really cool. WebGL Overlay View lets you add custom 3D graphics to your map. When someone wins our game, we show a 3D rotating present at the target location using Three.js. The transformer function georegister your 3D objects so they stay locked to map coordinates as users pan and zoom.

---

## Feature #4: Cloud-Based Map Styling with Map IDs

**Create custom map themes without touching code**

- Design in Google Cloud Console
- Reusable across platforms (Web, Android, iOS)
- Live updates without app redeployment
- Support for light/dark modes

```typescript
const map = new google.maps.Map(mapRef.current, {
  center: LONDON_CENTER,
  zoom: 10,
  mapId: 'YOUR_CUSTOM_MAP_ID' // That's it!
});
```

**Speaker Notes:**
Map IDs let you create custom styled maps in the Cloud Console and reference them by ID. Want a Christmas theme? Change colors to red and green, add snow effect - all visual, no code. The best part? You can update the style and every app using that Map ID picks up the changes automatically. No redeployment needed.

---

## Feature #5: 3D Maps (Photorealistic Tiles)

**Fly through cities with photorealistic 3D buildings**

```typescript
const { Map3DElement } = await google.maps
  .importLibrary('maps3d');

const map3d = new Map3DElement({
  center: { 
    lat: 51.5197, 
    lng: -0.0754, 
    altitude: 50 
  },
  tilt: 65,
  heading: 0,
  mode: 'SATELLITE'
});

// Animate camera fly-around
map3d.flyCameraAround({
  camera: flyAroundCamera,
  durationMillis: 60000,
  rounds: 2
});
```

**Speaker Notes:**
3D Maps use Google's photorealistic 3D tiles - actual imagery draped over 3D building models. You can fly through cities, tilt and rotate the camera, and create cinematic experiences. I'm using this for a bonus demo where we fly around Spitalfields Market in London. It's the same technology behind Google Earth, now available in your web apps.

---

## The Magic: Google Maps + AI 🤖

**Three ways AI enhances Google Maps development**

**1. Model Context Protocol (MCP)**
- Ask questions, get accurate answers from official docs
- Code samples tailored to your use case
- Available in Claude, Cursor, and other AI tools

**2. Vertex AI Grounding**
- Ground Gemini models with geospatial data
- Access 250+ million places
- Get location context in AI responses

**3. Imagery Insights (Preview)**
- Analyze Street View imagery with AI
- Identify objects, assess conditions
- Perfect for infrastructure monitoring

**Speaker Notes:**
This is the future of development. Google Maps now has MCP integration - that's Model Context Protocol - which lets AI assistants like Claude access official Google Maps documentation in real-time. Instead of hoping the AI's training data is current, it can fetch the latest docs. Combined with Vertex AI grounding, you can build AI apps that understand geography and location context.

---

## Google Maps MCP in Action

**I used it to build this presentation!**

```
"Retrieve Google Maps Platform documentation on:
- Advanced Markers with custom HTML
- Geometry library distance calculations  
- WebGL Overlay View
- 3D Maps camera animations"
```

**→ Gets latest docs + code samples + best practices**

**Available in:**
- Claude Desktop
- Cursor AI
- Any MCP-compatible tool

**Speaker Notes:**
Full disclosure - I actually used the Google Maps MCP to help prepare this presentation! Instead of digging through docs, I asked Claude to retrieve information about specific features, and it pulled the latest documentation, complete with code samples. It's like having a Google Maps expert sitting next to you while you code.

---

## Let's See It In Action! 🎮

**Time to play Santa's Lost Present**

1. **Scan the QR code** with your phone
2. **Get your festive nickname** (auto-assigned)
3. **Drop a pin** where you think the present is
4. **Watch your marker** change color based on distance
5. **First to get within 1km wins!**

*(Switch to live demo)*

**Speaker Notes:**
Alright, let's play! Everyone grab your phones and scan this QR code. You'll be assigned a festive nickname - something like JollyElfHunter or FrostyGiftSeeker. Once you're in, tap anywhere on the map to place your guess. Your marker will change color - blue means cold, red means hot. The target is somewhere in London. Who can find it first?

---

## Behind the Scenes: How It Works

**The Architecture**

```
Player Phone
    ↓
Edge Function (validate guess)
    ↓
Postgres + PostGIS (store location)
    ↓
Realtime (broadcast to all players)
    ↓
Admin Dashboard (Google Maps visualization)
```

**Key Points:**
- No polling! Realtime uses WebSockets
- Server validates distances (no cheating!)
- PostGIS spatial indexing keeps queries fast
- Google Maps Geometry library for accurate calculations

**Speaker Notes:**
Let me show you what's happening under the hood. When you tap the map, your guess goes to a Supabase Edge Function that validates it and calculates the distance using PostGIS. That gets stored in Postgres, and Realtime broadcasts the update to everyone - including the admin dashboard I'm showing on the big screen. Google Maps renders all the markers with their color-coded distances.

---

## Three Game Modes Explained

**Normal Mode**
- Fixed target location
- First to get within 1km wins
- Uses `computeDistanceBetween()`

**Elf Mode** 🧝
- Target moves every 20 seconds!
- Powered by pg_cron in Postgres
- Keeps everyone on their toes

**Polygon Hunt Mode** 🎁
- Collaborative gameplay
- Find the hidden gift-shaped polygon
- 10 players inside = everyone wins!
- Uses `containsLocation()`

**Speaker Notes:**
We have three game modes. Normal is straightforward - find the fixed location. Elf Mode is chaos - the target randomly moves every 20 seconds using a pg_cron job in Postgres. And Polygon Hunt is collaborative - there's a hidden gift-shaped polygon, and when 10 players get inside it, everyone wins together. The polygon gradually becomes visible as more players find it.

---

## Code Deep Dive: Distance Calculation

```typescript
// In googleMaps.ts
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const google = window.google;
  const point1 = new google.maps.LatLng(lat1, lng1);
  const point2 = new google.maps.LatLng(lat2, lng2);
  
  // Returns distance in meters
  return google.maps.geometry.spherical
    .computeDistanceBetween(point1, point2);
}

// Generate color gradient based on distance
export function getMarkerColor(distanceM: number): string {
  const maxDistance = 30000; // 30km
  const ratio = Math.min(distanceM / maxDistance, 1);
  const hue = ratio * 240; // 0=red, 240=blue
  return `hsl(${hue}, 100%, 50%)`;
}
```

**Speaker Notes:**
Here's how we calculate distances. Google Maps Geometry library does the heavy lifting with computeDistanceBetween - it uses spherical geometry to get accurate distances on Earth's surface. Then we map that to a color gradient: close = 0 degrees (red), far = 240 degrees (blue). Simple HSL color math gives us a smooth transition.

---

## Code Deep Dive: Polygon Containment

```typescript
// Check if player's guess is inside the polygon
const point = new google.maps.LatLng(
  guess.lat, 
  guess.lng
);

const isInside = google.maps.geometry.poly
  .containsLocation(point, giftPolygon);

// Color based on inside/outside
const color = isInside ? '#22c55e' : '#6b7280';
```

**The polygon shape:**
```typescript
function generateGiftPolygon(centerLat, centerLng, size) {
  // Creates a gift box with a bow on top
  // Returns array of lat/lng coordinates
}
```

**Speaker Notes:**
For Polygon Hunt mode, we use the geometry library's containsLocation function. It implements the ray casting algorithm - draws a ray from your point to infinity and counts how many times it crosses the polygon edges. Odd number = inside. We generate a gift-box shape with a decorative bow programmatically from a center point.

---

## Code Deep Dive: WebGL Present Overlay

```typescript
// From WebGLPresentOverlay.ts
export function createPresentOverlay({ map, position }) {
  const overlay = new google.maps.WebGLOverlayView();
  
  overlay.onAdd = () => {
    scene = new THREE.Scene();
    // Add 3D present model, lights, etc.
  };
  
  overlay.onDraw = ({ transformer }) => {
    // Georeference the 3D model
    const matrix = transformer.fromLatLngAltitude({
      lat: position.lat,
      lng: position.lng,
      altitude: 100
    });
    
    camera.projectionMatrix = 
      new THREE.Matrix4().fromArray(matrix);
    
    renderer.render(scene, camera);
  };
  
  overlay.setMap(map);
  return overlay;
}
```

**Speaker Notes:**
The winner celebration uses WebGL Overlay View with Three.js. When someone wins, we spawn a 3D present model at the target location. The key is the transformer.fromLatLngAltitude function - it returns a projection matrix that maps 3D world coordinates to lat/lng/altitude. This keeps the present locked to the map location as you pan and zoom.

---

## Code Deep Dive: Realtime Subscriptions

```typescript
// Subscribe to round state changes
useEffect(() => {
  const channel = supabase
    .channel('round-updates')
    .on('postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'rounds' 
      },
      (payload) => {
        setRound(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

**Automatic cleanup** when component unmounts

**Speaker Notes:**
Supabase Realtime is dead simple. Subscribe to table changes, get callbacks with the new data. The beauty is cleanup - when your React component unmounts, you remove the channel, and Supabase handles tearing down the WebSocket. Under the hood, it's using Postgres logical replication and replication slots to stream changes.

---

## The Edge Functions Magic ✨

```typescript
// supabase/functions/submit_guess/index.ts
Deno.serve(async (req) => {
  const { deviceId, lat, lng } = await req.json();
  
  // Get current round and player
  const round = await getCurrentRound();
  const player = await getPlayer(deviceId);
  
  // Calculate distance using PostGIS
  const distance = await supabase.rpc('calculate_distance', {
    lat1: lat, lng1: lng,
    lat2: round.target_lat, lng2: round.target_lng
  });
  
  // Insert guess (triggers Realtime broadcast)
  await supabase.from('guesses').upsert({
    player_id: player.id,
    round_no: round.round_no,
    lat, lng
  });
  
  return new Response(JSON.stringify({ distance }));
});
```

**Speaker Notes:**
Edge Functions run on Deno at the edge, close to your users. This one validates guesses, calculates distances server-side (so players can't cheat), and stores the result. The upsert triggers a Realtime broadcast to all connected clients. It's TypeScript, it's fast, and it scales automatically.

---

## Performance at Scale

**How we keep it fast with many players:**

✅ **Spatial indexing** on location columns (PostGIS)  
✅ **Advanced Markers** use hardware acceleration  
✅ **Realtime** uses efficient binary protocol (WebSocket)  
✅ **Edge Functions** run globally (low latency)  
✅ **Debounced updates** for marker repositioning  

**Result:** Smooth gameplay with 100+ concurrent players

**Speaker Notes:**
Performance was a key concern. PostGIS spatial indexes let us query thousands of guesses instantly. Advanced Markers use the GPU for rendering. Realtime uses a binary protocol over WebSocket, not JSON over HTTP polling. And Edge Functions run in 15+ global regions, so there's always one close to your users. The result? We can handle a full conference room playing simultaneously.

---

## Real-World Use Cases Beyond Gaming

**This tech stack isn't just for games!**

**Delivery & Logistics**
- Real-time driver tracking (Realtime + Routes API)
- Route optimization (Routes Preferred API)
- Geofencing (PostGIS + Geometry library)

**Real Estate**
- Property search by map bounds (PostGIS)
- Neighborhood insights (Places API)
- 3D building visualization (3D Maps)

**Field Service**
- Technician dispatch (Realtime + Distance Matrix)
- Service area coverage (Polygon containment)
- Work order management (Supabase Auth + RLS)

**Speaker Notes:**
Everything we built today applies to real production apps. Delivery companies use this exact stack for live driver tracking. Real estate platforms use PostGIS for "search by map" features. Field service companies dispatch techs using the same Realtime + geospatial combo. The game is just a fun way to demonstrate the capabilities.

---

## Key Takeaways

**1. Supabase = Complete Backend**
- Postgres + Realtime + Edge Functions + PostGIS
- Open source, production-ready, no lock-in

**2. Google Maps Platform = More Than Maps**
- 3D visualization, custom markers, WebGL overlays
- Powerful geometry calculations built-in
- AI integration via MCP and Vertex AI

**3. Together = Multiplayer Magic**
- Realtime data sync meets visual geospatial display
- Server-side validation + client-side rendering
- Scale from prototype to production

**Speaker Notes:**
Let's wrap up with the big picture. Supabase gives you a complete backend that's production-ready from day one. Google Maps Platform is way more than just displaying a map - it's 3D rendering, custom graphics, accurate geometry. Together, they let you build multiplayer geospatial experiences that just work. And you can start building today!

---

## Resources & Links

**Supabase:**
- [supabase.com](https://supabase.com)
- [Realtime Docs](https://supabase.com/docs/guides/realtime)
- [PostGIS Guide](https://supabase.com/docs/guides/database/extensions/postgis)

**Google Maps Platform:**
- [Advanced Markers Guide](https://developers.google.com/maps/documentation/javascript/advanced-markers/overview)
- [Geometry Library](https://developers.google.com/maps/documentation/javascript/geometry)
- [WebGL Overlay View](https://developers.google.com/maps/documentation/javascript/webgl)
- [3D Maps](https://developers.google.com/maps/documentation/javascript/3d-maps)
- [Google Maps MCP](https://github.com/googlemaps/platform-ai)

**This Demo:**
- [GitHub Repo](https://github.com/your-repo) *(add your repo link)*

**Speaker Notes:**
All the docs are linked here. The Google Maps MCP toolkit is open source on GitHub - you can use it with Claude, Cursor, or any MCP-compatible tool. And I'll share the code for this game so you can learn from it or build your own variant. Questions?

---

## Thank You! 🎄

**Let's build something amazing together**

**Katerina Skroumpelou**
- 🐦 @psybercity
- 🌐 psyber.city
- 💼 Supabase

**Questions?**

**Speaker Notes:**
That's it! Thank you for playing along and being such a great audience. The combination of Supabase and Google Maps Platform opens up so many possibilities - multiplayer games, real-time tracking, collaborative mapping, and more. I'd love to answer any questions you have about the tech, the architecture, or how to get started building something similar!

---

## Bonus: Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│          Player Devices (Mobile Web)            │
│  • React UI                                     │
│  • Google Maps JavaScript API                   │
│  • Supabase Client (Auth + Realtime)           │
└────────────┬────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│         Supabase Edge Functions (Deno)          │
│  • submit_guess (validation + distance calc)    │
│  • assign_nickname (player creation)            │
│  • admin_actions (game control)                 │
└────────────┬────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│          Supabase Postgres + PostGIS            │
│  • players (nicknames, colors, device_id)       │
│  • rounds (game state, target location)         │
│  • guesses (player locations as geography)      │
│  • pg_cron (elf mode target movement)           │
└────────────┬────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│          Supabase Realtime (WebSocket)          │
│  • Broadcasts all database changes              │
│  • Postgres logical replication                 │
└────────────┬────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│         Admin Dashboard (Big Screen)            │
│  • Google Maps with all player markers          │
│  • WebGL 3D present on winner                   │
│  • Real-time distance leaderboard               │
└─────────────────────────────────────────────────┘
```

**Speaker Notes:**
Here's the full architecture. Players connect to Supabase Edge Functions which validate and store guesses in Postgres. PostGIS handles geospatial calculations. Realtime streams changes to all connected clients. The admin dashboard uses Google Maps to visualize everything. It's a clean separation of concerns: Edge Functions for logic, Postgres for data, Realtime for sync, Google Maps for display.

---

## Bonus: Cost Optimization Tips

**Keeping it affordable at scale:**

**Supabase:**
- Free tier: 500MB database, 2GB bandwidth, 50K monthly active users
- Pro: $25/month for serious projects
- Realtime: Included, no per-message fees
- Edge Functions: 500K invocations free/month

**Google Maps:**
- $200 free credit every month
- Advanced Markers: FREE (no SKU charges!)
- Geometry library: FREE
- Map loads: $7 per 1,000 (covered by free credit)
- Use Map IDs to enable caching and reduce loads

**Speaker Notes:**
Important to talk about cost. Supabase's free tier is generous - perfect for demos and small apps. For Google Maps, you get $200 credit monthly which covers ~28,000 map loads. Advanced Markers don't have a separate charge, and the Geometry library is free. Using Map IDs enables caching which reduces billable map loads. Both platforms are designed to keep hobbyists and startups building without breaking the bank.

---

## Bonus: Development Workflow Tips

**How I built this efficiently:**

1. **Start local-first** - Run Supabase locally (`supabase start`)
2. **Use TypeScript** - Type safety across frontend, Edge Functions, and Supabase client
3. **Google Maps MCP** - Ask Claude for code samples and best practices
4. **Supabase CLI** - Migrations, type generation, testing all from terminal
5. **Hot reload everything** - Vite for frontend, Supabase dev mode for functions

**Result:** Full-stack changes in under 30 seconds from save to preview

**Speaker Notes:**
Pro tips from building this. Run Supabase locally with their CLI - it's the same Docker images as production. Use TypeScript everywhere for type safety. The Google Maps MCP in Claude was a lifesaver for finding current docs. And with Vite for the frontend and Supabase's dev mode, you get instant hot reload across your entire stack. Makes development incredibly smooth.
