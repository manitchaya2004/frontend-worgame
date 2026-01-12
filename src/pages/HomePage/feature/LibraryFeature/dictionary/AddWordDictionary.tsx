import {
  Dialog,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";

type AddWordDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    word: string;
    meaning: string;
    example?: string;
  }) => void;
};

export const AddWordDictionary = ({
  open,
  onClose,
  onSubmit,
}: AddWordDialogProps) => {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!word.trim() || !meaning.trim()) {
      setError("Word and meaning are required.");
      return;
    }

    onSubmit({
      word: word.trim(),
      meaning: meaning.trim(),
      example: example.trim(),
    });

    // reset
    setWord("");
    setMeaning("");
    setExample("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box
        sx={{
          background: "linear-gradient(#7b4a3b, #5a3328)",
          border: "6px solid #7a1f1f",
          padding: 3,
          boxShadow: `
            inset 0 0 0 3px #d6b46a,
            0 0 20px rgba(0,0,0,0.8)
          `,
        }}
      >
        <Typography
          sx={{
            fontFamily: `"Press Start 2P"`,
            fontSize: 16,
            color: "#fffbe6",
            mb: 2,
            textAlign: "center",
          }}
        >
          ADD NEW WORD
        </Typography>

        <TextField
          label="Word"
          fullWidth
          value={word}
          onChange={(e) => setWord(e.target.value)}
          sx={inputStyle}
        />

        <TextField
          label="Meaning"
          fullWidth
          multiline
          rows={3}
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          sx={inputStyle}
        />

        <TextField
          label="Example (optional)"
          fullWidth
          multiline
          rows={2}
          value={example}
          onChange={(e) => setExample(e.target.value)}
          sx={inputStyle}
        />

        {error && (
          <Typography
            sx={{
              color: "#ffb4b4",
              fontSize: 12,
              mt: 1,
            }}
          >
            {error}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 3,
          }}
        >
          <Button onClick={onClose} sx={cancelBtn}>
            Cancel
          </Button>
          <Button onClick={handleSave} sx={saveBtn}>
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

// --- styles ---
const inputStyle = {
  mt: 2,
  "& label": {
    fontFamily: `"Press Start 2P"`,
    fontSize: 10,
    color: "#fffbe6",
  },
  "& .MuiInputBase-root": {
    fontFamily: `"Press Start 2P"`,
    fontSize: 11,
    backgroundColor: "#2a160f",
    color: "#fffbe6",
    border: "3px solid #2b1d14",
  },
  "& fieldset": {
    border: "none",
  },
};

const saveBtn = {
  fontFamily: `"Press Start 2P"`,
  backgroundColor: "#d6b46a",
  color: "#000",
  "&:hover": {
    backgroundColor: "#f1d88a",
  },
};

const cancelBtn = {
  fontFamily: `"Press Start 2P"`,
  color: "#fffbe6",
};
