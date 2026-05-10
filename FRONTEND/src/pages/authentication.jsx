import * as React from "react";
import {
    Avatar,
    Alert,
    Button,
    Container,
    CssBaseline,
    TextField,
    Typography,
    Box,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [searchParams] = useSearchParams();

    const [formState, setFormState] = React.useState(0);

    const [loading, setLoading] = React.useState(false)

    const { handleRegister, handleLogin, isAuthenticated, isDarkMode } = React.useContext(AuthContext)
    const navigate = useNavigate();

    React.useEffect(() => {
        const mode = searchParams.get("mode");
        if (mode === "signup") {
            setFormState(1);
        } else {
            setFormState(0);
        }
    }, [searchParams]);

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate("/home");
        }
    }, [isAuthenticated, navigate]);

    let handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            if (formState === 0) {
                const loginMessage = await handleLogin(username, password);
                setMessage(loginMessage || "Login successful");
            }
            if (formState === 1) {
                let result = await handleRegister(username, email, password)
                setMessage(result);
            }
        } catch (err) {
            let errorMessage = err?.message || "Authentication failed";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container component="main" maxWidth="sm" sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
            <CssBaseline />

            <Box
                sx={{
                    width: "100%",
                    borderRadius: 4,
                    p: 3,
                    boxShadow: "0 12px 30px rgba(0,0,0,.12)",
                    background: isDarkMode ? "#ffffff" : "#f8fbff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>

                <div>
                    <Button variant={formState === 0 ? "contained" : "text"} onClick={() => { setFormState(0); setError(""); }}>
                        Sign In
                    </Button>

                    <Button variant={formState === 1 ? "contained" : "text"} onClick={() => { setFormState(1); setError(""); }}>
                        Sign Up
                    </Button>
                </div>
                <Typography variant="body2" sx={{ mt: 2, color: "text.secondary", textAlign: "center" }}>
                    No pre-created credentials are required. Use <b>Sign Up</b> to create your account,
                    then login with the same username and password.
                </Typography>

                <Box component="form" sx={{ mt: 3 }} onSubmit={handleAuth}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {formState === 1 ? (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    ) : null}

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error ? <Alert severity="error">{error}</Alert> : null}
                    {message ? <Alert severity="success" sx={{ mt: 1 }}>{message}</Alert> : null}

                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                     {loading ? "Please wait..." : (formState === 0 ?"LOGIN" : "Register")}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}
