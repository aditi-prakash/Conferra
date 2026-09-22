import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const NOTIFICATIONS_KEY = "conferra_notifications";
const SCHEDULED_KEY = "scheduledMeetings";
const SETTINGS_KEY = "conferra_settings";

export default function NotificationCenter({ isDarkMode, userData, navigate }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const open = Boolean(anchorEl);

  const loadNotifications = () => {
    // Check user preference
    const settingsRaw = localStorage.getItem(SETTINGS_KEY);
    const settings = settingsRaw ? JSON.parse(settingsRaw) : { notifications: true };
    if (settings.notifications === false) {
      setNotifications([]);
      return;
    }

    let items = [];
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      try {
        items = JSON.parse(stored);
      } catch (e) {
        items = [];
      }
    }

    // Default welcome notification if empty
    if (items.length === 0) {
      items = [
        {
          id: "welcome-1",
          title: "Welcome to Conferra!",
          message: `Hello ${userData?.name || userData?.username || "there"}, your account is ready for HD video meetings.`,
          type: "info",
          read: false,
          time: new Date().toISOString(),
        },
        {
          id: "security-1",
          title: "End-to-End Encrypted Signaling",
          message: "All video call rooms use WebRTC peer connections with encrypted signaling.",
          type: "system",
          read: false,
          time: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }

    // Dynamic sync with scheduled meetings
    const scheduledRaw = localStorage.getItem(SCHEDULED_KEY);
    if (scheduledRaw) {
      try {
        const scheduled = JSON.parse(scheduledRaw);
        scheduled.forEach((m) => {
          const notifId = `sched-${m.id}`;
          if (!items.some((item) => item.id === notifId)) {
            items.unshift({
              id: notifId,
              title: `Upcoming Meeting: ${m.title}`,
              message: `Scheduled for ${new Date(m.dateTime).toLocaleString()}. Room: ${m.roomId}`,
              type: "meeting",
              roomId: m.roomId,
              read: false,
              time: new Date().toISOString(),
            });
          }
        });
      } catch (e) {
        console.warn("Could not sync scheduled meetings:", e);
      }
    }

    setNotifications(items);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(items));
  };

  useEffect(() => {
    loadNotifications();
  }, [userData?.username]);

  const handleOpen = (event) => {
    loadNotifications();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case "meeting":
        return <VideoCallIcon sx={{ color: "#d97500" }} />;
      case "schedule":
        return <EventAvailableIcon sx={{ color: "#3b82f6" }} />;
      case "system":
        return <CheckCircleOutlineIcon sx={{ color: "#10b981" }} />;
      default:
        return <InfoOutlinedIcon sx={{ color: "#6366f1" }} />;
    }
  };

  const fgColor = isDarkMode ? "#fff" : "#1e293b";
  const bgColor = isDarkMode ? "#15284f" : "#ffffff";
  const cardBorder = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          bgcolor: isDarkMode ? "rgba(255,255,255,0.14)" : "rgba(21,40,79,0.1)",
          color: isDarkMode ? "#fff" : "#15284f",
          transition: "transform 0.2s ease",
          "&:hover": { transform: "scale(1.05)" },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            borderRadius: 3,
            bgcolor: bgColor,
            color: fgColor,
            border: `1px solid ${cardBorder}`,
            boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight={700} fontSize="1.05rem">
              Notifications
            </Typography>
            {unreadCount > 0 ? (
              <Chip label={`${unreadCount} new`} size="small" sx={{ bgcolor: "#d97500", color: "#fff", fontWeight: 700, height: 20, fontSize: 11 }} />
            ) : null}
          </Stack>
          <Stack direction="row" spacing={0.5}>
            {unreadCount > 0 ? (
              <Button size="small" onClick={markAllAsRead} sx={{ fontSize: 11, color: "#d97500", textTransform: "none" }}>
                Read All
              </Button>
            ) : null}
            {notifications.length > 0 ? (
              <IconButton size="small" onClick={clearAll} title="Clear All" sx={{ color: isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Stack>
        </Box>
        <Divider sx={{ borderColor: cardBorder }} />

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <NotificationsNoneIcon sx={{ fontSize: 40, opacity: 0.4, mb: 1 }} />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              No notifications at this time
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 380, overflowY: "auto" }}>
            {notifications.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem
                  onClick={() => markAsRead(item.id)}
                  sx={{
                    alignItems: "flex-start",
                    gap: 1.5,
                    p: 1.8,
                    cursor: "pointer",
                    bgcolor: !item.read ? (isDarkMode ? "rgba(217, 117, 0, 0.12)" : "rgba(217, 117, 0, 0.06)") : "transparent",
                    transition: "background 0.2s ease",
                    "&:hover": { bgcolor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)" },
                  }}
                >
                  <Box sx={{ mt: 0.3 }}>{getIcon(item.type)}</Box>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={!item.read ? 700 : 500} fontSize="0.9rem">
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.4 }}>
                        <Typography variant="body2" fontSize="0.8rem" sx={{ opacity: 0.85, color: "inherit" }}>
                          {item.message}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" fontSize="0.7rem" sx={{ opacity: 0.6 }}>
                            {new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </Typography>
                          {item.roomId ? (
                            <Button
                              size="small"
                              variant="contained"
                              sx={{
                                bgcolor: "#d97500",
                                fontSize: "0.7rem",
                                py: 0.2,
                                px: 1,
                                minWidth: 0,
                                textTransform: "none",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClose();
                                navigate(`/meeting/${item.roomId}`);
                              }}
                            >
                              Join Now
                            </Button>
                          ) : null}
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider sx={{ borderColor: cardBorder }} />
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
