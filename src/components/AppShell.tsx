import React from "react";
import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";

type Props = { children: React.ReactNode };

export default function AppShell({ children }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage:
          "radial-gradient(1200px 600px at 20% -10%, rgba(229,9,20,0.25), transparent 60%)," +
          "radial-gradient(900px 500px at 90% 10%, rgba(120,80,255,0.18), transparent 55%)",
      }}
    >
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: 0.2 }}>
            CopyVoiceSite
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>{children}</Container>
    </Box>
  );
}
