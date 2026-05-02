import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Skeleton,
} from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import api from '../api/axiosInstance';
import { statCardPalette } from '../theme';

/* ─── Stat Card ─────────────────────────────────────────────────── */
function StatCard({ label, value, icon, palette, trend }) {
  return (
    <Card
      sx={{
        bgcolor: palette.bg,
        boxShadow: 'none',
        border: 'none',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{ color: palette.color, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ color: palette.color, fontWeight: 800, fontSize: '2rem' }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.7)', borderRadius: '12px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {React.cloneElement(icon, { sx: { color: palette.icon, fontSize: '1.5rem' } })}
          </Box>
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5, gap: 0.5 }}>
            {trend >= 0 ? (
              <TrendingUpRoundedIcon sx={{ fontSize: '1rem', color: '#10B981' }} />
            ) : (
              <TrendingDownRoundedIcon sx={{ fontSize: '1rem', color: '#EF4444' }} />
            )}
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: trend >= 0 ? '#10B981' : '#EF4444' }}>
              {trend >= 0 ? '+' : ''}{trend}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Low Stock Alert Item ──────────────────────────────────────── */
function LowStockItem({ product }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} />
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{product.name}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            {product.location?.name || 'Unassigned'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#EF4444' }}>
          {product.currentWeight} {product.unit}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
          Reorder: {product.lowStockThreshold}
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── Recent Transaction Item ───────────────────────────────────── */
function TxnItem({ txn }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{txn.invoiceNumber}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          {new Date(txn.createdAt).toLocaleDateString()} • {txn.items?.length || 0} items
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#10B981' }}>
          ₹{txn.finalAmount?.toLocaleString()}
        </Typography>
        <Chip
          label={txn.paymentMethod}
          size="small"
          sx={{ fontSize: '0.6rem', height: 20, bgcolor: 'rgba(59,130,246,0.08)', color: '#3B82F6' }}
        />
      </Box>
    </Box>
  );
}

/* ─── Dashboard Page ────────────────────────────────────────────── */
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, lowStockRes, txnRes] = await Promise.all([
          api.get('/inventory'),
          api.get('/inventory/low-stock'),
          api.get('/billing?limit=8'),
        ]);

        const products = productsRes.data.products || [];
        const totalProducts = products.length;
        const totalValue = products.reduce((s, p) => s + (p.price * p.stockQuantity), 0);
        const lowStockCount = lowStockRes.data.products?.length || 0;
        const txns = txnRes.data.transactions || [];
        const totalRevenue = txns.reduce((s, t) => s + (t.finalAmount || 0), 0);

        setStats({
          totalProducts,
          totalRevenue: Math.round(totalRevenue),
          lowStockCount,
          totalTransactions: txnRes.data.total || txns.length,
        });
        setLowStock(lowStockRes.data.products || []);
        setRecentTxns(txns);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1,2,3,4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: '20px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: '20px' }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Dashboard
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>
          Real-time overview of your inventory system
        </Typography>
      </Box>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Products"
            value={stats?.totalProducts || 0}
            icon={<Inventory2RoundedIcon />}
            palette={statCardPalette.products}
            trend={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Revenue"
            value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={<AttachMoneyRoundedIcon />}
            palette={statCardPalette.revenue}
            trend={8.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Low Stock"
            value={stats?.lowStockCount || 0}
            icon={<WarningAmberRoundedIcon />}
            palette={statCardPalette.lowStock}
            trend={-2.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Transactions"
            value={stats?.totalTransactions || 0}
            icon={<ReceiptLongRoundedIcon />}
            palette={statCardPalette.transactions}
            trend={5}
          />
        </Grid>
      </Grid>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <Grid container spacing={2.5}>
        {/* Recent Transactions */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Recent Transactions</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Latest billing activity</Typography>
                </Box>
                <Chip
                  label={`${recentTxns.length} shown`}
                  size="small"
                  sx={{ bgcolor: 'rgba(59,130,246,0.08)', color: '#3B82F6', fontWeight: 600, fontSize: '0.7rem' }}
                />
              </Box>
              {recentTxns.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>No transactions yet</Typography>
              ) : (
                recentTxns.map((txn) => <TxnItem key={txn._id} txn={txn} />)
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Low Stock Alerts</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>Items below reorder level</Typography>
                </Box>
                <Chip
                  label={`${lowStock.length} items`}
                  size="small"
                  sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 600, fontSize: '0.7rem' }}
                />
              </Box>
              {lowStock.length === 0 ? (
                <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>All stock levels healthy ✓</Typography>
              ) : (
                lowStock.map((p) => <LowStockItem key={p._id} product={p} />)
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
