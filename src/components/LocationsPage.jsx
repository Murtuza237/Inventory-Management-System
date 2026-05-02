import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Skeleton, IconButton,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import api from '../api/axiosInstance';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '' });

  const fetchLocations = useCallback(async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data.locations || []);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  const handleOpenDialog = (loc = null) => {
    if (loc) {
      setEditing(loc);
      setForm({ name: loc.name, address: loc.address || '' });
    } else {
      setEditing(null);
      setForm({ name: '', address: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/locations/${editing._id}`, form);
      } else {
        await api.post('/locations', form);
      }
      setDialogOpen(false);
      fetchLocations();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this branch?')) return;
    try {
      await api.delete(`/locations/${id}`);
      fetchLocations();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Branches</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>
            Manage your warehouse and store locations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Branch
        </Button>
      </Box>

      {/* Branch Cards — VESTI style */}
      <Grid container spacing={3}>
        {locations.map((loc) => (
          <Grid item xs={12} md={6} key={loc._id}>
            <Card
              sx={{
                height: '100%',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Location header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 42, height: 42, borderRadius: '12px',
                        bgcolor: 'rgba(59,130,246,0.08)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <StorefrontRoundedIcon sx={{ color: '#3B82F6', fontSize: '1.3rem' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{loc.name}</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        📍 {loc.address || 'No address set'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(loc)} sx={{ color: '#3B82F6' }}>
                      <EditRoundedIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(loc._id)} sx={{ color: '#EF4444' }}>
                      <DeleteRoundedIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Stats row */}
                <Grid container spacing={2} sx={{ mb: 2.5 }}>
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor: 'rgba(16,185,129,0.06)', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                      <PeopleRoundedIcon sx={{ color: '#10B981', fontSize: '1.1rem', mb: 0.5 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>—</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>Staff</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ bgcolor: 'rgba(139,92,246,0.06)', borderRadius: '12px', p: 1.5, textAlign: 'center' }}>
                      <Inventory2RoundedIcon sx={{ color: '#8B5CF6', fontSize: '1.1rem', mb: 0.5 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>—</Typography>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>SKUs</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Manage button */}
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderRadius: '12px', py: 1.2, fontWeight: 600,
                    borderColor: 'rgba(0,0,0,0.12)',
                    color: 'text.primary',
                    '&:hover': { borderColor: '#3B82F6', color: '#3B82F6' },
                  }}
                >
                  Manage Branch
                </Button>

                {/* Trend indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 1.5, gap: 0.5 }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: '0.9rem', color: '#10B981' }} />
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#10B981' }}>Active</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {locations.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <StorefrontRoundedIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 1 }} />
              <Typography sx={{ color: 'text.secondary' }}>No branches yet. Click "Add Branch" to get started.</Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField
            label="Branch Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Address"
            fullWidth
            multiline
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name.trim()}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
