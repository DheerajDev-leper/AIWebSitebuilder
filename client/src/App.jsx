import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useCurrentUser from "./hooks/GetCurrentUser";
import Home from "./pages/Home";

// Kept for backward compatibility (e.g. WebsiteEditor importing from "../App")


const Dashboard = lazy(() => import("./pages/Dashboard"));
const Generate = lazy(() => import("./pages/Generate"));
const WebsiteEditor = lazy(() => import("./pages/WebsiteEditor"));
const LiveSite = lazy(() => import("./pages/LiveSite"));
const Pricing = lazy(() => import("./pages/Pricing"));

function Spinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#050505]" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />
    </div>
  );
}

function Protected({ userData, children }) {
  return userData ? children : <Navigate to="/" replace />;
}

function App() {
  const loading = useCurrentUser();
  const { userData } = useSelector((state) => state.user);

  // Wait for the session check so a refresh on /dashboard doesn't bounce to Home
  if (loading) return <Spinner />;

  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Protected userData={userData}><Dashboard /></Protected>} />
          <Route path="/generate" element={<Protected userData={userData}><Generate /></Protected>} />
          <Route path="/editor/:id" element={<Protected userData={userData}><WebsiteEditor /></Protected>} />
          <Route path="/site/:id" element={<LiveSite />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;