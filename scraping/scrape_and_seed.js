require('dotenv').config();
const csv = require('csvtojson');
const mongoose = require('mongoose');

// Mongoose schema
const listingSchema = new mongoose.Schema({
  title: String,
  price: String,
  location: String,
  bhk: String,
  amenities: [String]
});
const Listing = mongoose.model('ScrapedListing', listingSchema);



// Import and seed from kolkata.csv
async function importFromCSV() {
  const jsonArray = await csv().fromFile('kolkata.csv');
  // Map CSV fields to your schema
  const listings = jsonArray.map(row => {
    // Fix location: parse stringified object if present
    let loc = row.location;
    if (typeof loc === 'string' && loc.trim().startsWith('{')) {
      try {
        // Remove None/null and parse
        const cleaned = loc.replace(/None/g, 'null').replace(/'/g, '"');
        const locObj = JSON.parse(cleaned);
        // Only use string values, ignore numbers/null, ignore numbers as string
        const parts = [locObj.LOCALITY_NAME, locObj.CITY_NAME, locObj.ADDRESS]
          .filter(v => typeof v === 'string' && v.trim() && isNaN(Number(v)));
        if (parts.length > 0) loc = parts.join(', ');
      } catch {
        // fallback to raw string
      }
    }
    return {
      title: row.PROP_HEADING || row.PROP_NAME || row.DESCRIPTION || 'No Title',
      price: row.PRICE || row.PRICE_SQFT || 'N/A',
      location: loc || row.CITY || 'Kolkata',
      bhk: row.BEDROOM_NUM || (row.PROP_HEADING?.match(/\d+ ?BHK/i)?.[0] ?? 'N/A'),
      amenities: row.AMENITIES ? row.AMENITIES.replace(/\[|\]|'/g, '').split(',').map(a => a.trim()) : []
    };
  });
  return listings;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const listings = await importFromCSV();
  console.log(`Scraped ${listings.length} listings`);

  await Listing.deleteMany({});
  await Listing.insertMany(listings);
  console.log('Seeded scraped listings to MongoDB');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch(console.error);