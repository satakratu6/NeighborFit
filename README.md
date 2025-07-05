# 🏡 NeighborFit – Smart Neighborhood & Property Matcher

> Matching homebuyers with neighborhoods that _fit_ – not just by price, but by _life_.

---

## ✨ Why I Built This

The home buying trend in India is evolving fast, and as someone deeply interested in how data and design can transform industries, I wanted to build a tool that **bridges the gap between buyer preferences and real estate offerings**.

A FICCI-Anarock survey (Oct 2024) and expert insights from Knight Frank, CREDAI, Eros Group, and RG Group reveal that:

- 🏙️ 45%+ buyers now seek ₹90L+ homes, especially 3BHK/4BHK.
- 📉 Affordable housing demand struggles due to poor quality, location, and connectivity.
- 🧠 Post-COVID, WFH & hybrid lifestyles increased demand for larger, well-connected, amenity-rich homes.
- 🧩 Existing platforms (Housing.com, 99acres, NoBroker) **lack personalization, neighborhood insight, and quality content**.

### 🚀 So I built **NeighborFit** – a smart, intuitive React + Express web app that:

- Matches users to properties based on their lifestyle and preferences.
- Focuses on **quality of match**, not just lowest price.

---

## 🔍 User Research Summary

### 📊 Sources Consulted

- Knight Frank's _Beyond Bricks: The Pulse of Home Buying 2025_
- FICCI-Anarock survey (2024)
- Developer insights from Eros Group, RG Group, and CREDAI

### 🧠 Key Insights

- 80%+ prefer owning over renting (91% for high income, 82% millennials).
- Location, affordability, and layout are top factors.
- COVID accelerated the demand for 3BHK+ homes, home-office setups, and outdoor amenities.

### 💡 Implications for NeighborFit

- Users want homes that balance **space, location, lifestyle fit**, and future-proof planning.
- Matching should consider **income tier**, **BHK preference**, **amenity importance**, and **commute/connectivity needs**.

---

## 🧪 How It Works

Users input:

- 💰 Budget
- 🏢 Preferred BHK (1, 2, or 3)
- 📍 Location keyword
- 📊 Amenity preferences (schools, hospitals, restaurants)

The backend:

- Filters listings using MongoDB queries
- Enriches each listing with live amenity counts (schools, hospitals, restaurants) using Overpass API
- Geocodes locations and pincodes using Nominatim API
- Scores matches using a **user-weighted, normalized algorithm**:
  ```
  score = (schools * schoolPref) + (hospitals * hospitalPref) + (restaurants * restaurantPref)
  normalizedScore = (score / maxScore) * 100
  ```
- Returns **ranked** matches with a "Top Match" highlighted, including a human-readable location and live neighborhood data

---

## 🖥️ Tech Stack

| Tech       | Purpose                        |
| ---------- | ------------------------------ |
| React      | Frontend (SPA with Routing)    |
| MUI        | UI Components & Theming        |
| Express.js | Backend API                    |
| MongoDB    | Database for property listings |
| Axios      | API calls from frontend        |
| dotenv     | Config management              |

---

## 🔧 Project Structure

```
/client
  ├── App.jsx              # Main layout & routing
  ├── pages/
  │   ├── Home.jsx         # Landing page
  │   ├── PreferenceForm.jsx # User input form
  │   └── Results.jsx      # Matched results display
  └── index.css / App.css  # Theming

/server
  ├── index.js             # Express app & API routes
  ├── seed.js              # Mock listings data
  └── models/
      └── Listing.js       # Mongoose schema
```

---

## 🌐 What Sets NeighborFit Apart

✅ Personalized, real-time match scores
✅ Live neighborhood enrichment (schools, hospitals, restaurants)
✅ User-weighted scoring based on lifestyle
✅ Clean, modern UI with card-based results and map
✅ Robust location parsing and fallback logic
✅ Seamless UX flow: Home → Form → Results
✅ Responsive and fast

---

## 🔍 Limitations in Existing Platforms

| Platform    | Key Issues                                         |
| ----------- | -------------------------------------------------- |
| Housing.com | Outdated maps, weak recsys, no deep local insights |
| 99acres.com | Hidden costs, poor support, limited filters        |
| MagicBricks | UI inconsistency, no adaptive suggestions          |
| NoBroker    | Weak personalization, monetization confusion       |

🔴 **Common Gaps**: personalization, verified data, commute/safety metrics, quality content

---

## 🛠️ Run Locally

### Prerequisites

- Node.js
- MongoDB

### Steps

```bash
# Clone the repo
git clone https://github.com/yourusername/neighborfit
cd neighborfit

# Install backend dependencies
cd server
npm install

# Start backend server
node index.js

# In another terminal, start frontend
cd ../client
npm install
npm run dev
```

---

## 📦 Sample Listings

Sample listings (from real Kolkata data, enriched with live amenities):

