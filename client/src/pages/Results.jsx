// Format price as per custom rule: single digit = crore, double digit = lakh
function formatPrice(price) {
  if (typeof price !== "number" || isNaN(price)) return "N/A";
  const crore = 10000000;
  const lakh = 100000;
  // If price is a single digit crore (e.g., 3 crore = 30000000)
  if (price >= crore && price < 10 * crore && price % crore === 0) {
    return `${price / crore} Crore`;
  }
  // If price is a double digit lakh (e.g., 25 lakh = 2500000)
  if (price >= 10 * lakh && price < 100 * lakh && price % lakh === 0) {
    return `${price / lakh} Lakh`;
  }
  // Fallback: show in rupees with commas
  return `₹${price.toLocaleString("en-IN")}`;
}
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Divider,
} from "@mui/material";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const listings = location.state?.listings || [];

  return (
    <Box mt={4}>
      <Typography
        variant="h5"
        fontWeight={700}
        color="primary.main"
        gutterBottom
        textAlign="center"
      >
        Matched Listings
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {listings.length === 0 ? (
        <Typography color="error" mt={2} textAlign="center">
          No matching listings found. Try adjusting your preferences.
        </Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {listings.map((listing, idx) => (
            <Grid item xs={12} sm={10} md={6} key={listing._id || idx}>
              <Card
                elevation={idx === 0 ? 10 : 4}
                sx={{
                  border: idx === 0 ? "3px solid #1976d2" : "1px solid #e0e0e0",
                  bgcolor: idx === 0 ? "#e3f2fd" : "background.paper",
                  position: "relative",
                  mb: 3,
                  borderRadius: 4,
                  boxShadow: idx === 0 ? 8 : 2,
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                    boxShadow: 12,
                    transform: "translateY(-2px) scale(1.01)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={idx === 0 ? "primary.main" : "text.primary"}
                    >
                      {listing.title}
                    </Typography>
                    {idx === 0 && (
                      <Chip
                        label="Top Match"
                        color="primary"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  <Typography
                    color="text.secondary"
                    fontSize={16}
                    mb={1}
                    mt={1}
                  >
                    <span style={{ fontWeight: 600, color: "#1976d2" }}>
                      Location:
                    </span>{" "}
                    <b style={{ fontWeight: 600 }}>
                      {(() => {
                        if (typeof listing.location === "string") {
                          try {
                            const parsed = JSON.parse(listing.location);
                            if (
                              parsed &&
                              typeof parsed === "object" &&
                              (parsed.LOCALITY_NAME || parsed.CITY_NAME)
                            ) {
                              return (
                                [parsed.LOCALITY_NAME, parsed.CITY_NAME]
                                  .filter(Boolean)
                                  .join(", ") || "N/A"
                              );
                            }
                          } catch {}
                          return listing.location;
                        }
                        if (listing.LOCALITY_NAME || listing.CITY_NAME) {
                          return [listing.LOCALITY_NAME, listing.CITY_NAME]
                            .filter(Boolean)
                            .join(", ");
                        }
                        return "N/A";
                      })()}
                    </b>
                  </Typography>
                  <Box display="flex" gap={2} alignItems="center" mb={1}>
                    <Typography fontWeight={600} color="secondary.main">
                      BHK:
                    </Typography>
                    <Typography fontWeight={700}>{listing.bhk}</Typography>
                    <Typography fontWeight={600} color="secondary.main">
                      Price:
                    </Typography>
                    <Typography fontWeight={700}>
                      {formatPrice(listing.price)}
                    </Typography>
                  </Box>
                  {/* Amenities removed as per new requirements */}
                  {/* Enriched Data */}
                  {listing.lat !== undefined && listing.lon !== undefined && (
                    <Box mt={2} mb={2}>
                      <MapContainer
                        center={[listing.lat, listing.lon]}
                        zoom={15}
                        style={{
                          height: 220,
                          width: "100%",
                          borderRadius: 12,
                          boxShadow: "0 2px 12px #b3c6e0",
                        }}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[listing.lat, listing.lon]}>
                          <Popup>
                            <b>{listing.title}</b>
                            <br />
                            {listing.location}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </Box>
                  )}
                  {listing.nearbySchools !== undefined && (
                    <Typography>
                      <b>Nearby Schools:</b> {listing.nearbySchools}
                    </Typography>
                  )}
                  {listing.nearbyHospitals !== undefined && (
                    <Typography>
                      <b>Nearby Hospitals:</b> {listing.nearbyHospitals}
                    </Typography>
                  )}
                  <Box mt={1} mb={1}>
                    <Typography
                      fontWeight={600}
                      color="secondary.main"
                      mb={0.5}
                    >
                      Score:{" "}
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#1976d2",
                          fontSize: 22,
                        }}
                      >
                        {listing.score}
                      </span>
                    </Typography>
                    <Box
                      ml={1}
                      mt={0.5}
                      mb={1}
                      p={1.5}
                      bgcolor="#f8fafc"
                      borderRadius={3}
                      fontSize={15}
                      boxShadow={1}
                    >
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        Real-world amenities nearby:
                      </div>
                      <ul
                        style={{
                          margin: "6px 0 0 18px",
                          padding: 0,
                          fontSize: 15,
                        }}
                      >
                        <li>
                          <span style={{ color: "#1976d2", fontWeight: 600 }}>
                            Schools:
                          </span>{" "}
                          <b>{listing.schools ?? "N/A"}</b>
                        </li>
                        <li>
                          <span style={{ color: "#1976d2", fontWeight: 600 }}>
                            Hospitals:
                          </span>{" "}
                          <b>{listing.hospitals ?? "N/A"}</b>
                        </li>
                        <li>
                          <span style={{ color: "#1976d2", fontWeight: 600 }}>
                            Restaurants:
                          </span>{" "}
                          <b>{listing.restaurants ?? "N/A"}</b>
                        </li>
                      </ul>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box mt={4} textAlign="center">
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate("/form")}
        >
          Back to Preferences
        </Button>
      </Box>
    </Box>
  );
}
