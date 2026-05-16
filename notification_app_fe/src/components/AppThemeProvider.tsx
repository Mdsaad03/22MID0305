// Reg No: 22MID0305

"use client";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6C63FF",
      light: "#9D97FF",
      dark: "#4B44C9",
    },
    secondary: {
      main: "#FF6584",
    },
    background: {
      default: "#0A0B1E",
      paper: "#13152E",
    },
    success: {
      main: "#00E5A0",
    },
    warning: {
      main: "#FFB547",
    },
    info: {
      main: "#38BDF8",
    },
    error: {
      main: "#FF6584",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(19, 21, 46, 0.8)",
          border: "1px solid rgba(108, 99, 255, 0.15)",
          backdropFilter: "blur(12px)",
          transition: "all 0.25s ease",
          "&:hover": {
            borderColor: "rgba(108, 99, 255, 0.45)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 32px rgba(108, 99, 255, 0.15)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.02em",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
