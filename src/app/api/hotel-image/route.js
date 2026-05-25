import { NextResponse } from "next/server";

// Simple in-memory cache for photo URLs to avoid exceeding Google API quotas
// key: "hotelName_index", value: { url: string, expiry: number }
const cache = new Map();
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours cache expiry

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const indexParam = searchParams.get("index");
  const index = indexParam ? parseInt(indexParam, 10) : 0;
  const fallbackSrc = searchParams.get("fallbackSrc") || "/images/city.png";

  // If the API key is not provided/empty, immediately return the fallback image and save credits
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.trim() === "") {
    return NextResponse.redirect(new URL(fallbackSrc, request.url));
  }

  if (!name) {
    return NextResponse.redirect(new URL("/images/city.png", request.url));
  }

  const cacheKey = `${name}_${index}`;
  const now = Date.now();
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (now < cached.expiry) {
      return NextResponse.redirect(cached.url);
    }
  }

  try {
    // Step 1: Query Google Places Text Search to get the place_id for the hotel name
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(name)}&key=${GOOGLE_MAPS_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`Places Search API failed with status ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    if (searchData.results && searchData.results[0]) {
      const placeId = searchData.results[0].place_id;
      
      // Step 2: Query Place Details API to get the full list of photos (up to 10 photos)
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      
      if (!detailsResponse.ok) {
        throw new Error(`Place Details API failed with status ${detailsResponse.status}`);
      }

      const detailsData = await detailsResponse.json();
      if (detailsData.result && detailsData.result.photos) {
        const photos = detailsData.result.photos;
        
        // Get photo at the requested index (handle bounds with modulo or fallback to index 0)
        const photoIdx = index >= 0 && index < photos.length ? index : index % photos.length;
        const photo = photos[photoIdx] || photos[0];
        
        if (photo) {
          const photoRef = photo.photo_reference;
          const freshUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
          
          // Store in memory cache
          cache.set(cacheKey, {
            url: freshUrl,
            expiry: now + CACHE_DURATION
          });

          return NextResponse.redirect(freshUrl);
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching fresh details photo for hotel "${name}" (index ${index}):`, error);
  }

  // If Google API fails or has no photos, redirect to default fallback
  return NextResponse.redirect(new URL("/images/city.png", request.url));
}
