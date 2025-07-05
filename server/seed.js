
require('dotenv').config();
const mongoose = require('mongoose');
const csv = require('csvtojson');
const Listing = require('./models/Listing');

// Import and seed from kolkata.csv (in scraping folder)
async function importFromCSV() {
  const jsonArray = await csv().fromFile('../scraping/kolkata.csv');
  // Map CSV fields to your schema
  function parsePrice(priceStr) {
    if (!priceStr) return null;
    priceStr = priceStr.toString().trim().toUpperCase();
    // Handle Indian notation: 1,2 Cr means 1.2 Cr
    let match = priceStr.match(/([\d]+)[,.]([\d]+)\s*(CR|CRORE|L|LAKH)?/);
    if (match) {
      let num = parseFloat(match[1] + '.' + match[2]);
      if (isNaN(num)) return null;
      if (match[3] === 'CR' || match[3] === 'CRORE') return Math.round(num * 10000000);
      if (match[3] === 'L' || match[3] === 'LAKH') return Math.round(num * 100000);
      return Math.round(num); // fallback
    }
    // Fallback: remove commas (for numbers like 1,20,000)
    let cleaned = priceStr.replace(/,/g, '');
    let match2 = cleaned.match(/([\d.]+)\s*(CR|CRORE|L|LAKH)?/);
    if (!match2) return null;
    let num2 = parseFloat(match2[1]);
    if (isNaN(num2)) return null;
    if (match2[2] === 'CR' || match2[2] === 'CRORE') return Math.round(num2 * 10000000);
    if (match2[2] === 'L' || match2[2] === 'LAKH') return Math.round(num2 * 100000);
    // Custom rule: if single digit, treat as crore; if double digit, treat as lakh
    if (match2[1].length === 1) {
      return Math.round(num2 * 10000000); // single digit = crore
    } else if (match2[1].length === 2) {
      return Math.round(num2 * 100000); // double digit = lakh
    }
    return Math.round(num2); // fallback: treat as rupees
  }

  const listings = jsonArray.map(row => ({
    title: row.PROP_HEADING || row.PROP_NAME || row.DESCRIPTION || 'No Title',
    name: row.PROP_NAME || '',
    description: row.DESCRIPTION || '',
    societyName: row.SOCIETY_NAME || '',
    price: parsePrice(row.PRICE) || parsePrice(row.PRICE_SQFT) || null,
    location: (() => {
      // If location is a stringified object, parse and use fields
      if (typeof row.location === 'string' && row.location.trim().startsWith('{')) {
        try {
          const locObj = JSON.parse(row.location.replace(/'/g, '"'));
          // Prefer LOCALITY_NAME, CITY_NAME, ADDRESS if present
          const parts = [locObj.LOCALITY_NAME, locObj.CITY_NAME, locObj.ADDRESS]
            .filter(Boolean);
          if (parts.length > 0) return parts.join(', ');
        } catch {
          // fallback to raw string
        }
      }
      // If location is a plain object (rare in CSV), use fields
      if (typeof row.location === 'object' && row.location !== null) {
        const parts = [row.location.LOCALITY_NAME, row.location.CITY_NAME, row.location.ADDRESS]
          .filter(Boolean);
        if (parts.length > 0) return parts.join(', ');
      }
      // If location is a plain string (not object), just return it
      if (typeof row.location === 'string') {
        return row.location;
      }
      // Otherwise, fallback to CITY or Kolkata
      return row.CITY || 'Kolkata';
    })(),
    bhk: (() => {
      // Prefer BEDROOM_NUM if it's a valid number
      if (row.BEDROOM_NUM && !isNaN(Number(row.BEDROOM_NUM))) return Number(row.BEDROOM_NUM);
      // Try to extract number from PROP_HEADING (e.g., "2 BHK")
      const match = row.PROP_HEADING?.match(/(\d+) ?BHK/i);
      if (match && !isNaN(Number(match[1]))) return Number(match[1]);
      // If not a number, return null
      return null;
    })(),
    // No amenities, will enrich later
    lat: (() => { try { return JSON.parse(row.MAP_DETAILS.replace(/'/g, '"')).LATITUDE || null; } catch { return null; } })(),
    lon: (() => { try { return JSON.parse(row.MAP_DETAILS.replace(/'/g, '"')).LONGITUDE || null; } catch { return null; } })(),
    lifestyleScore: Math.floor(Math.random() * 41) + 60 // 60-100
  }));
  return listings;
}



async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB');
  await Listing.deleteMany({});
  console.log('Old listings removed');
  const listings = await importFromCSV();
  await Listing.insertMany(listings);
  console.log(`${listings.length} new Kolkata listings seeded!`);
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

if (require.main === module) {
  seed();
}