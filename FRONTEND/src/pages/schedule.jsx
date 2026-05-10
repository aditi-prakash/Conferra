import React, { useContext, useMemo, useState } from "react";
import {
  Alert,
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import { AuthContext } from "../contexts/AuthContext";

const STORAGE_KEY = "scheduledMeetings";

function SchedulePage() {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ title: "", dateTime: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  const scheduledMeetings = useMemo(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return parsed.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  }, [refreshKey]);

  const createMeeting = () => {
    if (!form.title.trim() || !form.dateTime) {
      setError("Please enter title and date/time");
      return;
    }
    const roomId = crypto.randomUUID().split("-")[0];
    const payload = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      dateTime: form.dateTime,
      roomId,
      link: `${window.location.origin}/meeting/${roomId}`,
    };
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    parsed.push(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    setForm({ title: "", dateTime: "" });
    setOpen(false);
    setSuccess("Meeting scheduled");
    setRefreshKey((p) => p + 1);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: isDarkMode ? "linear-gradient(180deg, #0f1b3a 0%, #15284f 70%, #0b1530 100%)" : "linear-gradient(180deg, #eef3ff 0%, #dfe9ff 100%)", p: { xs: 2, md: 4 }, color: isDarkMode ? "#fff" : "#15284f" }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={() => navigate("/home")} sx={{ bgcolor: isDarkMode ? "rgba(255,255,255,.12)" : "rgba(21,40,79,.1)", color: isDarkMode ? "#fff" : "#15284f" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>Schedule Meeting</Typography>
        </Stack>
        <Button variant="contained" startIcon={<EventIcon />} sx={{ bgcolor: "#d97500" }} onClick={() => setOpen(true)}>
          New Meeting
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 4, bgcolor: isDarkMode ? "rgba(255,255,255,.08)" : "#fff" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1.5}>Upcoming Scheduled Meetings</Typography>
          {scheduledMeetings.length ? (
            <Stack spacing={1.3}>
              {scheduledMeetings.map((item) => (
                <Box key={item.id} sx={{ p: 1.4, borderRadius: 2, background: isDarkMode ? "rgba(255,255,255,.08)" : "rgba(21,40,79,.06)" }}>
                  <Typography fontWeight={700}>{item.title}</Typography>
                  <Typography variant="body2">{new Date(item.dateTime).toLocaleString()}</Typography>
                  <Typography variant="caption">Room: {item.roomId}</Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ opacity: 0.8 }}>No meetings scheduled yet.</Typography>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Scheduled Meeting</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Meeting title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <TextField type="datetime-local" value={form.dateTime} onChange={(e) => setForm((p) => ({ ...p, dateTime: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: "#d97500" }} onClick={createMeeting}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(error)} autoHideDuration={3000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={3000} onClose={() => setSuccess("")}>
        <Alert severity="success" onClose={() => setSuccess("")}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}

export default withAuth(SchedulePage);
