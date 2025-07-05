// fix_prices.js
// Script to fix price fields in MongoDB: convert string prices like "1,2" to numbers (e.g., 1.2)

require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/Listing');

async function fixPrices() {
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

  // Find listings where price is a string and contains a comma
  const listings = await Listing.find({ price: { $type: 'string', $regex: /,/ } });
  console.log(`Found ${listings.length} listings with price as string containing comma.`);

  for (const listing of listings) {
    let priceStr = listing.price;
    // If price is like "1,2" (European decimal), convert to dot
    if (/^\d+,\d+$/.test(priceStr)) {
      priceStr = priceStr.replace(',', '.');
    } else {
      // Otherwise, remove all commas (Indian format)
      priceStr = priceStr.replace(/,/g, '');
    }
    const priceNum = parseFloat(priceStr);
    if (!isNaN(priceNum)) {
      listing.price = priceNum;
      await listing.save();
      console.log(`Updated listing ${listing._id}: price set to ${priceNum}`);
    } else {
      console.warn(`Could not parse price for listing ${listing._id}: ${listing.price}`);
    }
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Price fix complete.');
}

if (require.main === module) {
  fixPrices();
}
