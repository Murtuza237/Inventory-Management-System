import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axiosInstance";
import { Box, Paper, Typography, TextField, Button, Grid, MenuItem, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert } from "@mui/material";

const ManageUsers = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("manager");
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/auth/users");
      if (res.data && res.data.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      // Only show error if not a 403 (e.g. if the user just logged out or isn't admin)
      if (err.response?.status !== 403) {
        setSnackbar({ open: true, message: "Failed to load users", severity: "error" });
      }
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    if (!password || password.length < 6) errs.password = "Min 6 characters";
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setSubmitting(true);
      await api.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      setSnackbar({ open: true, message: `User ${email} added as ${role}`, severity: "success" });
      setEmail("");
      setPassword("");
      setName("");
      setRole("stockManager");
      fetchUsers();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err.response?.data?.message || "Error creating user", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (userId, nextRole) => {
    try {
      await api.put(`/auth/users/${userId}/role`, { role: nextRole });
      setSnackbar({ open: true, message: "Role updated", severity: "info" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to update role", severity: "error" });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/auth/users/${userId}`);
      setSnackbar({ open: true, message: "User removed", severity: "warning" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete user", severity: "error" });
    }
  };

  return (
    <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} align="left" sx={{ mb: 3 }}>
        Manage Users
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Existing Users
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "grid", gap: 2.0 }}>
              {users.map((u) => (
                <Paper 
                  key={u._id} 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    display: "flex", 
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" }, 
                    justifyContent: "space-between",
                    gap: { xs: 2, sm: 0 }
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={600}>{u.name || "Unnamed"}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{u.email}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: { xs: "100%", sm: "auto" } }}>
                    <TextField 
                      select 
                      size="small" 
                      value={u.role} 
                      onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      sx={{ width: 150 }}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="worker">Worker</MenuItem>
                      <MenuItem value="owner">Owner</MenuItem>
                    </TextField>
                    <Button variant="outlined" color="error" onClick={() => setConfirmId(u._id)}>Delete</Button>
                  </Box>
                </Paper>
              ))}
              {users.length === 0 && (
                <Typography color="text.secondary">No users found.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Create User
            </Typography>
            <Box component="form" onSubmit={handleAddUser} sx={{ display: "grid", gap: 2 }}>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth error={Boolean(fieldErrors.name)} helperText={fieldErrors.name} />
              <TextField type="email" label="User Email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth error={Boolean(fieldErrors.email)} helperText={fieldErrors.email} />
              <TextField type="password" label="User Password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth error={Boolean(fieldErrors.password)} helperText={fieldErrors.password} />
              <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)} fullWidth>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="worker">Worker</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
              </TextField>
              <Button type="submit" variant="contained" disabled={submitting} fullWidth>{submitting ? "Adding..." : "Add User"}</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={Boolean(confirmId)} onClose={() => setConfirmId(null)}>
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <DialogContentText>This permanently removes the user from the system.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={async () => { await handleDeleteUser(confirmId); setConfirmId(null); }}>Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageUsers;
