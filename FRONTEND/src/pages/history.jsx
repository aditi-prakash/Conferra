import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import VideocamIcon from "@mui/icons-material/Videocam";
import withAuth from "../utils/withAuth";

function History() {
  const { getHistoryOfUser, isDarkMode } = useContext(AuthContext);
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (e) {
        setError(e?.response?.data?.message || "Could not fetch meeting history");
      }
    };
    fetchHistory();
  }, [getHistoryOfUser]);

  const filteredMeetings = useMemo(() => {
    let result = meetings.filter((item) =>
      item.meetingCode?.toLowerCase().includes(search.trim().toLowerCase())
    );
    if (filter === "today") {
      const now = new Date();
      result = result.filter((item) => new Date(item.date).toDateString() === now.toDateString());
    } else if (filter === "week") {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      result = result.filter((item) => new Date(item.date) >= weekStart);
    }
    return result;
  }, [meetings, search, filter]);

  return (
    <Box sx={{ minHeight: "100vh", background: isDarkMode ? "linear-gradient(180deg, #0f1b3a 0%, #15284f 70%, #0b1530 100%)" : "linear-gradient(180deg, #eef3ff 0%, #dfe9ff 100%)", p: { xs: 2, md: 4 }, color: isDarkMode ? "#fff" : "#15284f" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>Meeting History</Typography>
        <IconButton onClick={() => navigate("/home")} sx={{ bgcolor: isDarkMode ? "rgba(255,255,255,0.14)" : "rgba(21,40,79,.1)", color: isDarkMode ? "#fff" : "#15284f" }}>
          <HomeIcon />
        </IconButton>
      </Stack>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search by meeting id"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "#fff", borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Select fullWidth value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ bgcolor: "#fff", borderRadius: 2 }}>
            <MenuItem value="all">All meetings</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">Last 7 days</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {filteredMeetings.length === 0 ? (
        <Card sx={{ borderRadius: 4, p: 4, textAlign: "center", bgcolor: isDarkMode ? "rgba(255,255,255,.08)" : "#fff", color: isDarkMode ? "#fff" : "#15284f" }}>
          <Avatar sx={{ bgcolor: "#d97500", mx: "auto", mb: 1 }}>
            <VideocamIcon />
          </Avatar>
          <Typography variant="h6">No meetings found</Typography>
          <Typography sx={{ color: "rgba(255,255,255,.75)" }}>
            Start a new video call and your history will appear here.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredMeetings.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item._id}>
              <Card sx={{ borderRadius: 4, bgcolor: isDarkMode ? "rgba(255,255,255,.08)" : "#fff", color: isDarkMode ? "#fff" : "#15284f", height: "100%" }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography fontWeight={700}>Meeting ID: {item.meetingCode}</Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,.78)" }}>
                      Date/Time: {new Date(item.date).toLocaleString()}
                    </Typography>
                    <Chip label={`Duration: ${item.duration || "N/A"}`} sx={{ bgcolor: "rgba(217,117,0,.2)", color: "#fff", width: "fit-content" }} />
                    <Chip label={`Participants: ${item.participants || "N/A"}`} sx={{ bgcolor: "rgba(255,255,255,.15)", color: "#fff", width: "fit-content" }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}

export default withAuth(History);