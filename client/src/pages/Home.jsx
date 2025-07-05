import React from "react";
import { Button, Typography, Box, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";

const bgUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";

export default function Home() {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(rgba(30,40,60,0.5),rgba(30,40,60,0.7)), url(${bgUrl}) center/cover no-repeat`,
        borderRadius: 3,
        p: { xs: 2, sm: 4 },
      }}
    >
      <Card sx={{ maxWidth: 480, mx: 'auto', boxShadow: 6, borderRadius: 3, bgcolor: 'background.paper', opacity: 0.97 }}>
        <CardContent>
          <Typography variant="h3" fontWeight={700} gutterBottom color="primary.main" textAlign="center">
            Welcome to NeighborFit
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom textAlign="center">
            Find your perfect neighborhood and property match based on your lifestyle and preferences.
          </Typography>
          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 6, py: 1.5, fontSize: '1.2rem', borderRadius: 2, fontWeight: 700 }}
              onClick={() => navigate("/form")}
            >
              Get Started
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 