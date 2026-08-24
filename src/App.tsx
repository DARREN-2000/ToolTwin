import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ActionConsole from "./pages/ActionConsole";
import SimulationDetail from "./pages/SimulationDetail";
import ReviewQueue from "./pages/ReviewQueue";
import AuditLog from "./pages/AuditLog";
import PolicyManager from "./pages/PolicyManager";
import ToolCatalog from "./pages/ToolCatalog";
import { RequireAuth } from "./hooks/useRequireAuth";
import { AuthProvider } from "./hooks/useAuth";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/app"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="console"
              element={
                <RequireAuth roles={["operator", "admin"]}>
                  <ActionConsole />
                </RequireAuth>
              }
            />
            <Route path="simulation/:id" element={<SimulationDetail />} />
            <Route
              path="review"
              element={
                <RequireAuth roles={["approver", "admin"]}>
                  <ReviewQueue />
                </RequireAuth>
              }
            />
            <Route
              path="audit"
              element={
                <RequireAuth roles={["auditor", "admin"]}>
                  <AuditLog />
                </RequireAuth>
              }
            />
            <Route
              path="policies"
              element={
                <RequireAuth roles={["admin"]}>
                  <PolicyManager />
                </RequireAuth>
              }
            />
            <Route path="tools" element={<ToolCatalog />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
