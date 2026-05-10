import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import withAuth from "../utils/withAuth";

const SETTINGS_KEY = "conferra_settings";

function ProfilePage() {
  const navigate = useNavigate();
  const { userData, logout, updateProfile, isDarkMode, toggleTheme } = useContext(AuthContext);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: userData?.username || "",
    avatar: userData?.avatar || "",
  });
  const [settings, setSettings] = useState({
    email: "",
    phone: "",
    notifications: true,
    updates: false,
  });

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      setSettings(JSON.parse(raw));
    }
  }, [userData?.avatar, userData?.username]);

  const saveSettings = async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaving(true);
    try {
      await updateProfile({
        username: profileForm.username,
        avatar: profileForm.avatar,
      });
      setSuccess("Profile and settings updated");
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const onAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((p) => ({ ...p, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: isDarkMode ? "linear-gradient(180deg, #0f1b3a 0%, #15284f 70%, #0b1530 100%)" : "linear-gradient(180deg, #eef3ff 0%, #dfe9ff 100%)", p: { xs: 2, md: 4 }, color: isDarkMode ? "#fff" : "#15284f" }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton onClick={() => navigate("/home")} sx={{ bgcolor: isDarkMode ? "rgba(255,255,255,0.14)" : "rgba(21,40,79,.1)", color: isDarkMode ? "#fff" : "#15284f" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>Profile & Settings</Typography>
      </Stack>

      <Card sx={{ borderRadius: 4, bgcolor: isDarkMode ? "rgba(255,255,255,.09)" : "#fff", color: isDarkMode ? "#fff" : "#15284f", mb: 2.5 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Box>
              <Avatar src={profileForm.avatar || undefined} sx={{ bgcolor: "#d97500", width: 68, height: 68 }}>
                {(profileForm.username || "U").charAt(0).toUpperCase()}
              </Avatar>
              <Button component="label" size="small" sx={{ mt: 1, color: "#d97500" }}>
                Change Avatar
                <input hidden type="file" accept="image/*" onChange={onAvatarUpload} />
              </Button>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TextField
                  size="small"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                  label="Username"
                  sx={{ bgcolor: "#fff", borderRadius: 2, minWidth: 220 }}
                />
                <EditIcon sx={{ color: "#d97500" }} />
              </Stack>
              <Typography sx={{ color: isDarkMode ? "rgba(255,255,255,.75)" : "rgba(21,40,79,.75)", mt: 1 }}>
                @{userData?.username || "guest"}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4, bgcolor: isDarkMode ? "rgba(255,255,255,.09)" : "#fff", color: isDarkMode ? "#fff" : "#15284f" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700}>Account Preferences</Typography>
          <Divider sx={{ my: 2, borderColor: isDarkMode ? "rgba(255,255,255,.2)" : "rgba(21,40,79,.2)" }} />
          <Stack spacing={2}>
            <TextField
              label="Email"
              value={settings.email}
              onChange={(e) => setSettings((p) => ({ ...p, email: e.target.value }))}
              sx={{ bgcolor: "#fff", borderRadius: 2 }}
            />
            <TextField
              label="Phone"
              value={settings.phone}
              onChange={(e) => setSettings((p) => ({ ...p, phone: e.target.value }))}
              sx={{ bgcolor: "#fff", borderRadius: 2 }}
            />
            <FormControlLabel
              control={<Switch checked={settings.notifications} onChange={(e) => setSettings((p) => ({ ...p, notifications: e.target.checked }))} />}
              label="Enable Notifications"
            />
            <FormControlLabel
              control={<Switch checked={settings.updates} onChange={(e) => setSettings((p) => ({ ...p, updates: e.target.checked }))} />}
              label="Updates"
            />
            <FormControlLabel
              control={<Switch checked={isDarkMode} onChange={toggleTheme} />}
              label="Dark Mode Preference"
            />
            <Box sx={{ p: 1.3, borderRadius: 2, bgcolor: isDarkMode ? "rgba(255,255,255,.08)" : "rgba(21,40,79,.06)" }}>
              <Typography fontWeight={700}>Privacy Policy</Typography>
              <Typography variant="body2" sx={{ opacity: 0.82 }}>
                Conferra keeps your meeting and profile data secured. You control notifications and account preferences at any time.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button startIcon={<SaveIcon />} variant="contained" sx={{ bgcolor: "#d97500" }} onClick={saveSettings} disabled={saving}>
                Save Settings
              </Button>
              <Button variant="contained" onClick={logout} sx={{ bgcolor: isDarkMode ? "#ffffff" : "#15284f", color: isDarkMode ? "#15284f" : "#ffffff", fontWeight: 800 }}>
                Logout
              </Button>
            </Stack>
            {saving ? <CircularProgress size={20} sx={{ color: "#d97500" }} /> : null}
          </Stack>
        </CardContent>
      </Card>

      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess("")}>
        <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(error)} autoHideDuration={3000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}

export default withAuth(ProfilePage);
