import React from "react";
import { AppBar, Toolbar, Container, Typography, Stack, Link as MuiLink, Box } from "@mui/material";

const Footer = (props) => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{
      mt: 4,
      background: "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)",
      color: "common.white",
      borderTop: "1px solid rgba(255,255,255,0.12)",
      ...(props?.sx || {})
    }}>
      <Toolbar sx={{ minHeight: 64, py: 1 }}>
        <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 8, height: 8, bgcolor: "secondary.main", borderRadius: "50%" }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              © {new Date().getFullYear()} Smart Inventory
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <MuiLink href="#" underline="hover" color="inherit" variant="body2" sx={{ opacity: 0.9 }}>Privacy</MuiLink>
            <MuiLink href="#" underline="hover" color="inherit" variant="body2" sx={{ opacity: 0.9 }}>Terms</MuiLink>
            <MuiLink href="#" underline="hover" color="inherit" variant="body2" sx={{ opacity: 0.9 }}>Support</MuiLink>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;


