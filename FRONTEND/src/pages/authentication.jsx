import * as React from "react";
import {
    Avatar,
    Button,
    Checkbox,
    Container,
    CssBaseline,
    FormControlLabel,
    TextField,
    Typography,
    Box,
    Grid,
    Link,
    createTheme,
    Snackbar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { AuthContext } from "../contexts/AuthContext";
import { red } from "@mui/material/colors";

const defaultTheme = createTheme();

export default function Authentication() {

    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();

    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)

    const { handleRegister, handleLogin } = React.useContext(AuthContext)

    let handleAuth = async () => {
        try {
            if (formState == 0) {

            }
            if (formState == 1) {
                let result = await handleRegister(name.username, password)
                console.log(result);
                setMessage(result);
                setOpen(true);
            }
        } catch (err) {
            console.log(err);
            return;
            let message = (err.response.data.message);
            setError(message);
        }
    }

    return (
        <Container component="main" maxWidth="sm">
            <CssBaseline />

            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>

                <div>
                    <Button variant={formState == 0 ? "contained" : ""} onClick={() => { setFormState(0) }}>
                        Sign In
                    </Button>

                    <Button variant={formState == 1 ? "contained" : ""} onClick={() => { setFormState(1) }}>
                        Sign Up
                    </Button>
                </div>

                <Box component="form" sx={{ mt: 3 }}>
                    {/* <p>{name}</p> */}
                    {formState == 1 ? <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Full Name"
                        name="username"
                        autoFocus
                        onClick={(e) => setName(e.target.value)}
                    /> : <></>}


                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoFocus
                        onClick={(e) => setUsername(e.target.value)}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        onClick={(e) => setPassword(e.target.value)}
                    />

                   <p style={{color:"red"}}>*{error}</p>

                    <Button type="button" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleAuth}>
                     {formState == 0 ?"LOGIN" : "Register"}
                    </Button>
                </Box>
            </Box>
            <Snackbar open={open}
                autoHideDuration={4000}
                message={message}>

            </Snackbar>
        </Container>
    );
}
