// fetchRealData.js
// Enrich listings with lat/lon and nearby schools/hospitals using free public APIs

const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/Listing');

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Optional: throttle to 1 request/sec to avoid bans
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getCoordinates(location) {
  try {
    const url = `${NOMINATIM_BASE_URL}?format=json&q=${encodeURIComponent(location + ', India')}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'NeighborFitBot/1.0' },
      timeout: 10000
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
    }
  } catch (error) {
    console.error(`Nominatim error for "${location}":`, error.message);
  }
  return null;
}

async function getNearbyAmenities(lat, lon, amenity) {
  const delta = 0.01;
  const bbox = [lat - delta, lon - delta, lat + delta, lon + delta];
  const query = `
    [out:json];
    node["amenity"="${amenity}"](${bbox.join(',')});
    out body;
  `;

  try {
    const response = await axios.post(OVERPASS_API_URL, query, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 15000
    });

    return response.data?.elements?.length || 0;
  } catch (error) {
    console.error(`Overpass error for ${amenity} near [${lat},${lon}]:`, error.message);
    return 0;
  }
}

async function enrichListings() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const listings = await Listing.find();
  console.log(`Found ${listings.length} listings to enrich.`);

  for (const listing of listings) {
    console.log(`\n📍 Processing: ${listing.title} (${listing.location})`);

    // Use lat/lon from DB if present, otherwise geocode
    let lat = listing.lat;
    let lon = listing.lon;
    if (lat == null || lon == null) {
      const coords = await getCoordinates(listing.location);
      if (!coords) {
        console.warn(`⚠️ Could not find coordinates for ${listing.location}`);
        continue;
      }
      lat = coords.lat;
      lon = coords.lon;
      listing.lat = lat;
      listing.lon = lon;
    }

    await delay(1000); // Avoid Overpass rate-limit
    listing.nearbySchools = await getNearbyAmenities(lat, lon, 'school');

    await delay(1000); // Again, throttle for safety
    listing.nearbyHospitals = await getNearbyAmenities(lat, lon, 'hospital');

    await listing.save();
    console.log(`✅ Updated listing: ${listing.title} with lat/lon and ${listing.nearbySchools} schools, ${listing.nearbyHospitals} hospitals`);
  }

  await mongoose.disconnect();
  console.log('\n✨ All listings enriched and saved.');
}

enrichListings();
