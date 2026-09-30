import { AnimatePresence, motion } from "motion/react";
import LoginModel from "../components/LoginModel";

import { useDispatch, useSelector } from "react-redux";
import { Coins } from "lucide-react";
import { useState } from "react";

import { serverUrl } from "../App";
import axios from "axios";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function Home() {
  const highlights = [
    {
      title: "AI Generated Code",
      description: "Generate clean and functional website code using AI.",
      icon: "⚡",
    },
    {
      title: "Fully Responsive",
      description: "Websites that look great on desktop, tablet and mobile.",
      icon: "📱",
    },
    {
      title: "Production Ready",
      description: "Build fast, modern websites ready to deploy.",
      icon: "🚀",
    },
  ];

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const [openLogin, setOpenLogin] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });

      dispatch(setUserData(null));
      setOpenProfile(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-purple-600/20 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[10%] top-[30%] h-80 w-80 rounded-full bg-blue-600/20 blur-[120px]"
        />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10"
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer text-2xl font-bold tracking-tight"
        >
          GenWeb<span className="text-purple-500">.AI</span>
        </motion.div>

        <div className="flex items-center gap-4">

          <motion.div
            whileHover={{ y: -2 }}
            className="hidden cursor-pointer text-sm text-gray-400 transition hover:text-white sm:block"
          onClick={()=>navigate("/pricing")}
          >
            Pricing
          </motion.div>

          {/* Credits */}
          {userData && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm backdrop-blur-md"
            
            >
              <Coins size={17} className="text-yellow-400"  />

              <span className="text-gray-400">Credits</span>

              <span className="font-semibold text-white">
                {userData.credits}
              </span>

              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs font-bold" onClick={()=>navigate("/pricing")}>
                +
              </span>
            </motion.div>
          )}

          {/* Login / Profile */}
          {!userData ? (
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(255,255,255,0.12)",
              }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
              onClick={() => setOpenLogin(true)}
            >
              Get Started
            </motion.button>
          ) : (
            <div className="relative">

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenProfile(!openProfile)}
                className="rounded-full border border-white/10 p-0.5 transition hover:border-purple-500/50"
              >
                <img
                  src={
                    userData.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      userData.name
                    )}`
                  }
                  alt={userData.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </motion.button>

              <AnimatePresence>
                {openProfile && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      y: -10,
                    }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#101010]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl"
                  >
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="truncate font-semibold text-white">
                        {userData.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {userData.email}
                      </p>
                    </div>

                    <button className="mt-2 w-full rounded-xl px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                    onClick={()=>navigate("/dashboard")}>
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="mx-auto flex min-h-[75vh] max-w-6xl flex-col items-center justify-center px-6 text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 rounded-full border border-purple-500/20 bg-purple-500/[0.08] px-5 py-2 text-sm text-purple-300 backdrop-blur"
        >
          ✨ The future of website building
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-5xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Build your website in seconds{" "}

          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            with AI
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="mt-7 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg"
        >
          GenWeb.AI is an AI-powered website builder that allows you to create
          professional websites in seconds. Just enter your business name and
          description, and our AI will generate a beautiful website for you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-9"
        >
          <motion.button
            whileHover={{
              scale: 1.06,
              boxShadow: "0px 0px 35px rgba(168,85,247,0.35)",
            }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 font-semibold shadow-lg shadow-purple-500/20"
            onClick={() => navigate("/dashboard")}
          >
            {userData?"Go to dashboard":"Get Started"}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-sm text-gray-500"
        >
          No coding required • AI powered • Deploy anywhere
        </motion.div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-purple-400">
            Why GenWeb.AI
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Everything you need to build
          </h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">

          {highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.12,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition hover:border-purple-500/30 hover:bg-white/[0.06]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl transition group-hover:bg-purple-500/20">
                {h.icon}
              </div>

              <h3 className="text-xl font-semibold">
                {h.title}
              </h3>

              <p className="mt-3 leading-6 text-gray-400">
                {h.description}
              </p>
            </motion.div>
          ))}

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">

          <div className="text-xl font-bold">
            GenWeb<span className="text-purple-500">.AI</span>
          </div>

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} GenWeb.AI. All rights reserved.
          </p>

          <div className="flex gap-5 text-sm text-gray-400">
            <span className="cursor-pointer transition hover:text-white">
              Privacy
            </span>

            <span className="cursor-pointer transition hover:text-white">
              Terms
            </span>
          </div>

        </div>
      </footer>

      {/* Login Modal */}
      {openLogin && (
        <LoginModel
          open={openLogin}
          onClose={() => setOpenLogin(false)}
        />
      )}

    </div>
  );
}

export default Home;
