import { Dialog, DialogContent, Box, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";

export const GameDialog = ({
  open,
  title,
  description,
  confirmText = "START",
  cancelText = "BACK",
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          background: "linear-gradient(#6b3b2a, #3a1c14)",
          border: "5px solid #7a1f1f",
          boxShadow: `
            inset 0 0 0 3px #d6b46a,
            0 0 30px rgba(255,80,80,0.6)
          `,
          padding: 3,
          minWidth: 320,
        },
      }}
    >
      <DialogContent>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title */}
          <Typography
            sx={{
              fontFamily: `"Press Start 2P"`,
              fontSize: 18,
              color: "#fffbe6",
              textAlign: "center",
              textShadow: "2px 2px 0 #000",
              mb: 2,
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          {description && (
            <Typography
              sx={{
                fontFamily: `"Press Start 2P"`,
                fontSize: 12,
                textAlign: "center",
                color: "#f5d6a1",
                opacity: 0.85,
                mb: 3,
              }}
            >
              {description}
            </Typography>
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              onClick={onConfirm}
              sx={{
                fontFamily: `"Press Start 2P"`,
                fontSize: 12,
                background: "#b22222",
                color: "#fff",
                border: "3px solid #000",
                boxShadow: "3px 3px 0 #000",
                "&:hover": {
                  background: "#d12c2c",
                },
              }}
            >
              ▶ {confirmText}
            </Button>

            <Button
              onClick={onCancel}
              sx={{
                fontFamily: `"Press Start 2P"`,
                fontSize: 12,
                background: "#3a3a3a",
                color: "#fff",
                border: "3px solid #000",
                boxShadow: "3px 3px 0 #000",
                "&:hover": {
                  background: "#555",
                },
              }}
            >
              ⏹ {cancelText}
            </Button>
          </Box>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
