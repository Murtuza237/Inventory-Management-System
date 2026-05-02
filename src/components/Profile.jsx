import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthContext';
import { Box, Paper, Typography, Avatar, Grid, Divider, Stack, TextField, Button, Snackbar, Alert } from '@mui/material';

const Profile = () => {
  const { user, role, setUser } = useAuth();
  const [bizForm, setBizForm] = useState({ name: '', owner: '', phone: '', email: '', address: '', gstin: '', registrationNo: '', logoUrl: '' });
  const [bizSaving, setBizSaving] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', photoURL: '' });
  const [userSaving, setUserSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bizErrors, setBizErrors] = useState({});
  const [userErrors, setUserErrors] = useState({});

  useEffect(() => {
    if (user) {
      setUserForm({
        name: user.name || '',
        photoURL: user.photoURL || ''
      });
      if (user.business) {
        setBizForm({
          name: user.business.name || '',
          owner: user.business.owner || '',
          phone: user.business.phone || '',
          email: user.business.email || '',
          address: user.business.address || '',
          gstin: user.business.gstin || '',
          registrationNo: user.business.registrationNo || '',
          logoUrl: user.business.logoUrl || ''
        });
      }
    }
  }, [user]);

  const initials = (user?.name?.trim()?.[0] || user?.email?.trim()?.[0] || 'U').toUpperCase();

  const isValidEmail = (v) => {
    const s = (v || '').trim();
    return !s || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(s);
  };
  const isValidPhone = (v) => {
    const digits = (v || '').replace(/\D/g, '');
    return !digits || digits.length === 10;
  };
  const isValidUrl = (v) => !v || /^(https?:)\/\//i.test(v);

  const validateBusiness = () => {
    const e = {};
    if (!bizForm.name?.trim()) e.name = 'Business name is required';
    if (!isValidPhone(bizForm.phone)) e.phone = 'Invalid phone';
    if (!isValidEmail(bizForm.email)) e.email = 'Invalid email';
    if (!isValidUrl(bizForm.logoUrl)) e.logoUrl = 'Invalid URL';
    setBizErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateUser = () => {
    const e = {};
    if (!userForm.name?.trim()) e.name = 'Name is required';
    if (!isValidUrl(userForm.photoURL)) e.photoURL = 'Invalid URL';
    setUserErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveBusiness = async () => {
    if (!validateBusiness()) return;
    setBizSaving(true);
    try {
      const res = await api.put('/auth/me', { business: bizForm });
      setUser(res.data.user);
      setSnackbar({ open: true, message: 'Business details saved', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to save business details', severity: 'error' });
    } finally {
      setBizSaving(false);
    }
  };

  const saveUserProfile = async () => {
    if (!validateUser()) return;
    setUserSaving(true);
    try {
      const res = await api.put('/auth/me', userForm);
      setUser(res.data.user);
      setSnackbar({ open: true, message: 'Profile updated', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    } finally {
      setUserSaving(false);
    }
  };

  return (
    <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} align="center" sx={{ mb: 3 }}>Profile</Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, display: 'grid', gap: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={user?.photoURL} sx={{ width: 56, height: 56, bgcolor: 'secondary.main' }}>{!user?.photoURL && initials}</Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>Role: {role}</Typography>
              </Box>
            </Stack>
            <Divider />
            <Typography variant="subtitle1" fontWeight={600}>Edit Profile</Typography>
            <TextField label="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} fullWidth error={!!userErrors.name} helperText={userErrors.name} />
            <TextField label="Photo URL" value={userForm.photoURL} onChange={(e) => setUserForm({ ...userForm, photoURL: e.target.value })} fullWidth error={!!userErrors.photoURL} helperText={userErrors.photoURL} />
            <Button variant="contained" onClick={saveUserProfile} disabled={userSaving}>{userSaving ? 'Saving...' : 'Save Profile'}</Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, display: 'grid', gap: 2 }}>
            <Typography variant="h6" fontWeight={700}>Business Details</Typography>
            <Divider />
            {role === 'admin' ? (
              <>
                <TextField label="Business Name" value={bizForm.name} onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })} fullWidth error={!!bizErrors.name} helperText={bizErrors.name} />
                <TextField label="Owner" value={bizForm.owner} onChange={(e) => setBizForm({ ...bizForm, owner: e.target.value })} fullWidth />
                <Grid container spacing={2}>
                    <Grid item xs={6}><TextField label="Phone" value={bizForm.phone} onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })} fullWidth /></Grid>
                    <Grid item xs={6}><TextField label="Email" value={bizForm.email} onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })} fullWidth /></Grid>
                </Grid>
                <TextField label="Address" value={bizForm.address} onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })} fullWidth multiline rows={2} />
                <Grid container spacing={2}>
                    <Grid item xs={6}><TextField label="GSTIN" value={bizForm.gstin} onChange={(e) => setBizForm({ ...bizForm, gstin: e.target.value })} fullWidth /></Grid>
                    <Grid item xs={6}><TextField label="Reg No." value={bizForm.registrationNo} onChange={(e) => setBizForm({ ...bizForm, registrationNo: e.target.value })} fullWidth /></Grid>
                </Grid>
                <TextField label="Logo URL" value={bizForm.logoUrl} onChange={(e) => setBizForm({ ...bizForm, logoUrl: e.target.value })} fullWidth />
                <Button variant="contained" onClick={saveBusiness} disabled={bizSaving}>{bizSaving ? 'Saving...' : 'Save Business'}</Button>
              </>
            ) : (
                <Typography color="text.secondary">Business details can only be edited by an admin.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
