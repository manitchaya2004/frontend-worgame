import { AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import sword from "../../assets/icons/sword.svg";
import store from "../../assets/icons/store.svg";
import monster from "../../assets/icons/monster.svg";
import quest from "../../assets/icons/quest.svg";
import SettingsFeature from "../../pages/HomePage/feature/SettingFeature";
import taro from "../../assets/icons/taro.jpg";
import coin from "../../assets/icons/coin.svg";
import { useLoginPlayer } from "../../pages/AuthPage/LoginPage/hook/useLoginPlayer";
import { LoadImage } from "../../pages/HomePage/hook/usePreloadFrams";

const name = "img_hero";

const GameAppBar = () => {
  const { currentUser } = useLoginPlayer();
  const activeHero = currentUser?.heroes?.find((h) => h.is_selected);
  const heroId = activeHero?.hero_id;
  return (
    <AppBar
      position="static"
      // sx={{
      //   backgroundColor: "#E8E9CD",
      //   borderBottom: "10px solid #694037",
      //   boxShadow: "0 6px 0 #3e2615",
      // }}
      sx={{
        backgroundColor: "#0e0e1250",
      }}
    >
      <Toolbar sx={{ minHeight: 10, height: 10 }}>
        {/* 🔹 LEFT : LOGO */}
        <Box sx={{ flex: 1, ml: 2 }}>
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {/* กล่องชื่อ */}
            <Box
              sx={{
                pl: "48px", // เว้นที่ให้ avatar
                pr: 5,
                py: 1,
                backgroundColor: "#E8E9CD",
                borderRadius: "15px",
                border: "4px solid #5A3A2E",
                boxShadow: "0 4px 0 #2b1a12",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Press Start 2P'",
                  fontSize: { xs: 8, md: 8 },
                  color: "#3e2615",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUser?.username}
              </Typography>
            </Box>

            {/* Avatar ทับกล่อง */}
            <Box
              sx={{
                position: "absolute",
                left: "-18px",
                width: 35,
                height: 35,
                borderRadius: "50%",
                backgroundColor: "#E8E9CD",
                border: "4px solid #5A3A2E",
                boxShadow: "0 4px 0 #2b1a12",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Avatar
                src={LoadImage(name, heroId, 1)}
                alt="profile-player"
                sx={{
                  width: 50,
                  height: 50,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* 🔹 RIGHT : SETTINGS */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            alignItems: "center",
          }}
        >
          {/* //  icon เพิ่มเติม */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              pl: 4, // 👈 เผื่อที่ให้ icon
              pr: 2,
              py: 1,
              backgroundColor: "#E8E9CD",
              border: "4px solid #5A3A2E",
              borderRadius: "15px",
            }}
          >
            {/* 🪙 ICON ลอยทับเส้น */}
            <Box
              component="img"
              src={coin}
              sx={{
                position: "absolute",
                left: -14, // 👈 ดันออกนอกกล่อง
                width: 35,
                height: 35,
                borderRadius: "50%",
                backgroundColor: "#E8E9CD",
                // border: "3px solid #3e2615",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            />

            {/* 💰 MONEY */}
            <Typography
              sx={{
                fontFamily: "'Press Start 2P'",
                fontSize: { xs: 8, md: 10 },
                color: "rgba(0, 0, 0, 1)",
                width: "60px",
                textAlign: "end",
              }}
            >
              {currentUser?.money || 0}
            </Typography>
          </Box>

          {/* <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "#E8E9CD",
              border: "4px solid #5A3A2E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <SettingsIcon sx={{ color: "#3e2615" }} />
          </Box>

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            marginThreshold={16} // 👈 กันชนขอบจอ (สำคัญ)
            PaperProps={{
              sx: {
                borderRadius: "12px",
                border: "3px solid #5c3a1e",
                backgroundColor: "#feffeb",
                boxShadow: "4px 4px 0 #3e2615",
                maxWidth: "calc(100vw - 32px)", // 👈 กันจอล้น mobile
              },
            }}
          >
            <SettingsFeature onClose={() => setAnchorEl(null)} />
          </Popover> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default GameAppBar;
