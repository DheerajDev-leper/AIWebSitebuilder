import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import Brand from "../components/Brand";
import Aurora from "../components/Aurora";

const PHASES = [
  "Analyzing your idea..",
  "Designing layout & structure..",
  "Writing HTML & CSS",
  "Adding animations & interactions",
  "Testing",
];

const EXAMPLES = [
  "Portfolio for a freelance photographer, dark and editorial",
  "Landing page for a local bakery with an online order form",
  "Product page for a meditation app with pricing",
];

function Generate() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [error, setError] = useState("");

  const handleGenerateWebsite = async () => {
    if (!prompt.trim() || loading) return;

    setError("");
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/website/generate/`,
        { prompt },
        { withCredentials: true }
      );

      console.log(result);

      if (typeof result.data.remainingCredits === "number") {
        if (userData) {
          dispatch(setUserData({ ...userData, credits: result.data.remainingCredits }));
        }
      }

      setProgress(100);
      navigate(`/editor/${result.data.websiteId}`);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      setPhaseIndex(0);
      setProgress(0);
      return;
    }

    let value = 0;
    let phase = 0;

    const interval = setInterval(() => {
      const increment =
        value < 20 ? Math.random() * 1.5 : value < 60 ? Math.random() * 1.2 : Math.random() * 0.6;

      value += increment;
      if (value >= 93) value = 93;

      phase = Math.min(Math.floor((value / 100) * PHASES.length), PHASES.length - 1);

      setProgress(Math.floor(value));
      setPhaseIndex(phase);
    }, 1200);

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden bg-[#071217] text-[#E9F2F1]">
      <Aurora />
      <header className="border-b border-[#1D343D] bg-[#071217]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5 sm:px-6">
          <button
            onClick={() => navigate("/")}
            aria-label="Back to home"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1D343D] bg-[#0D1D24] text-[#C5D6D8] transition hover:border-[#3EE8C0]/40 hover:text-white"
          >
            <ArrowLeft size={19} />
          </button>
          <Brand className="text-lg" />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        {/* LEFT: intro */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-grad-anim pb-2 font-display text-4xl font-bold leading-[1.02] sm:text-5xl">
            What should we build?
          </h1>
          <p className="mt-5 max-w-md leading-7 text-[#8AA2A8]">
            Describe the business, the audience and the look you want. Generation can take several minutes because
            we focus on quality, not speed.
          </p>

          <div className="mt-8">
            <p className="text-sm font-medium text-[#C5D6D8]">Need a starting point?</p>
            <div className="mt-3 flex flex-col items-start gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setPrompt(ex);
                    setError("");
                  }}
                  className="rounded-xl border border-[#1D343D] bg-[#0D1D24] px-4 py-2.5 text-left text-sm text-[#C5D6D8] transition hover:border-[#3EE8C0]/40 hover:text-white disabled:opacity-40"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT: composer */}
        <div className="gcard rounded-3xl p-5 shadow-2xl shadow-black/30 sm:p-8">
          <label htmlFor="prompt" className="mb-3 block text-base font-semibold text-white">
            Describe your website
          </label>

          <textarea
            id="prompt"
            placeholder="A landing page for..."
            className="h-52 w-full resize-none rounded-2xl border border-[#1D343D] bg-[#071217] p-4 text-base text-white outline-none transition placeholder:text-[#4F676D] focus:border-[#3EE8C0]/60 focus:ring-2 focus:ring-[#3EE8C0]/10 sm:p-5"
            onChange={(e) => {
              setPrompt(e.target.value);
              setError("");
            }}
            value={prompt}
            disabled={loading}
          />

          {error && (
            <div role="alert" className="mt-4 rounded-xl border border-[#FF8A5B]/30 bg-[#FF8A5B]/10 px-4 py-3">
              <p className="text-sm text-[#FFB398]">{error}</p>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs text-[#6B858B]">{prompt.trim().length} characters</p>
            <button
              className="flex items-center gap-2 rounded-xl bg-grad px-7 py-3 font-semibold text-[#04201A] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleGenerateWebsite}
              disabled={!prompt.trim() || loading}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Generating..." : "Generate website"}
            </button>
          </div>

          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8" role="status">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#C5D6D8]">{PHASES[phaseIndex]}</span>
                <span className="text-sm font-semibold text-[#3EE8C0]">{progress}%</span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#1D343D]">
                <motion.div
                  className="h-full rounded-full bg-grad"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <ul className="mt-5 space-y-2">
                {PHASES.map((p, i) => (
                  <li
                    key={p}
                    className={`flex items-center gap-2.5 text-sm ${
                      i < phaseIndex ? "text-[#8AA2A8]" : i === phaseIndex ? "text-white" : "text-[#4F676D]"
                    }`}
                  >
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-full ${
                        i < phaseIndex ? "bg-grad text-[#04201A]" : "border border-[#2A4650]"
                      } ${i === phaseIndex ? "border-[#3EE8C0]" : ""}`}
                    >
                      {i < phaseIndex && <Check size={10} strokeWidth={4} />}
                    </span>
                    {p.replace(/\.+$/, "")}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-xs text-[#6B858B]">
                Estimated time remaining: <span className="text-[#8AA2A8]">about 8 to 12 minutes</span>
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Generate;