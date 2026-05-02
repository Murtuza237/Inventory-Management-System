import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Avatar,
  Stack,
  Alert
} from "@mui/material";
import { EmailOutlined, LockOutlined, Inventory2Rounded } from "@mui/icons-material";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Wait briefly for role fetch to propagate properly just in case
      navigate("/inventory", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Incorrect email or password");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "radial-gradient(ellipse at top left, #e0e7ff 0%, #f1f5f9 40%, #e2e8f0 100%)",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "50%",
          height: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(60px)",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-15%",
          right: "-5%",
          width: "40%",
          height: "60%",
          background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(60px)",
          zIndex: 0,
        }
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 4, sm: 6 },
          width: { xs: "90%", sm: 460 },
          borderRadius: 4,
          position: "relative",
          zIndex: 1,
          backdropFilter: "blur(12px)",
          bgcolor: "rgba(255, 255, 255, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Avatar 
            sx={{ 
              bgcolor: "primary.main", 
              width: 72, 
              height: 72, 
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.35)",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
            }}
          >
            <Inventory2Rounded fontSize="large" sx={{ color: "#fff" }} />
          </Avatar>
          <Box textAlign="center">
            <Typography variant="h3" sx={{ mb: 1 }}>
              Welcome back
            </Typography>
            <Typography variant="subtitle1">
              Please enter your details to sign in
            </Typography>
          </Box>
        </Stack>

        <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            disabled={loading} 
            sx={{ 
              mt: 1,
              py: 1.5,
              fontSize: "1.05rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 700
            }}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;


