import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import logo from "../assets/logo.png";
import { signInWithPopup } from "firebase/auth";
import { auth,provider } from "../../firebase";
import axios from "axios";
import { serverUrl } from "../config";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function LoginModel({ open, onClose }) {

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
    const handleGoogleAuth = async () => {

        try {
            if (loading) return
            setLoading(true)
            setError("")
            const result = await signInWithPopup(auth,provider)
            const {data} = await axios.post(`${serverUrl}/api/auth/google`,{
                name:result.user.displayName,
                email:result.user.email,
                avatar:result.user.photoURL
            },{withCredentials:true})
            dispatch(setUserData(data.user));
            setLoading(false)
            onClose()
        } catch (error) {
            console.log(error)
            setLoading(false)
            if (error?.code !== "auth/popup-closed-by-user") setError("Sign-in failed. Please try again.")
        }
        
    }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] p-8 text-white shadow-2xl"
          >
            {/* Decorative gradients */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.35, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-600 blur-3xl"
            />

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.3, 0.15],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-600 blur-3xl"
            />

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 text-xl text-gray-500 transition hover:text-white"
            >
              ×
            </button>

            {/* Content */}
            <div className="relative z-10 text-center">

              <p className="text-sm text-gray-400">
                AI powered website builder
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                <span className="block text-gray-300">Welcome to</span>

                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  GenWeb.AI
                </span>
              </h2>

              {/* Google Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 font-medium text-black transition hover:bg-gray-200"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <img
                  src={logo}
                  alt="Google"
                  className="h-5 w-5"
                />

                {loading ? "Signing in..." : "Continue with Google"}
              </motion.button>

              {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}

              {/* Secure login */}
              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />

                  <span className="text-xs text-gray-500">
                    Secure Login
                  </span>

                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <p className="mt-5 text-xs leading-5 text-gray-500">
                  By continuing, you agree to our{" "}
                  <span className="cursor-pointer text-gray-300 hover:text-white">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="cursor-pointer text-gray-300 hover:text-white">
                    Privacy Policy
                  </span>
                </p>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoginModel;