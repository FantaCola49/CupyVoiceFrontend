import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
