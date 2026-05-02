import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Button, Skeleton,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import api from '../api/axiosInstance';

const typeConfig = {
  low_stock: { icon: <WarningAmberRoundedIcon />, color: '#EF4444', bg: 'rgba(239,68,68,0.06)', label: 'Low Stock' },
  system:    { icon: <InfoRoundedIcon />,          color: '#3B82F6', bg: 'rgba(59,130,246,0.06)', label: 'System' },
  info:      { icon: <CheckCircleRoundedIcon />,   color: '#10B981', bg: 'rgba(16,185,129,0.06)', label: 'Info' },
};

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications?limit=50');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '20px', mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Notifications</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up ✓'}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<DoneAllRoundedIcon />}
            onClick={markAllAsRead}
            size="small"
            sx={{ borderRadius: '12px' }}
          >
            Mark All Read
          </Button>
        )}
      </Box>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: '3rem', color: '#10B981', mb: 1 }} />
          <Typography sx={{ color: 'text.secondary' }}>No notifications yet</Typography>
        </Card>
      ) : (
        notifications.map((n) => {
          const config = typeConfig[n.type] || typeConfig.info;
          return (
            <Card
              key={n._id}
              sx={{
                mb: 1.5,
                border: n.isRead ? '1px solid rgba(0,0,0,0.04)' : `1px solid ${config.color}20`,
                bgcolor: n.isRead ? 'background.paper' : config.bg,
                cursor: n.isRead ? 'default' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: n.isRead ? 'none' : 'translateX(4px)' },
              }}
              onClick={() => !n.isRead && markAsRead(n._id)}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    bgcolor: `${config.color}15`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {React.cloneElement(config.icon, { sx: { color: config.color, fontSize: '1.1rem' } })}
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.85rem' }}>{n.title}</Typography>
                    <Chip
                      label={config.label}
                      size="small"
                      sx={{ fontSize: '0.6rem', height: 20, bgcolor: `${config.color}12`, color: config.color, fontWeight: 600 }}
                    />
                  </Box>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem', mb: 0.5 }}>{n.message}</Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    {new Date(n.createdAt).toLocaleString()}
                    {n.location?.name && ` • ${n.location.name}`}
                  </Typography>
                </Box>
                {!n.isRead && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: config.color, flexShrink: 0, mt: 0.5 }} />
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
}
