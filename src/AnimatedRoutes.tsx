import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
import IntegrationSettings from "./pages/IntegrationSettings";
import { RequireAuth } from "./hooks/useRequireAuth";

const pageVariants = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -5, transition: { duration: 0.2, ease: "easeIn" } }
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route
            path="console"
            element={
              <RequireAuth roles={["operator", "admin"]}>
                <PageWrapper><ActionConsole /></PageWrapper>
              </RequireAuth>
            }
          />
          <Route path="simulation/:id" element={<PageWrapper><SimulationDetail /></PageWrapper>} />
          <Route
            path="review"
            element={
              <RequireAuth roles={["approver", "admin"]}>
                <PageWrapper><ReviewQueue /></PageWrapper>
              </RequireAuth>
            }
          />
          <Route
            path="audit"
            element={
              <RequireAuth roles={["auditor", "admin"]}>
                <PageWrapper><AuditLog /></PageWrapper>
              </RequireAuth>
            }
          />
          <Route
            path="policies"
            element={
              <RequireAuth roles={["admin"]}>
                <PageWrapper><PolicyManager /></PageWrapper>
              </RequireAuth>
            }
          />
          <Route
            path="settings"
            element={
              <RequireAuth roles={["admin"]}>
                <PageWrapper><IntegrationSettings /></PageWrapper>
              </RequireAuth>
            }
          />
          <Route path="tools" element={<PageWrapper><ToolCatalog /></PageWrapper>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
