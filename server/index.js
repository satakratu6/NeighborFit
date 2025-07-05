const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Listing = require('./models/Listing');
const seedListings = require('./seed');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB using .env MONGODB_URI
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/neighborfit';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('MongoDB connected');
  // Seed data if DB is empty
  if ((await Listing.countDocuments()) === 0) {
    await seedListings();
    console.log('Database seeded');
  }
}).catch(err => console.error(err));

// Get all listings
app.get('/api/listings', async (req, res) => {
  const listings = await Listing.find();
  res.json(listings);
});

// Match listings
app.post('/api/listings/match', async (req, res) => {
  const { budget, preferredBHK, location, pincode, schoolPref, hospitalPref, restaurantPref } = req.body;
  if (!budget || !location || schoolPref == null || hospitalPref == null || restaurantPref == null) {
    return res.status(400).json({ error: 'Missing preferences' });
  }

  // Price filter: greater than user budget, less than (user budget + 30 lakh)
  const minPrice = Number(budget);
  const maxPrice = minPrice + 3000000;

  // Build base query
  let query = {
    price: { $gte: minPrice, $lte: maxPrice },
  };
  // Only filter BHK if user selected
  if (preferredBHK && !isNaN(Number(preferredBHK))) {
    query.bhk = Number(preferredBHK);
  }
  // Location filter (by city/locality name only)
  if (location) {
    // Only match on CITY_NAME and LOCALITY_NAME fields, case-insensitive, but fallback to original location field if no results
    let tempQuery = { ...query, $or: [
      { 'CITY_NAME': { $regex: location, $options: 'i' } },
      { 'LOCALITY_NAME': { $regex: location, $options: 'i' } }
    ] };
    let tempListings = await Listing.find(tempQuery);
    if (tempListings.length === 0) {
      // fallback to original location field
      query.location = { $regex: location, $options: 'i' };
    } else {
      query = tempQuery;
    }
  }

  // Pincode/radius filter (if pincode provided)
  let listings = await Listing.find(query);
  if (pincode && /^[1-9][0-9]{5}$/.test(pincode)) {
    // Use Nominatim to get lat/lon for the pincode
    const axios = require('axios');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&country=India`;
      const response = await axios.get(url, { headers: { 'User-Agent': 'NeighborFitBot/1.0' }, timeout: 10000 });
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        // Filter listings to those within 10km radius
        const toRad = deg => (deg * Math.PI) / 180;
        const R = 6371; // km
        listings = listings.filter(listing => {
          if (listing.lat == null || listing.lon == null) return false;
          const dLat = toRad(listing.lat - lat);
          const dLon = toRad(listing.lon - lon);
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(listing.lat)) * Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const d = R * c;
          return d <= 10;
        });
      }
    } catch (e) {
      // If pincode lookup fails, ignore pincode filter
    }
  }

  // For each listing, fetch live counts of schools, hospitals, restaurants nearby and score
  const axios = require('axios');
  async function getNearbyCount(lat, lon, amenity) {
    if (lat == null || lon == null) return 0;
    const delta = 0.01;
    const bbox = [lat - delta, lon - delta, lat + delta, lon + delta];
    const query = `\n[out:json];\nnode[\"amenity\"=\"${amenity}\"](${bbox.join(',')});\nout body;\n`;
    try {
      const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 15000
      });
      return response.data?.elements?.length || 0;
    } catch {
      return 0;
    }
  }

  // Fetch amenities for all listings in parallel (with throttling)
  async function enrichAndScore(listings) {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    let maxScore = 0;
    const enriched = [];
    // First pass: calculate raw scores and find max
    for (const listing of listings) {
      const { lat, lon } = listing;
      const [schools, hospitals, restaurants] = await Promise.all([
        getNearbyCount(lat, lon, 'school'),
        getNearbyCount(lat, lon, 'hospital'),
        getNearbyCount(lat, lon, 'restaurant')
      ]);
      // Use user preferences for weights
      const score = (schools * Number(schoolPref)) + (hospitals * Number(hospitalPref)) + (restaurants * Number(restaurantPref));
      if (score > maxScore) maxScore = score;
      // Compose a human-readable location string
      const locObj = listing.toObject();
      let displayLocation = '';
      if (locObj.LOCALITY_NAME && locObj.CITY_NAME) {
        displayLocation = `${locObj.LOCALITY_NAME}, ${locObj.CITY_NAME}`;
      } else if (locObj.LOCALITY_NAME) {
        displayLocation = locObj.LOCALITY_NAME;
      } else if (locObj.CITY_NAME) {
        displayLocation = locObj.CITY_NAME;
      } else if (locObj.location) {
        // Try to parse Python-style dict string
        const locStr = String(locObj.location);
        const dictMatch = locStr.match(/\{.*\}/);
        if (dictMatch) {
          // Replace single quotes with double quotes, None with null
          let jsonStr = locStr.replace(/'/g, '"').replace(/None/g, 'null');
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed && (parsed.LOCALITY_NAME || parsed.CITY_NAME)) {
              displayLocation = [parsed.LOCALITY_NAME, parsed.CITY_NAME].filter(Boolean).join(', ');
            } else {
              displayLocation = locStr;
            }
          } catch {
            displayLocation = locStr;
          }
        } else {
          displayLocation = locStr;
        }
      }
      // Always send location as a string, never as an object
      enriched.push({
        ...locObj,
        location: String(displayLocation),
        schools,
        hospitals,
        restaurants,
        rawScore: score,
        schoolPref: Number(schoolPref),
        hospitalPref: Number(hospitalPref),
        restaurantPref: Number(restaurantPref),
      });
      // Reduce delay to 200ms for faster response
      await delay(200);
    }
    // Second pass: normalize to 0-100
    for (const l of enriched) {
      l.score = maxScore > 0 ? Math.round((l.rawScore / maxScore) * 100) : 0;
    }
    return enriched.sort((a, b) => b.score - a.score);
  }

  listings = await enrichAndScore(listings);

  if (listings.length === 0) {
    return res.status(404).json({ error: 'No matching listings found' });
  }

  res.json(listings);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 