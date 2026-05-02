import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axiosInstance";
import { io } from "socket.io-client";
import { Typography, Card, CardContent, CardMedia, Grid, Box, Chip, Stack, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Snackbar, Alert, Paper, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useAuth } from "./AuthContext";
import { useLiveWeight } from "./LiveWeightContext";

const SOCKET_URL = 'http://localhost:5001';

const InventoryDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState({ name: "", weight: "", rfid: "", unit: "kg", price_per_kg: "", image: "", threshold: 5 });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const { role } = useAuth();
  const { liveKg, liveProductKey, liveByProduct } = useLiveWeight();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploading(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(prev => ({ ...prev, image: res.data.imageUrl }));
      setSnackbar({ open: true, message: 'Image uploaded', severity: 'success' });
    } catch (err) {
      console.error('Upload error:', err);
      setSnackbar({ open: true, message: 'Image upload failed', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventory");
      if (res.data && res.data.products) {
        setProducts(res.data.products.map(p => ({
          ...p,
          id: p._id,
          weight: p.currentWeight,
          threshold: p.lowStockThreshold
        })));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setSnackbar({ open: true, message: "Failed to load inventory", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('inventory:product_added', (newProduct) => {
      setProducts(prev => [...prev, { ...newProduct, id: newProduct._id, weight: newProduct.currentWeight, threshold: newProduct.lowStockThreshold }]);
    });

    socket.on('inventory:product_updated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct._id ? { ...updatedProduct, id: updatedProduct._id, weight: updatedProduct.currentWeight, threshold: updatedProduct.lowStockThreshold } : p));
    });

    socket.on('inventory:product_deleted', (data) => {
      setProducts(prev => prev.filter(p => p.id !== data.id));
    });

    socket.on('inventory:weight_update', (data) => {
      setProducts(prev => prev.map(p => p.id === data.productId ? { ...p, weight: data.currentWeight } : p));
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchProducts]);

  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1587049352847-ec20387b3b4f?auto=format&fit=crop&q=80&w=800";
    if (url.startsWith('/uploads/')) return `http://localhost:5001${url}`;
    return url;
  };

  const handleSave = async () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Name is required";
    if (form.weight === "" || Number(form.weight) < 0) e.weight = "Valid weight required";
    if (Number(form.price_per_kg) <= 0) e.price_per_kg = "Valid price required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      const payload = {
        name: form.name,
        currentWeight: Number(form.weight),
        rfid: form.rfid,
        unit: form.unit,
        price: Number(form.price_per_kg),
        category: form.category,
        image: form.image,
        lowStockThreshold: Number(form.threshold)
      };

      if (currentId) {
        await api.put(`/inventory/${currentId}`, payload);
        setSnackbar({ open: true, message: "Product updated", severity: "success" });
      } else {
        await api.post("/inventory", payload);
        setSnackbar({ open: true, message: "Product added", severity: "success" });
      }
      setEditOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      setSnackbar({ open: true, message: err.response?.data?.message || "Error saving product", severity: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/inventory/${currentId}`);
      setSnackbar({ open: true, message: "Product deactivated", severity: "info" });
      setConfirmDelete(false);
      setEditOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      setSnackbar({ open: true, message: "Error deleting product", severity: "error" });
    }
  };

  return (
    <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 }, position: "relative", width: "100%", maxWidth: "100%" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" align="left" fontWeight="bold">
          Inventory Dashboard
        </Typography>
        {(role === "admin" || role === "stockManager") && (
          <Button 
            variant="contained" 
            size="medium" 
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => { setCurrentId(null); setForm({ name: "", category: "Dry Fruits", weight: "", rfid: "", unit: "kg", price_per_kg: "", image: "", threshold: 5 }); setErrors({}); setEditOpen(true); }}
          >
            Add
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 4 } }}>
        {loading && products.length === 0 && (
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}><Skeleton width={200} /></Typography>
              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} alignItems="stretch">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`sk-${idx}`}>
                    <Card sx={{ borderRadius: { xs: "16px", sm: "20px" }, height: "100%", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
                      <Skeleton variant="rectangular" height={{ xs: 140, sm: 160, md: 200 }} />
                      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Skeleton variant="text" height={28} width="70%" sx={{ mx: "auto", mb: 1 }} />
                        <Skeleton variant="text" height={20} width="80%" sx={{ mx: "auto" }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        )}

        {!loading && ['Dry Fruits', 'Raw Herbs', ...Object.keys(products.reduce((acc, p) => { acc[p.category || 'Other'] = true; return acc; }, {})).filter(c => c !== 'Dry Fruits' && c !== 'Raw Herbs')].map((categoryName) => {
          const categoryProducts = products.filter(p => (p.category || 'Other') === categoryName);
          if (categoryProducts.length === 0) return null;
          
          return (
            <Paper key={categoryName} elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: { xs: 1.5, sm: 2 }, color: "primary.main", borderBottom: 1, borderColor: "divider", pb: 1 }}>
                  {categoryName}
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} alignItems="stretch">
                  {categoryProducts.map((p) => {
                    const unit = (p.unit || "kg").toLowerCase();
                    const liveKgForThis = (liveByProduct?.[p.id]?.current_weight_kg != null)
                      ? liveByProduct?.[p.id]?.current_weight_kg
                      : (liveProductKey === p.id ? liveKg : null);
                    const hasLive = liveKgForThis != null;
                    const currentWeightInUnit = hasLive
                      ? (unit === "g" ? Number(liveKgForThis) * 1000 : Number(liveKgForThis))
                      : Number(p.weight || 0);
                    const thresholdKg = Number(p.threshold || 5);
                    const thresholdInUnit = unit === "g" ? thresholdKg * 1000 : thresholdKg;
                    const isLowStock = currentWeightInUnit < thresholdInUnit;
                    const nearDelta = unit === "g" ? 1000 : 1;
                    const isNearThreshold = !isLowStock && currentWeightInUnit <= (thresholdInUnit + nearDelta);
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                        <Card
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            cursor: (role === "admin" || role === "stockManager") ? "pointer" : "default",
                          }}
                          onClick={() => {
                            if (role === "admin" || role === "stockManager") {
                              setCurrentId(p.id);
                              setForm({ 
                                name: p.name || "", 
                                category: p.category || "Dry Fruits",
                                weight: p.weight || p.currentWeight || "", 
                                rfid: p.rfid || "",
                                unit: p.unit || "kg", 
                                price_per_kg: p.price || "", 
                                image: p.imageUrl || p.image || "", 
                                threshold: p.threshold || p.lowStockThreshold || 5
                              });
                              setErrors({});
                              setEditOpen(true);
                            }
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={getImageUrl(p.imageUrl || p.image)}
                            alt={p.name}
                            sx={{ height: { xs: 140, sm: 160, md: 200 }, objectFit: "cover", backgroundColor: "#f5f5f5" }}
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1587049352847-ec20387b3b4f?auto=format&fit=crop&q=80&w=800"; }}
                          />
                          <CardContent sx={{ flexGrow: 1, textAlign: "center", p: { xs: 2, sm: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: { xs: 1, sm: 1.5 }, position: "relative" }}>
                            {isLowStock && <Chip label="Low Stock" color="error" size="small" sx={{ position: "absolute", top: { xs: 8, sm: 12 }, right: { xs: 8, sm: 12 }, fontSize: { xs: "0.65rem", sm: "0.7rem" }, height: { xs: 20, sm: 22 }, fontWeight: 600, zIndex: 1 }} />}
                            <Typography variant="h6" gutterBottom sx={{ color: "text.primary", fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" }, lineHeight: 1.3, pr: isLowStock ? { xs: 4, sm: 5 } : 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }}>
                              {p.name}
                            </Typography>
                            {isLowStock && <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.875rem" }, mb: 0.5 }}>⚠️ Low Stock Alert</Typography>}
                            <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} justifyContent="center" flexWrap="wrap" sx={{ gap: { xs: 0.5, sm: 0.75 } }}>
                              <Chip 
                                label={`${currentWeightInUnit.toFixed(unit === "g" ? 0 : 2)} ${unit}${hasLive ? " • LIVE" : ""}`} 
                                color={isLowStock ? "error" : (isNearThreshold ? "warning" : "default")} 
                                variant={isLowStock || isNearThreshold ? "filled" : "outlined"} 
                                size="small"
                                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, height: { xs: 24, sm: 28 }, fontWeight: isLowStock ? 600 : 400 }}
                              />
                              <Chip label={`₹ ${Number(p.price || 0).toFixed(2)} / kg`} variant="outlined" size="small" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, height: { xs: 24, sm: 28 } }} />
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{currentId ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "grid", gap: 2 }}>
          <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={Boolean(errors.name)} helperText={errors.name} />
          <TextField select label="Category" fullWidth value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <MenuItem value="Dry Fruits">Dry Fruits</MenuItem>
            <MenuItem value="Raw Herbs">Raw Herbs</MenuItem>
            <MenuItem value="Exotic Spices">Exotic Spices</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField label="RFID Tag" fullWidth value={form.rfid} onChange={(e) => setForm({ ...form, rfid: e.target.value })} helperText="Used for IoT auto-weight updates" />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Starting Weight" type="number" fullWidth value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} error={Boolean(errors.weight)} helperText={errors.weight} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Unit" fullWidth value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="g">g</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Price/kg" type="number" fullWidth value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} error={Boolean(errors.price_per_kg)} helperText={errors.price_per_kg} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Low Stock Threshold (kg)" type="number" fullWidth value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
            </Grid>
          </Grid>
          {/* Image upload section */}
          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, textAlign: 'center' }}>
            {form.image && (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={getImageUrl(form.image)} 
                  alt="Product preview" 
                  style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </Box>
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={uploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : (form.image ? 'Change Image' : 'Upload Image')}
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
              JPG, PNG, GIF, WebP • Max 5MB
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          {currentId && <Button color="error" onClick={() => setConfirmDelete(true)}>Delete</Button>}
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent><Typography>This will deactivate the product in the database.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryDashboard;
