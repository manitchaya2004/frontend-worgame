import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useServerStore } from "../../store/useServerStore";
import { THEMES } from "../HomePage/hook/const";
import { FloatingLetters } from "../../components/FloatingLetters";
import LoadingScreen from "../../components/Loading/LoadingPage";
export default function ServerClosedPage() {
  const { refreshServer, serverStatus, lastPathBeforeClose, clearServerClose } =
    useServerStore();
  const loading = serverStatus === "LOADING";

  const [uiLoading, setUiLoading] = useState(false);

  const handleRefresh = async () => {
    setUiLoading(true);

    // 🔑 ให้ browser วาดก่อน
    await new Promise((r) => requestAnimationFrame(r));

    const minDelay = new Promise((r) => setTimeout(r, 2000));
    const ok = await refreshServer();

    await minDelay;
    setUiLoading(false);

    if (ok) {
      clearServerClose();
      window.location.href = lastPathBeforeClose || "/home";
    }
  };

  if (serverStatus === "LOADING" || uiLoading) {
    return <LoadingScreen open={true} />;
  }

  return (
    <>
      <FloatingLetters />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            background: "#2b1d14",
            border: `4px solid ${THEMES.border}`,
            borderRadius: "16px",
            p: 5,
            textAlign: "center",
            width: 420,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: "18px",
              color: THEMES.accent,
              mb: 2,
            }}
          >
            SERVER CLOSED
          </Typography>

          <Typography
            sx={{
              fontFamily: "'Press Start 2P'",
              fontSize: "11px",
              color: THEMES.textMain,
              mb: 3,
            }}
          >
            The server is currently offline.
            <br />
            Please refresh to try again.
          </Typography>

          <Button
            onClick={handleRefresh}
            sx={{
              bgcolor: "#4e8f4e",
              color: THEMES.accent,
              fontFamily: "'Press Start 2P'",
              borderRadius: "12px",
              px: 4,
              cursor: "pointer",
            }}
          >
            {loading ? "... REFRESH" : "REFRESH"}
          </Button>
        </Box>
      </Box>
    </>
  );
}
