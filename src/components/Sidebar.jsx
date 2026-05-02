import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import InventoryRoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { sidebarColors } from '../theme';
import { useAuth } from './AuthContext';

const SIDEBAR_WIDTH = sidebarColors.width;

const navItems = [
  { label: 'Dashboard',  path: '/dashboard',    icon: <DashboardRoundedIcon />,   roles: ['admin', 'manager', 'worker', 'owner'] },
  { label: 'Inventory',  path: '/inventory',     icon: <InventoryRoundedIcon />,   roles: ['admin', 'manager', 'worker', 'owner'] },
  { label: 'Billing',    path: '/billing',        icon: <ReceiptLongRoundedIcon />, roles: ['admin', 'manager'] },
  { label: 'Branches',   path: '/locations',      icon: <StorefrontRoundedIcon />,  roles: ['admin', 'owner'] },
  { label: 'Users',      path: '/manage-users',   icon: <PeopleRoundedIcon />,      roles: ['admin'] },
];

export default function Sidebar({ unreadNotifications = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bgcolor: sidebarColors.bg,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200,
        overflowY: 'auto',
      }}
    >
      {/* Logo / Brand */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          📦 SmartInventory
        </Typography>
        <Typography sx={{ color: sidebarColors.text, fontSize: '0.7rem', mt: 0.5 }}>
          Management System
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '12px',
                mb: 0.5,
                px: 2,
                py: 1.2,
                color: isActive(item.path) ? sidebarColors.textActive : sidebarColors.text,
                bgcolor: isActive(item.path) ? sidebarColors.activeItem : 'transparent',
                '&:hover': {
                  bgcolor: isActive(item.path) ? sidebarColors.activeItem : sidebarColors.hoverItem,
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? '#fff' : sidebarColors.text,
                  minWidth: 40,
                  '& .MuiSvgIcon-root': { fontSize: '1.25rem' },
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          ))}

        {/* Notifications */}
        <ListItemButton
          onClick={() => navigate('/notifications')}
          sx={{
            borderRadius: '12px',
            mb: 0.5,
            px: 2,
            py: 1.2,
            color: isActive('/notifications') ? sidebarColors.textActive : sidebarColors.text,
            bgcolor: isActive('/notifications') ? sidebarColors.activeItem : 'transparent',
            '&:hover': {
              bgcolor: isActive('/notifications') ? sidebarColors.activeItem : sidebarColors.hoverItem,
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: isActive('/notifications') ? '#fff' : sidebarColors.text,
              minWidth: 40,
              '& .MuiSvgIcon-root': { fontSize: '1.25rem' },
            }}
          >
            <Badge badgeContent={unreadNotifications} color="error" max={99}>
              <NotificationsRoundedIcon />
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary="Notifications"
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive('/notifications') ? 600 : 400 }}
          />
        </ListItemButton>
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Bottom section */}
      <List sx={{ px: 1.5, py: 1 }}>
        <Tooltip title="Profile" placement="right">
          <ListItemButton
            onClick={() => navigate('/profile')}
            sx={{
              borderRadius: '12px',
              mb: 0.5,
              px: 2,
              py: 1.2,
              color: isActive('/profile') ? sidebarColors.textActive : sidebarColors.text,
              bgcolor: isActive('/profile') ? sidebarColors.activeItem : 'transparent',
              '&:hover': { bgcolor: sidebarColors.hoverItem },
            }}
          >
            <ListItemIcon sx={{ color: isActive('/profile') ? '#fff' : sidebarColors.text, minWidth: 40 }}>
              <SettingsRoundedIcon sx={{ fontSize: '1.25rem' }} />
            </ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        </Tooltip>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '12px',
            px: 2,
            py: 1.2,
            color: '#EF4444',
            '&:hover': { bgcolor: 'rgba(239,68,68,0.10)' },
          }}
        >
          <ListItemIcon sx={{ color: '#EF4444', minWidth: 40 }}>
            <LogoutRoundedIcon sx={{ fontSize: '1.25rem' }} />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
        </ListItemButton>
      </List>

      {/* User avatar */}
      <Box sx={{ px: 2, pb: 2, pt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{ width: 36, height: 36, bgcolor: '#3B82F6', fontSize: '0.85rem', fontWeight: 700 }}
          src={user?.photoURL}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : <PersonRoundedIcon />}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography sx={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {user?.name || 'User'}
          </Typography>
          <Typography sx={{ color: sidebarColors.text, fontSize: '0.65rem', textTransform: 'capitalize' }}>
            {role || 'member'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export { SIDEBAR_WIDTH };
