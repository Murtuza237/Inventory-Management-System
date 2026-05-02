import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axiosInstance";
import { io } from "socket.io-client";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Divider,
  CardMedia,
  Snackbar,
  Alert,
  Chip,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLiveWeight } from "./LiveWeightContext";

const SOCKET_URL = 'http://localhost:5001';

const BillingPanel = () => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [total, setTotal] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [quantities, setQuantities] = useState({}); // id -> kg
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const { liveKg, liveProductKey, liveByProduct } = useLiveWeight();
  const [editQtyOpen, setEditQtyOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editQtyValue, setEditQtyValue] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/inventory");
      if (res.data && res.data.products) {
        setProducts(res.data.products.map(p => ({
          ...p,
          id: p._id,
          weight: p.currentWeight,
          price_per_kg: p.price,
          total_value: (p.currentWeight * p.price).toFixed(2),
        })));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }, []);

  const fetchBills = useCallback(async () => {
    try {
      const res = await api.get("/billing");
      if (res.data && res.data.transactions) {
        setBills(res.data.transactions.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProducts(), fetchBills()]).finally(() => setLoading(false));

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('billing:transaction_created', () => {
      fetchBills();
      fetchProducts();
    });

    socket.on('inventory:weight_update', (data) => {
      setProducts(prev => prev.map(p => p.id === data.productId ? { ...p, weight: data.currentWeight, total_value: (data.currentWeight * p.price_per_kg).toFixed(2) } : p));
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchProducts, fetchBills]);

  const handleSelect = (p) => {
    let updated;
    if (selected.includes(p.id)) {
      updated = selected.filter((id) => id !== p.id);
    } else {
      updated = [...selected, p.id];
    }
    setSelected(updated);
    if (updated.includes(p.id) && !quantities[p.id]) {
        setQuantities(prev => ({ ...prev, [p.id]: 1 }));
    }
  };

  useEffect(() => {
    const totalVal = products
      .filter((prod) => selected.includes(prod.id))
      .reduce((sum, prod) => {
        const qty = Number(quantities[prod.id] ?? 1);
        const price = Number(prod.price_per_kg ?? 0);
        return sum + qty * price;
      }, 0);
    setTotal(totalVal.toFixed(2));
  }, [selected, quantities, products]);

  const generateBill = async () => {
    setConfirmOpen(true);
  };

  const confirmGenerate = async () => {
    try {
      const payload = {
        items: selected.map(id => ({
          productId: id,
          quantity: Number(quantities[id] ?? 1)
        })),
        paymentMethod: paymentMethod
      };

      await api.post("/billing", payload);
      setSnackbar({ open: true, message: "Bill generated & stock updated", severity: "success" });
      setSelected([]);
      setQuantities({});
      setConfirmOpen(false);
      fetchBills();
      fetchProducts();
    } catch (err) {
      console.error("Billing error:", err);
      setSnackbar({ open: true, message: err.response?.data?.message || "Error generating bill", severity: "error" });
    }
  };

  return (
    <Box sx={{ py: { xs: 2, sm: 3 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" align="left" fontWeight="bold" gutterBottom sx={{ mb: { xs: 3, sm: 4 } }}>
        🧾 Billing Panel
      </Typography>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} alignItems="stretch">
        {products.map((p) => {
          const unit = (p.unit || "kg").toLowerCase();
          const liveKgForThis = (liveByProduct?.[p.id]?.current_weight_kg != null)
            ? liveByProduct?.[p.id]?.current_weight_kg
            : (liveProductKey === p.id ? liveKg : null);
          const hasLive = liveKgForThis != null;
          const currentWeightInUnit = hasLive
            ? (unit === "g" ? Number(liveKgForThis) * 1000 : Number(liveKgForThis))
            : Number(p.weight || 0);
          const thresholdKg = Number(p.lowStockThreshold || 5);
          const thresholdInUnit = unit === "g" ? thresholdKg * 1000 : thresholdKg;
          const isLowStock = currentWeightInUnit < thresholdInUnit;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
              <Card sx={{ borderRadius: { xs: "16px", sm: "20px" }, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <CardMedia 
                component="img" 
                image={p.imageUrl || p.image || "https://images.unsplash.com/photo-1587049352847-ec20387b3b4f?auto=format&fit=crop&q=80&w=800"} 
                alt={p.name} 
                sx={{ height: { xs: 140, sm: 160, md: 180 }, objectFit: "cover", backgroundColor: "#f5f5f5" }} 
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1587049352847-ec20387b3b4f?auto=format&fit=crop&q=80&w=800"; }}
              />
              <CardContent sx={{ flexGrow: 1, textAlign: "center", p: { xs: 2, sm: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: { xs: 1, sm: 1.5 } }}>
                <Typography variant="h6" fontWeight="600" sx={{ fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" }, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word' }}>{p.name}</Typography>
                {isLowStock && <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600 }}>⚠️ Low Stock</Typography>}
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Chip label={`${currentWeightInUnit.toFixed(unit === "g" ? 0 : 2)} ${unit}`} color={isLowStock ? "error" : "default"} variant="outlined" size="small" />
                  <Chip label={`₹ ${p.price_per_kg}/kg`} variant="outlined" size="small" />
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between" }}>
                <FormControlLabel control={<Checkbox checked={selected.includes(p.id)} onChange={() => handleSelect(p)} size="small" />} label="Bill" />
                {selected.includes(p.id) && (
                  <TextField size="small" type="number" label="Qty" value={quantities[p.id] ?? 1} 
                    onChange={(e) => setQuantities(prev => ({ ...prev, [p.id]: Math.max(0, e.target.value) }))}
                    inputProps={{ step: 0.1, min: 0 }} sx={{ width: 80 }} />
                )}
              </CardActions>
            </Card>
          </Grid>
        );
        })}
        </Grid>
      </Paper>

      {selected.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>📋 Bill Preview</Typography>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>Item</TableCell><TableCell align="right">Qty</TableCell><TableCell align="right">Price</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead>
                <TableBody>
                  {products.filter(p => selected.includes(p.id)).map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell align="right">{Number(quantities[p.id] ?? 1).toFixed(2)}</TableCell>
                      <TableCell align="right">₹ {p.price_per_kg.toFixed(2)}</TableCell>
                      <TableCell align="right">₹ {(Number(quantities[p.id] ?? 1) * p.price_per_kg).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow><TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>Total:</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>₹ {total}</TableCell></TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Payment</InputLabel>
                    <Select value={paymentMethod} label="Payment" onChange={(e) => setPaymentMethod(e.target.value)}>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="upi">UPI</MenuItem>
                        <MenuItem value="card">Card</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" size="large" onClick={generateBill}>Generate Bill</Button>
            </Box>
          </Paper>
        </Box>
      )}

      {bills.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>📜 Recent Bills</Typography>
          {bills.map((bill) => (
            <Accordion key={bill._id} sx={{ mb: 1, borderRadius: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", pr: 2 }}>
                    <Typography fontWeight="bold">{bill.invoiceNumber}</Typography>
                    <Typography color="primary.main" fontWeight="bold">₹ {bill.finalAmount.toFixed(2)}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">Date: {new Date(bill.createdAt).toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">Method: {bill.paymentMethod}</Typography>
                  <Divider sx={{ my: 1 }} />
                  {bill.items.map((it, idx) => (
                      <Typography key={idx} variant="body2">{it.productName}: {it.quantity} {it.unit} @ ₹{it.pricePerUnit} = ₹{it.subtotal}</Typography>
                  ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Bill Generation?</DialogTitle>
        <DialogContent><DialogContentText>This will deduct stock and record the transaction.</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmGenerate}>Confirm</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BillingPanel;
