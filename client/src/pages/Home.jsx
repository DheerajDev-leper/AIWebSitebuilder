import { AnimatePresence, motion } from "motion/react";
import LoginModel from "../components/LoginModel";
import Brand from "../components/Brand";
import Aurora from "../components/Aurora";
import Reveal from "../components/Reveal";

import { useDispatch, useSelector } from "react-redux";
import { Coins, ArrowRight, Code2, Smartphone, Rocket, Plus } from "lucide-react";
import { useState } from "react";

import { serverUrl } from "../config";
import axios from "axios";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const highlights = [
  { title: "Real, clean code", description: "You get plain HTML and CSS you can read, edit and own.", icon: Code2 },
  { title: "Fully responsive", description: "Every site fits desktop, tablet and phone from the first draft.", icon: Smartphone },
  { title: "Ready to publish", description: "Deploy to a shareable link with one click.", icon: Rocket },
];

const steps = [
  { title: "Describe your site", text: "Write a few sentences about your business, audience and style." },
  { title: "Refine in chat", text: "Ask for changes in plain language and watch the preview update." },
  { title: "Publish", text: "Deploy to a live link and share it with anyone." },
];

const reveal = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function HeroMock() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.18, delayChildren: 0.3 }}
      variants={{ hidden: {}, show: {} }}
      className="animate-float relative w-full max-w-lg"
    >
      <div className="relative z-10 gcard rounded-2xl p-4 shadow-2xl shadow-black/40">
        <p className="text-xs text-[#8AA2A8]">Your prompt</p>
        <p className="mt-2 text-sm leading-6 text-white">
          A booking site for a small ceramics studio in Pune. Warm, minimal, with class schedules and a gallery.
          <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-grad" />
        </p>
      </div>

      <div className="-mt-3 ml-6 overflow-hidden rounded-2xl border border-[#1D343D] bg-[#F4EFE8] shadow-2xl shadow-black/50 sm:ml-12">
        <div className="flex items-center gap-1.5 border-b border-black/10 bg-[#E8E1D7] px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-grad-warm" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E9C46A]" />
          <span className="h-2.5 w-2.5 rounded-full bg-grad" />
          <span className="ml-3 h-4 flex-1 rounded-full bg-black/5" />
        </div>
        <div className="space-y-4 p-5 pt-6">
          <motion.div variants={reveal} className="flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-[#2B2118]" />
            <div className="flex gap-2">
              <div className="h-2 w-8 rounded bg-black/20" />
              <div className="h-2 w-8 rounded bg-black/20" />
              <div className="h-2 w-8 rounded bg-black/20" />
            </div>
          </motion.div>
          <motion.div variants={reveal} className="space-y-2 pt-3">
            <div className="h-5 w-3/4 rounded bg-[#2B2118]" />
            <div className="h-5 w-1/2 rounded bg-[#2B2118]" />
            <div className="mt-3 h-2 w-2/3 rounded bg-black/20" />
            <div className="mt-4 h-8 w-28 rounded-full bg-[#C8553D]" />
          </motion.div>
          <motion.div variants={reveal} className="grid grid-cols-3 gap-3 pt-2">
            <div className="aspect-[4/5] rounded-xl bg-[#C8553D]/80" />
            <div className="aspect-[4/5] rounded-xl bg-[#D9B38C]" />
            <div className="aspect-[4/5] rounded-xl bg-[#6B7F6A]" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Home() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      setOpenProfile(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStart = () => {
    if (userData) navigate("/dashboard");
    else setOpenLogin(true);
  };

  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden bg-[#071217] text-[#E9F2F1]">
      <Aurora />
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[720px]" />

      {/* Navbar */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <button onClick={() => navigate("/")} aria-label="SiteNova home">
          <Brand />
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/pricing")}
            className="rounded-lg px-3 py-2 text-sm text-[#8AA2A8] transition hover:text-white"
          >
            Pricing
          </button>

          {userData && (
            <button
              onClick={() => navigate("/pricing")}
              aria-label="Add credits"
              className="flex items-center gap-2 rounded-full border border-[#1D343D] bg-[#0D1D24] py-1.5 pl-3 pr-1.5 text-sm transition hover:border-[#FF8A5B]/50"
            >
              <Coins size={16} className="text-[#FF8A5B]" />
              <span className="font-semibold text-white">{userData.credits}</span>
              <span className="hidden text-[#8AA2A8] sm:inline">credits</span>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-grad-warm text-[#2A0E04]">
                <Plus size={14} strokeWidth={3} />
              </span>
            </button>
          )}

          {!userData ? (
            <button
              onClick={() => setOpenLogin(true)}
              className="rounded-full bg-grad px-5 py-2.5 text-sm font-semibold text-[#04201A] transition hover:brightness-110"
            >
              Sign in
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpenProfile(!openProfile)}
                aria-label="Open profile menu"
                className="rounded-full border border-[#1D343D] p-0.5 transition hover:border-[#3EE8C0]/60"
              >
                <img
                  src={userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`}
                  alt={userData.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              </button>

              <AnimatePresence>
                {openProfile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-[#1D343D] bg-[#0D1D24] p-2 shadow-2xl shadow-black/50"
                  >
                    <div className="border-b border-[#1D343D] px-4 py-3">
                      <p className="truncate font-semibold text-white">{userData.name}</p>
                      <p className="mt-1 truncate text-xs text-[#8AA2A8]">{userData.email}</p>
                    </div>
                    <button
                      className="mt-2 w-full rounded-xl px-4 py-2.5 text-left text-sm text-[#C5D6D8] transition hover:bg-white/5 hover:text-white"
                      onClick={() => navigate("/dashboard")}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-xl px-4 py-2.5 text-left text-sm text-[#FF8A5B] transition hover:bg-[#FF8A5B]/10"
                    >
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pt-20">
        <div>
          <h1 style={{ animationDelay: "0.05s" }} className="rise text-grad-anim pb-2 font-display text-5xl font-extrabold leading-[0.98] sm:text-6xl lg:text-7xl">
            Describe it.
            <br />
            We build the site.
          </h1>

          <p style={{ animationDelay: "0.2s" }} className="rise mt-7 max-w-xl text-base leading-7 text-[#8AA2A8] sm:text-lg">
            Tell SiteNova about your business in a few sentences. It writes the code, shows a live preview,
            and publishes when you're ready.
          </p>

          <div style={{ animationDelay: "0.35s" }} className="rise mt-9 flex flex-wrap items-center gap-3">
            <button
              onClick={handleStart}
              className="glow group flex items-center gap-2 rounded-full bg-grad px-7 py-4 font-semibold text-[#04201A] transition hover:brightness-110"
            >
              {userData ? "Go to dashboard" : "Start building free"}
              <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="rounded-full border border-[#1D343D] px-6 py-4 font-medium text-[#C5D6D8] transition hover:border-[#3EE8C0]/40 hover:text-white"
            >
              See pricing
            </button>
          </div>

          <p style={{ animationDelay: "0.5s" }} className="rise mt-6 text-sm text-[#6B858B]">Start with 100 free credits. No coding required.</p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroMock />
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 lg:px-10">
        <h2 className="text-grad-anim max-w-xl pb-1 font-display text-3xl font-bold sm:text-4xl">
          From idea to live link in three steps
        </h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.12} className="border-t border-[#1D343D] pt-6">
              <span className="text-grad-warm font-display text-4xl font-bold">{i + 1}</span>
              <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 max-w-xs leading-6 text-[#8AA2A8]">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Highlights */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 lg:px-10">
        <div className="gcard grid divide-y divide-[#1D343D] overflow-hidden rounded-3xl md:grid-cols-3 md:divide-x md:divide-y-0">
          {highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.12} className="p-8 transition hover:bg-white/[0.04]">
              <h.icon size={22} className="text-[#3EE8C0]" />
              <h3 className="mt-5 text-lg font-semibold text-white">{h.title}</h3>
              <p className="mt-2 leading-6 text-[#8AA2A8]">{h.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1D343D] px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Brand className="text-lg" />
          <p className="text-sm text-[#6B858B]">© {new Date().getFullYear()} SiteNova. All rights reserved.</p>
          <div className="flex gap-5 text-sm text-[#8AA2A8]">
            <span className="cursor-pointer transition hover:text-white">Privacy</span>
            <span className="cursor-pointer transition hover:text-white">Terms</span>
          </div>
        </div>
      </footer>

      <LoginModel open={openLogin} onClose={() => setOpenLogin(false)} />
    </div>
  );
}

export default Home;