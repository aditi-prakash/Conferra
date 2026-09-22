import React, { useContext, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button, Alert, Avatar, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const serverUrl = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";
const peerConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { userData, isDarkMode } = useContext(AuthContext);

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [showModal, setModal] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [username, setUsername] = useState(userData?.name || userData?.username || "Guest");
  const [askForUsername, setAskForUsername] = useState(!(userData?.name || userData?.username));
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Not connected");
  const [connecting, setConnecting] = useState(false);

  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localVideoref = useRef(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const isConnectingRef = useRef(false);
  const screenStreamRef = useRef(null);
  const chatBottomRef = useRef(null);

  const roomPath = `room-${roomId}`;

  useEffect(() => {
    setScreenAvailable(Boolean(navigator.mediaDevices?.getDisplayMedia));
    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.values(peersRef.current).forEach((peer) => peer.close());
      peersRef.current = {};
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!askForUsername && !socketRef.current && !isConnectingRef.current) {
      isConnectingRef.current = true;
      connectToSocketServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [askForUsername]);

  const attachLocalStream = async () => {
    try {
      if (localStreamRef.current) {
        return localStreamRef.current;
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      } catch (err1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setVideo(false);
          setError("Webcam not accessible. Operating in audio-only mode.");
        } catch (err2) {
          stream = new MediaStream();
          setVideo(false);
          setAudio(false);
          setError("Camera and Microphone not accessible. Joined in view-only mode.");
        }
      }
      localStreamRef.current = stream;
      if (localVideoref.current && stream.getVideoTracks().length > 0) {
        localVideoref.current.srcObject = stream;
      }
      return stream;
    } catch (e) {
      console.warn("Error attaching local stream:", e);
      return new MediaStream();
    }
  };

  const createPeerConnection = (socketListId) => {
    if (socketListId === socketIdRef.current) return null;
    const peer = new RTCPeerConnection(peerConfig);
    peersRef.current[socketListId] = peer;

    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
      }
    };

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) return;
      setVideos((prev) => {
        const exists = prev.some((item) => item.socketId === socketListId);
        if (exists) {
          return prev.map((item) =>
            item.socketId === socketListId ? { ...item, stream } : item
          );
        }
        return [...prev, { socketId: socketListId, stream }];
      });
    };

    if (screen && screenStreamRef.current) {
      const screenTrack = screenStreamRef.current.getVideoTracks()[0];
      if (screenTrack) {
        peer.addTrack(screenTrack, screenStreamRef.current);
      }
    } else if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });
    }
    return peer;
  };

  const gotMessageFromServer = async (fromId, payload) => {
    try {
      const signal = JSON.parse(payload);
      if (fromId === socketIdRef.current) return;

      if (!peersRef.current[fromId]) {
        createPeerConnection(fromId);
      }

      const peer = peersRef.current[fromId];
      if (signal.sdp) {
        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        if (signal.sdp.type === "offer") {
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socketRef.current?.emit(
            "signal",
            fromId,
            JSON.stringify({ sdp: peer.localDescription })
          );
        }
      }

      if (signal.ice && peer.remoteDescription) {
        await peer.addIceCandidate(new RTCIceCandidate(signal.ice));
      }
    } catch (err) {
      console.warn("Signal handling warning:", err);
    }
  };

  const connectToSocketServer = async () => {
    await attachLocalStream();
    setConnecting(true);
    setStatus("Connecting...");

    socketRef.current = io.connect(serverUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", roomPath);
      setStatus("Connected");
      setConnecting(false);
    });

    socketRef.current.on("disconnect", () => {
      setStatus("Disconnected. Trying to reconnect...");
    });

    socketRef.current.on("reconnect", () => {
      setStatus("Reconnected");
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", roomPath);
    });

    socketRef.current.on("connect_error", () => {
      setStatus("Network issue while connecting");
      setConnecting(false);
    });

    socketRef.current.on("chat-message", (item) => {
      setMessages((prev) => {
        const isDuplicate = prev.some(
          (m) => m.id === item.id || (m.at === item.at && m.data === item.data && m.sender === item.sender)
        );
        if (isDuplicate) return prev;
        return [
          ...prev,
          {
            id: item.id,
            sender: item.sender,
            data: item.data,
            at: item.at,
            self: item.socketIdSender === socketIdRef.current,
          },
        ];
      });
      if (item.socketIdSender !== socketIdRef.current) {
        setNewMessages((prev) => prev + 1);
      }
    });

    socketRef.current.on("user-left", (id) => {
      setVideos((prev) => prev.filter((item) => item.socketId !== id));
      if (peersRef.current[id]) {
        peersRef.current[id].close();
        delete peersRef.current[id];
      }
    });

    socketRef.current.on("user-joined", async (id, clients) => {
      clients.forEach((socketListId) => {
        if (!peersRef.current[socketListId]) {
          createPeerConnection(socketListId);
        }
      });

      if (id !== socketIdRef.current && peersRef.current[id]) {
        const peer = peersRef.current[id];
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socketRef.current.emit(
          "signal",
          id,
          JSON.stringify({ sdp: peer.localDescription })
        );
      }
    });
  };

  const handleVideo = () => {
    const nextVideo = !video;
    setVideo(nextVideo);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextVideo;
      });
    }
  };

  const handleAudio = () => {
    const nextAudio = !audio;
    setAudio(nextAudio);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextAudio;
      });
    }
  };

  const stopScreenShare = async () => {
    setScreen(false);
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    const camStream = localStreamRef.current || (await attachLocalStream());
    if (camStream) {
      const videoTrack = camStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = video;
        Object.values(peersRef.current).forEach((peer) => {
          const sender = peer.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        });
      }
      if (localVideoref.current) {
        localVideoref.current.srcObject = camStream;
      }
    }
  };

  const handleScreen = async () => {
    if (screen) {
      await stopScreenShare();
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = displayStream;
      const screenTrack = displayStream.getVideoTracks()[0];

      if (!screenTrack) return;

      Object.values(peersRef.current).forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });

      if (localVideoref.current) {
        localVideoref.current.srcObject = displayStream;
      }

      screenTrack.onended = () => {
        stopScreenShare();
      };

      setScreen(true);
    } catch (e) {
      console.error("Screen share error:", e);
      setError("Unable to start screen sharing");
    }
  };

  const handleEndCall = () => {
    navigate("/home");
  };

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current) return;
    socketRef.current.emit("chat-message", message.trim(), username || "Guest");
    setMessage("");
  };

  const connect = async () => {
    setAskForUsername(false);
  };

  return (
    <div style={{ background: isDarkMode ? "#0f1b3a" : "#eef3ff" }}>
      {askForUsername ? (
        <div className={styles.lobbyContainer}>
          <div className={styles.lobbyCard}>
            <Typography variant="h5" fontWeight={700}>Join Meeting Room</Typography>
            <Typography sx={{ mb: 1.5, opacity: 0.9 }}>Room ID: {roomId}</Typography>
            <TextField
              fullWidth
              label="Display Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              sx={{ bgcolor: "#fff", borderRadius: 2, mb: 1.5 }}
            />
            <Button variant="contained" onClick={connect} sx={{ bgcolor: "#d97500" }} disabled={connecting}>
              {connecting ? "Connecting..." : "Connect"}
            </Button>
            {connecting ? <CircularProgress size={24} sx={{ color: "#d97500", ml: 1.5 }} /> : null}
            {error ? <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert> : null}
            <div style={{ marginTop: 16 }}>
              <video ref={localVideoref} autoPlay muted style={{ width: "100%", borderRadius: 12 }} />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          
          <div className={styles.mainArea}>
            <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
              <Chip label={`Room: ${roomId}`} sx={{ bgcolor: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Chip label={status} sx={{ bgcolor: "rgba(217,117,0,.8)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }} />
              <Chip label={`Participants: ${videos.length + 1}`} sx={{ bgcolor: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </Stack>

            <div className={styles.conferenceView}>
              {videos.length === 0 ? (
                <div className={styles.emptyRoom}>
                  <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.4)" }}>Waiting for others to join...</Typography>
                </div>
              ) : (
                videos.map((remoteVideo) => (
                  <div key={remoteVideo.socketId} className={styles.remoteVideoWrapper}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '24px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Avatar sx={{ width: 22, height: 22, bgcolor: "#d97500", fontSize: '11px', fontWeight: 'bold' }}>
                        {remoteVideo.socketId.slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Typography sx={{ color: "#fff", fontWeight: 500 }} variant="caption">
                        Participant {remoteVideo.socketId.slice(0, 6)}
                      </Typography>
                    </Stack>
                    <video
                      data-socket={remoteVideo.socketId}
                      ref={(ref) => {
                        if (ref && remoteVideo.stream && ref.srcObject !== remoteVideo.stream) {
                          ref.srcObject = remoteVideo.stream;
                        }
                      }}
                      autoPlay
                      playsInline
                    />
                  </div>
                ))
              )}
            </div>

            <video className={styles.meetUserVideo} ref={localVideoref} autoPlay playsInline muted />
          </div>

          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Meeting Chat</h1>
                <div className={styles.chattingDisplay}>
                  {messages.length
                    ? messages.map((item, index) => (
                        <div className={item.self ? styles.messageWrapperSelf : styles.messageWrapperOther} key={item.id || index}>
                          {!item.self && <div className={styles.chatSender}>{item.sender}</div>}
                          <div className={item.self ? styles.chatBubbleSelf : styles.chatBubbleOther}>
                            <p>{item.data}</p>
                          </div>
                          <div className={styles.chatTime}>{new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      ))
                    : <Typography sx={{ textAlign: 'center', color: '#94a3b8', mt: 4, fontSize: '14px' }}>No messages yet</Typography>}
                  <div ref={chatBottomRef} />
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '20px',
                        bgcolor: '#f8fafc'
                      } 
                    }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={sendMessage}
                    sx={{ borderRadius: '20px', bgcolor: '#d97500', minWidth: '80px', textTransform: 'none', boxShadow: 'none' }}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} sx={{ color: "white", bgcolor: video ? "rgba(255,255,255,.15)" : "rgba(220,38,38,.8)", '&:hover': { bgcolor: video ? "rgba(255,255,255,.25)" : "rgba(220,38,38,1)" } }}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleAudio} sx={{ color: "white", bgcolor: audio ? "rgba(255,255,255,.15)" : "rgba(220,38,38,.8)", '&:hover': { bgcolor: audio ? "rgba(255,255,255,.25)" : "rgba(220,38,38,1)" } }}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable ? (
              <IconButton
                onClick={handleScreen}
                title={screen ? "Stop Sharing Screen" : "Share Screen"}
                sx={{
                  color: "white",
                  bgcolor: screen ? "rgba(220,38,38,.8)" : "rgba(255,255,255,.15)",
                  '&:hover': { bgcolor: screen ? "rgba(220,38,38,1)" : "rgba(255,255,255,.25)" }
                }}
              >
                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>
            ) : null}
            <Badge badgeContent={newMessages} max={99} color="error">
              <IconButton
                onClick={() => {
                  setModal(!showModal);
                  setNewMessages(0);
                }}
                sx={{ color: "white", bgcolor: showModal ? "rgba(217,117,0,.8)" : "rgba(255,255,255,.15)", '&:hover': { bgcolor: showModal ? "rgba(217,117,0,1)" : "rgba(255,255,255,.25)" } }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 8px' }}></div>
            <IconButton onClick={handleEndCall} sx={{ color: "white", bgcolor: "#ef4444", '&:hover': { bgcolor: "#dc2626" } }}>
              <CallEndIcon />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}