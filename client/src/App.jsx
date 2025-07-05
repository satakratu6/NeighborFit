import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, IconButton, Box } from "@mui/material";
import Home from "./pages/Home";
import PreferenceForm from "./pages/PreferenceForm";
import Results from "./pages/Results";
import { Brightness4, Brightness7 } from '@mui/icons-material';

function App({ toggleTheme, mode }) {
  return (
    <Router>
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>NeighborFit</Typography>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 1 }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<PreferenceForm />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </Container>
      <Box component="footer" sx={{ py: 3, textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
        © {new Date().getFullYear()} NeighborFit. All rights reserved.
      </Box>
    </Router>
  );
}

export default App;
