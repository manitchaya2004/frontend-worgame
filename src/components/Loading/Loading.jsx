import { Box, Typography } from "@mui/material";
export const Loading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius:'10px'
      }}
    >
      <Typography>Loading... Please wait</Typography>
    </Box>
  );
};