- 2BHK in Salt Lake, Kolkata (₹80L) – 5 schools, 3 hospitals, 12 restaurants nearby
- 3BHK in New Town, Kolkata (₹1.2Cr) – 8 schools, 4 hospitals, 20 restaurants nearby
- 2BHK in Ballygunge, Kolkata (₹1.5Cr) – 6 schools, 5 hospitals, 15 restaurants nearby

---

## 📌 Next Steps

- ✅ Add commute/school/crime metrics via APIs
- ✅ Allow more filter options (e.g., exact sq. ft., pet-friendliness)
- 🔄 Integrate with real data (via Housing API or RERA)
- 📈 Improve scoring with ML-based recommendations

---

## 👋 Made With 💙

By Satakratu Chakraborty  
Let’s reshape how India finds homes.

---

## 🧪 Data Handling & Processing Challenges

Since access to real estate datasets and APIs was restricted by cost or permissions, I creatively simulated data using insights from surveys and expert commentary. Each mock listing is crafted to reflect actual market conditions (e.g., pricing brackets, location types, amenity distribution).

Edge cases like:

- Users inputting unrealistic budgets or combinations (e.g., ₹40K budget for 3BHK with luxury amenities) are handled with a fallback "No Matching Listings" message.
- Case-insensitive matching for locations ensures broader flexibility.
- Future plans include external API integrations (e.g., Google Maps, Commute APIs) and real-world datasets (e.g., RERA).

---

## 🧪 Testing & Validation Approach

- Manually tested across multiple preference scenarios to ensure scoring logic works.
- Validated algorithm output by cross-checking that top-scored listings always match most amenities + location + budget.
- UI/UX flow tested for edge cases (e.g., missing fields, empty result sets, dark/light mode).

---

## 🔍 Design Rationale & Trade-Offs

- **MongoDB** was chosen over SQL for its schema-less flexibility to iterate fast on listing fields and simulate nested data (amenities, location).
- **Amenity-based scoring algorithm** was preferred for simplicity and interpretability.
- **Mock data** was used for constraints around live APIs or paid data, but designed to mimic real-world buyer scenarios.

Trade-offs included:

- Real-time accuracy vs demo flexibility (chose flexibility)
- No ML-based recommendation engine yet – simplicity wins for MVP.

---

## 🧠 Scalability & System Thinking

- MongoDB allows scaling to thousands of listings via indexing and schema optimization.
- API is RESTful and modular – ready for Dockerization or load balancing when scaled.
- Frontend is split into routed components for maintainability.

Future scalability upgrades:

- Add pagination and lazy loading in results.
- Cache top queries and frequently matched filters.

---

## 🧠 Critical Reflection & Improvements

### ✅ What Works Well

- Matches are meaningful and ranked clearly.
- Interface is intuitive and visually polished.
- Preferences and results loop flows well from Home → Form → Results.

### 🔍 Limitations

- Some listings may have missing or imprecise geocoding due to ambiguous addresses in the source CSV.
- Amenity counts depend on OpenStreetMap data, which may be incomplete in some areas.
- API rate limits may occasionally delay enrichment for large result sets.
- Further improvements possible with deeper government/official datasets and more granular scoring (e.g., commute, safety).

### 🔮 Future Plans

---

## 🌍 APIs & Real-Time Data Enrichment

NeighborFit uses **real Kolkata property data** (from a public CSV) and enriches each listing with live, real-time information:

- **Nominatim API**: Converts addresses/pincodes to latitude/longitude for geospatial filtering and enrichment.
- **Overpass API (OpenStreetMap)**: Fetches live counts of nearby schools, hospitals, and restaurants for each property, ensuring up-to-date neighborhood context.

This means every match is scored not just on static data, but on the _current_ amenity landscape around each property.

---

## 🧩 Data Handling & Processing Challenges (Expanded)

- **Parsing Indian Real Estate Data**: The backend robustly parses Indian price notations (e.g., "1.2 Cr", "80L", "₹1,20,000"), ambiguous or missing fields, and location data that may be in various formats (including Python dict strings from legacy sources).
- **Live API Throttling**: To avoid rate limits, the backend throttles enrichment API calls and gracefully handles failures (e.g., timeouts, missing data) so the user experience is never blocked.
- **Fallback Logic**: If a location or amenity lookup fails, the system falls back to the next-best available data, ensuring robust results.

---

## 🚀 Future Scope & Improvements

- **Deeper Real-World Data**: Integrate with RERA, Housing.com, or government datasets for even more accurate listings.
- **Advanced Scoring**: Move from simple weighted sums to ML-based recommendations, commute/safety scoring, and user feedback loops.
- **User Accounts**: Allow users to save preferences, favorite listings, and receive personalized alerts.
- **Mobile App**: Build a React Native version for on-the-go property search.
- **More APIs**: Add layers for crime, pollution, transit, and more neighborhood factors.

---
