import React from "react"
import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material"

type Props = {
    children: React.ReactNode;
}

export default function AppShell({children}: Props){
return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            CupyVoiceSite
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>{children}</Container>
    </Box>
  );
}