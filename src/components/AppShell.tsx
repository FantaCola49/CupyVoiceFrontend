// File: src/components/AppShell.tsx
import React from "react";
import {
  AppBar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink, useLocation } from "react-router-dom";

type Props = { children: React.ReactNode };

const drawerWidth = 240;

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Поиск", to: "/", icon: <SearchIcon /> },
  { label: "Админка", to: "/admin", icon: <AdminPanelSettingsIcon /> },
];

export default function AppShell({ children }: Props) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isSelected = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  const drawerContent = (
    <Box sx={{ height: "100%" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
          CopyVoiceSite
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={isSelected(item.to)}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              my: 0.5,
              "&.Mui-selected": {
                bgcolor: "rgba(229,9,20,0.18)",
                border: "1px solid rgba(229,9,20,0.25)",
              },
              "&.Mui-selected:hover": {
                bgcolor: "rgba(229,9,20,0.22)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 700 }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ p: 2, opacity: 0.65 }}>
        <Typography variant="caption">
          Dev mode · левое меню — навигация
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage:
          "radial-gradient(1200px 600px at 20% -10%, rgba(229,9,20,0.25), transparent 60%)," +
          "radial-gradient(900px 500px at 90% 10%, rgba(120,80,255,0.18), transparent 55%)",
        display: "flex",
      }}
    >
      {/* Top bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          backgroundColor: "rgba(10,10,14,0.55)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {/* Mobile hamburger */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((v) => !v)}
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
            {isSelected("/admin") ? "Админка" : "Поиск"}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Left drawer - desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", sm: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(17,17,26,0.7)",
            backdropFilter: "blur(10px)",
            backgroundImage: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Left drawer - mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            bgcolor: "rgba(17,17,26,0.85)",
            backdropFilter: "blur(10px)",
            backgroundImage: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Spacer under AppBar */}
        <Toolbar />

        <Container sx={{ py: 3 }}>{children}</Container>
      </Box>
    </Box>
  );
}