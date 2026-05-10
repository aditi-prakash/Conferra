import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcCallIcon from "@mui/icons-material/AddIcCall";
import EventIcon from "@mui/icons-material/Event";
import HistoryIcon from "@mui/icons-material/History";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");
  const [joinModal, setJoinModal] = useState(false);

  const { addToUserHistory, userData, isDarkMode } = useContext(AuthContext);

  const joinMeeting = async (code) => {
    try {
      await addToUserHistory(code);
      navigate(`/meeting/${code}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Unable to join meeting");
    }
  };

  const handleJoinVideoCall = async () => {
    const code = meetingCode.trim();
    if (!code) {
      setError("Please enter a meeting code");
      return;
    }
    await joinMeeting(code);
    setJoinModal(false);
  };

  const handleStartVideoCall = async () => {
    const generatedCode = crypto.randomUUID().split("-")[0];
    setMeetingCode(generatedCode);
    await joinMeeting(generatedCode);
  };

  const bg = isDarkMode
    ? "linear-gradient(180deg, #0f1b3a 0%, #15284f 60%, #0b1530 100%)"
    : "linear-gradient(180deg, #eef3ff 0%, #dfe9ff 100%)";
  const fg = isDarkMode ? "#fff" : "#15284f";
  const cardBg = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)";

  return (
    <Box sx={{ minHeight: "100vh", background: bg, color: fg, p: { xs: 2, md: 4 } }}>
      <Card sx={{ mb: 3, borderRadius: 4, background: cardBg, backdropFilter: "blur(10px)", boxShadow: "0 12px 36px rgba(0,0,0,0.25)" }}>
        <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? "#fff" : "#15284f" }}>
              Confeera
            </Typography>
            <Typography sx={{ color: isDarkMode ? "rgba(255,255,255,0.8)" : "rgba(21,40,79,0.75)" }}>
              Welcome back, {userData?.name || userData?.username || "User"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton sx={{ bgcolor: isDarkMode ? "rgba(255,255,255,0.14)" : "rgba(21,40,79,0.1)", color: fg }}>
              <NotificationsNoneIcon />
            </IconButton>
            <IconButton onClick={() => navigate("/profile")} sx={{ bgcolor: isDarkMode ? "rgba(255,255,255,0.14)" : "rgba(21,40,79,0.1)", color: fg }}>
              <Avatar sx={{ bgcolor: "#d97500", width: 32, height: 32 }}>
                {(userData?.name || userData?.username || "U").charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4, background: cardBg }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
            {[
              { title: "Start Video Call", icon: <VideoCallIcon />, action: handleStartVideoCall },
              { title: "Join Meeting", icon: <AddIcCallIcon />, action: () => setJoinModal(true) },
              { title: "Schedule Meeting", icon: <EventIcon />, action: () => navigate("/schedule") },
              { title: "Meeting History", icon: <HistoryIcon />, action: () => navigate("/history") },
            ].map((item) => (
              <Button
                key={item.title}
                onClick={item.action}
                startIcon={item.icon}
                variant="outlined"
                sx={{
                  flex: 1,
                  borderColor: "#d97500",
                  color: isDarkMode ? "#fff" : "#15284f",
                  py: 1.4,
                  fontWeight: 700,
                  "&:hover": { borderColor: "#d97500", background: "rgba(217,117,0,0.12)" },
                }}
              >
                {item.title}
              </Button>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={joinModal} onClose={() => setJoinModal(false)} fullWidth maxWidth="xs">
        <DialogTitle>Join with Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
            label="Meeting code"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinModal(false)}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: "#d97500" }} onClick={handleJoinVideoCall}>
            Join Meeting
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}

export default withAuth(HomeComponent);