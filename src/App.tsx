import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AnimatedRoutes from "./AnimatedRoutes";
import { AuthProvider } from "./hooks/useAuth";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
