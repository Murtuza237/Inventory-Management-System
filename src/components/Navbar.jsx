import React from "react";
import { AppBar, Toolbar, Button, Typography, Box, IconButton, Drawer, List, ListItemButton, ListItemText, Divider, Avatar, Menu, MenuItem, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { Menu as MenuIcon, Inventory2Rounded } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import useScrollTrigger from "@mui/material/useScrollTrigger";

const Navbar = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut: doSignOut, user, profile } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const displayName = profile?.name || user?.displayName || user?.email || "User";
  const initials = (displayName?.trim()?.[0] || "U").toUpperCase();
  const photoURL = profile?.photoURL || user?.photoURL || null;

  const handleLogout = async () => {
    await doSignOut();
    navigate("/login", { replace: true });
  };

  const handleMenuOpen = (e) => setMenuAnchor(e.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0 });

  const navButton = (path, label) => (
    <Button
      onClick={() => navigate(path)}
      sx={{
        color: location.pathname.includes(path) ? "primary.main" : "text.secondary",
        fontWeight: location.pathname.includes(path) ? 700 : 500,
        "&:hover": {
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          color: "primary.main"
        }
      }}
    >
      {label}
    </Button>
  );

  return (
    <AppBar 
      position="fixed" 
      color="transparent" 
      elevation={0} 
      sx={{
        background: trigger ? "rgba(255, 255, 255, 0.85)" : "rgba(248, 250, 252, 0.5)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        color: "text.primary",
        transition: 'all 200ms ease',
        boxShadow: trigger ? "0 4px 20px -5px rgba(0,0,0,0.05)" : "none",
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
          <Inventory2Rounded sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.03em", color: "text.primary" }}>
            Inventory<Box component="span" sx={{ color: "primary.main" }}>System</Box>
          </Typography>
        </Box>
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
          {navButton("/inventory", "Inventory")}
          {userRole === "admin" && (
            <>
              {navButton("/billing", "Billing")}
              {navButton("/manage-users", "Manage Users")}
            </>
          )}
          <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
            <Tooltip title={displayName}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: "pointer", p: 0.5, borderRadius: 2, "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }} onClick={handleMenuOpen}>
                <Avatar src={photoURL || undefined} sx={{ width: 36, height: 36, bgcolor: "primary.light", color: "#fff", fontWeight: 600 }}>
                  {!photoURL && initials}
                </Avatar>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, display: { xs: 'none', lg: 'block' } }}>
                  {displayName}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ elevation: 3, sx: { minWidth: 200, mt: 1.5 } }}
          >
            <Box sx={{ px: 2, py: 1.5, outline: 0 }}>
              <Typography variant="subtitle2" fontWeight={700}>{displayName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>{userRole}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }} sx={{ py: 1 }}>Profile</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); setConfirmOpen(true); }} sx={{ py: 1, color: "error.main" }}>Logout</MenuItem>
          </Menu>
        </Box>
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton color="primary" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, pt: 2 }} role="presentation" onClick={() => setOpen(false)}>
          <Box sx={{ px: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar src={photoURL || undefined} sx={{ width: 40, height: 40, bgcolor: "primary.light" }}>{!photoURL && initials}</Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>{displayName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>{userRole}</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <List sx={{ px: 1 }}>
            <ListItemButton sx={{ borderRadius: 2, mb: 0.5 }} selected={location.pathname.includes("/inventory")} onClick={() => navigate("/inventory")}>
              <ListItemText primary="Inventory" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
            {userRole === "admin" && (
              <>
                <ListItemButton sx={{ borderRadius: 2, mb: 0.5 }} selected={location.pathname.includes("/billing")} onClick={() => navigate("/billing")}>
                  <ListItemText primary="Billing" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
                <ListItemButton sx={{ borderRadius: 2, mb: 0.5 }} selected={location.pathname.includes("/manage-users")} onClick={() => navigate("/manage-users")}>
                  <ListItemText primary="Manage Users" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              </>
            )}
            <ListItemButton sx={{ borderRadius: 2, mb: 0.5 }} selected={location.pathname.includes("/profile")} onClick={() => navigate('/profile')}>
              <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </List>
          <Divider sx={{ my: 1 }} />
          <List sx={{ px: 1 }}>
            <ListItemButton sx={{ borderRadius: 2, color: "error.main" }} onClick={() => setConfirmOpen(true)}>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Sign out</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will be signed out of this session. You can sign in again anytime.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => { setConfirmOpen(false); handleLogout(); }}>Sign Out</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;
