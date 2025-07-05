const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  title: String,
  price: Number,
  location: String,
  bhk: Number,
  amenities: [String],
  lifestyleScore: Number,
  // Enrichment fields:
  lat: Number,              // Latitude from geocoding
  lon: Number,              // Longitude from geocoding
  nearbySchools: Number,    // Number of nearby schools
  nearbyHospitals: Number   // Number of nearby hospitals
});

// Use a custom collection name for enriched Kolkata listings
module.exports = mongoose.model('Listing', ListingSchema, 'kolkata_listings');