import React, { useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function PreferenceForm() {
  const [form, setForm] = useState({
    budget: "",
    preferredBHK: "",
    location: "",
    pincode: "",
    schoolPref: 5,
    hospitalPref: 5,
    restaurantPref: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/listings/match`,
        {
          budget: Number(form.budget),
          preferredBHK: Number(form.preferredBHK),
          location: form.location,
          pincode: form.pincode,
          schoolPref: Number(form.schoolPref),
          hospitalPref: Number(form.hospitalPref),
          restaurantPref: Number(form.restaurantPref),
        }
      );
      navigate("/results", { state: { listings: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box maxWidth={520} width="100%">
        <Card sx={{ boxShadow: 5, borderRadius: 3 }}>
          <CardContent>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              textAlign="center"
              color="primary.main"
            >
              Enter Your Preferences
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleSubmit}>
              <Typography
                variant="subtitle1"
                mt={2}
                mb={1}
                fontWeight={600}
                color="secondary.main"
              >
                Select Budget (in Lakhs)
              </Typography>
              <Box sx={{ overflowX: "auto", mb: 2 }}>
                <ToggleButtonGroup
                  value={form.budget}
                  exclusive
                  onChange={(e, val) => {
                    if (val !== null) setForm({ ...form, budget: val });
                  }}
                  sx={{ flexWrap: "nowrap" }}
                >
                  {[
                    { label: "20L", value: 2000000 },
                    { label: "30L", value: 3000000 },
                    { label: "40L", value: 4000000 },
                    { label: "50L", value: 5000000 },
                    { label: "60L", value: 6000000 },
                    { label: "75L", value: 7500000 },
                    { label: "1Cr", value: 10000000 },
                    { label: "1.5Cr", value: 15000000 },
                    { label: "2Cr", value: 20000000 },
                  ].map((opt) => (
                    <ToggleButton
                      key={opt.value}
                      value={opt.value}
                      sx={{ minWidth: 80, mx: 0.5 }}
                    >
                      {opt.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
              <TextField
                label="Preferred BHK"
                name="preferredBHK"
                select
                value={form.preferredBHK}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              >
                {[1, 2, 3].map((bhk) => (
                  <MenuItem key={bhk} value={bhk}>
                    {bhk} BHK
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Preferred Location"
                name="location"
                value={form.location}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Pincode (optional)"
                name="pincode"
                value={form.pincode || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: 6 }}
                helperText="Show results within 10km of this pincode (if provided)"
              />
              <Typography
                variant="subtitle1"
                mt={2}
                mb={1}
                fontWeight={600}
                color="secondary.main"
              >
                Preference for Schools
              </Typography>
              <TextField
                select
                label="Schools Preference (0-10)"
                name="schoolPref"
                value={form.schoolPref}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                {[...Array(11).keys()].map((i) => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </TextField>
              <Typography
                variant="subtitle1"
                mt={2}
                mb={1}
                fontWeight={600}
                color="secondary.main"
              >
                Preference for Hospitals
              </Typography>
              <TextField
                select
                label="Hospitals Preference (0-10)"
                name="hospitalPref"
                value={form.hospitalPref}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                {[...Array(11).keys()].map((i) => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </TextField>
              <Typography
                variant="subtitle1"
                mt={2}
                mb={1}
                fontWeight={600}
                color="secondary.main"
              >
                Preference for Restaurants
              </Typography>
              <TextField
                select
                label="Restaurants Preference (0-10)"
                name="restaurantPref"
                value={form.restaurantPref}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                {[...Array(11).keys()].map((i) => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </TextField>
              {error && (
                <Typography color="error" mt={2} textAlign="center">
                  {error}
                </Typography>
              )}
              <Box mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                  size="large"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    py: 1.2,
                    borderRadius: 2,
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Find Matches"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
