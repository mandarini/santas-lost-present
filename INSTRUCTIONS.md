# How to Play - Santa's Lost Present

Help find Santa's lost present somewhere in Greater London!

## Quick Start

1. Navigate to the game URL on your phone
2. You'll automatically be assigned a festive Christmas nickname
3. Wait for the admin to start a round
4. Tap anywhere on the map to place your guess
5. Update your guess as many times as you want
6. Win by meeting the mode-specific victory condition!

## Game Modes

### Normal Mode

The classic treasure hunt! The present is hidden at a fixed location somewhere in Greater London.

**How to Win:** Get your guess marker within **1 kilometer** of the hidden present. The first player to achieve this wins!

**Distance Feedback:** Your marker changes color smoothly from red (close) to blue (far), and you'll see temperature labels:

- 🎁 **YOU WIN!** - ≤ 1 km
- 🔥 **BURNING HOT!** - ≤ 2 km
- 🔥 **Very Hot!** - ≤ 5 km
- 🌡️ **Hot** - ≤ 10 km
- 🌡️ **Warm** - ≤ 15 km
- 😐 **Lukewarm** - ≤ 20 km
- ❄️ **Cool** - ≤ 25 km
- 🥶 **Very Cold** - ≤ 30 km
- 🧊 **Freezing!** - > 30 km

**Note:** Your marker color smoothly transitions from red (close) to blue (far). The admin may also enable distance display, showing exact distances like "5.2 km" or "150 m".

### Elf Mode

The mischievous elves are moving the present! The target location changes every **20 seconds** to a new random spot in Greater London.

**How to Win:** Get your guess marker within **1 kilometer** of the present's current location. Since the target moves, timing is crucial!

**Strategy Tips:**
- Watch your marker color closely - if it suddenly gets colder, the target has moved!
- Try to predict where the elves might move next based on the pattern
- Quick reactions are key - update your guess frequently

**Distance Feedback:** Same color and temperature label system as Normal Mode - your marker smoothly transitions from red (close) to blue (far) and shows temperature labels based on your distance to the current target location.

### Polygon Hunt Mode

A collaborative challenge! The present is hidden somewhere inside a secret polygon-shaped area on the map. Work together with other players to find it!

**How to Win:** When **10 players** have their guesses inside the hidden polygon, everyone inside wins together! This is a team victory - no single winner, but a group celebration!

**Polygon Visibility:** The hidden polygon becomes more visible as players get closer to finding it:
- **0-2 players inside:** Polygon is nearly invisible
- **3-5 players inside:** Polygon starts to appear faintly
- **6-8 players inside:** Polygon becomes clearly visible
- **9-10 players inside:** Polygon is fully visible - victory is near!

**Marker Colors:**
- 🟢 **Green** = Inside polygon
- ⚪ **Gray** = Outside polygon

**Note:** You won't see distance feedback in Polygon Mode - only whether you're inside or outside the target area.

## Tips & Tricks

### General Strategy

- Use landmarks and your knowledge of London to narrow down locations
- Watch other players' markers on the big screen (if visible) - they might be onto something!
- Don't be afraid to make multiple guesses - there's no penalty for trying
- In Normal and Elf modes, pay attention to your marker color changes

### Mobile Tips

- Pinch to zoom on the map for more precise guessing
- Rotate your device to landscape for a wider view
- Make sure your location services are enabled for better map performance

## Technical Details

### Distance Calculation

**Normal/Elf Modes:** Distances are calculated using the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula) or [Google Maps Geometry library](https://developers.google.com/maps/documentation/javascript/geometry) (when available). See the implementation in [`src/lib/googleMaps.ts`](src/lib/googleMaps.ts):

- [`calculateDistance()`](src/lib/googleMaps.ts#L36-L61) - Calculates distance between two lat/lng coordinates in meters using [`google.maps.geometry.spherical.computeDistanceBetween()`](https://developers.google.com/maps/documentation/javascript/reference/geometry#spherical.computeDistanceBetween)
- [`getMarkerColor()`](src/lib/googleMaps.ts#L63-L80) - Generates HSL color gradient from red (close) to blue (far)
- [`getTemperatureLabel()`](src/lib/googleMaps.ts#L82-L92) - Returns temperature label based on distance thresholds

**Polygon Mode:** Uses Google Maps Geometry library's [`containsLocation()`](https://developers.google.com/maps/documentation/javascript/geometry#containsLocation) method to check if a player's guess point is inside the polygon. See [`AdminDashboard.tsx`](src/pages/AdminDashboard.tsx#L136-L138):

- [`google.maps.geometry.poly.containsLocation(point, polygon)`](https://developers.google.com/maps/documentation/javascript/geometry#containsLocation) - Checks if a lat/lng point is inside a polygon (returns `true` if the point is within the polygon or on its edge)
- Players inside the polygon are marked green, outside are marked gray

### Win Detection

Win conditions are checked in [`src/pages/AdminDashboard.tsx`](src/pages/AdminDashboard.tsx):

- **Normal/Elf Mode:** Win detected when distance ≤ 1000m (1km) - see [line 179](src/pages/AdminDashboard.tsx#L179)
- **Polygon Mode:** Win detected when 10 players are inside polygon using `containsLocation()` - see [line 153](src/pages/AdminDashboard.tsx#L153)

### Polygon Generation

Polygon coordinates are generated using [`generateGiftPolygon()`](src/lib/googleMaps.ts#L101-L133), which creates a gift box shape with a decorative bow on top. Polygon opacity is controlled by [`getPolygonOpacity()`](src/lib/googleMaps.ts#L135-L143) based on the number of players inside.

