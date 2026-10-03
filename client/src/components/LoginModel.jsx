import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import logo from "../assets/logo.png";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import axios from "axios";
import { serverUrl } from "../config";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import Brand from "./Brand";

function LoginModel({ open, onClose }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    try {
      if (loading) return;
      setLoading(true);
      setError("");
      const result = await signInWithPopup(auth, provider);
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google`,
        {
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data.user));
      setLoading(false);
      onClose();
    } catch (error) {
      console.log(error);
      setLoading(false);
      if (error?.code !== "auth/popup-closed-by-user") setError("Sign-in failed. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#030A0D]/80 px-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Sign in"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden gcard rounded-3xl p-8 text-white shadow-2xl"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-[#3EE8C0]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-[#A78BFA]/15 blur-3xl" />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 text-2xl leading-none text-[#6B858B] transition hover:text-white"
            >
              ×
            </button>

            <div className="relative z-10">
              <Brand />

              <h2 className="text-grad-anim mt-8 pb-1 font-display text-3xl font-bold leading-tight">Sign in to start building</h2>
              <p className="mt-3 text-sm leading-6 text-[#8AA2A8]">
                New accounts get 100 free credits. No card needed.
              </p>

              <button
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 font-medium text-black transition hover:bg-gray-200 disabled:opacity-70"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <img src={logo} alt="" className="h-5 w-5" />
                {loading ? "Signing in..." : "Continue with Google"}
              </button>

              {error && (
                <p role="alert" className="mt-3 text-sm text-[#FFB398]">
                  {error}
                </p>
              )}

              <p className="mt-6 border-t border-[#1D343D] pt-5 text-xs leading-5 text-[#6B858B]">
                By continuing, you agree to our{" "}
                <span className="cursor-pointer text-[#C5D6D8] hover:text-white">Terms of Service</span> and{" "}
                <span className="cursor-pointer text-[#C5D6D8] hover:text-white">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginModel;