import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

const PHASES = [
  "Analyzing your idea..",
  "Designing layout & structure..",
  "Writing HTML & CSS",
  "Adding animations & interactions",
  "Testing",
];

function Generate() {
  const navigate = useNavigate();

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
        {
          prompt,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result);

      setProgress(100);

      navigate(`/editor/${result.data.websiteId}`);
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Something went wrong"
      );

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
        value < 20
          ? Math.random() * 1.5
          : value < 60
          ? Math.random() * 1.2
          : Math.random() * 0.6;

      value += increment;

      if (value >= 93) {
        value = 93;
      }

      phase = Math.min(
        Math.floor((value / 100) * PHASES.length),
        PHASES.length - 1
      );

      setProgress(Math.floor(value));
      setPhaseIndex(phase);
    }, 1200);

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* HEADER */}

      <div className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>

            <h1 className="text-lg font-bold sm:text-xl">
              GenWeb
              <span className="text-purple-500">.AI</span>
            </h1>
          </div>
        </div>
      </div>

      {/* MAIN */}

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        {/* HERO */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:mb-10"
        >
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Build website with{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              real AI power
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-400 sm:text-base">
            This process may take several minutes. Our focus is
            quality, not speed.
          </p>
        </motion.div>

        {/* INPUT CARD */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur-sm sm:rounded-3xl sm:p-8">
          <h1 className="mb-4 text-lg font-semibold sm:text-xl">
            Describe your website
          </h1>

          <textarea
            placeholder="Describe your idea..."
            className="h-48 w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 sm:h-52 sm:p-5 sm:text-base"
            onChange={(e) => {
              setPrompt(e.target.value);
              setError("");
            }}
            value={prompt}
            disabled={loading}
          />

          {/* ERROR */}

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* GENERATE BUTTON */}

          <div className="mt-5 flex justify-end">
            <motion.button
              whileHover={
                !loading && prompt.trim()
                  ? { scale: 1.03 }
                  : {}
              }
              whileTap={
                !loading && prompt.trim()
                  ? { scale: 0.97 }
                  : {}
              }
              className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold shadow-lg shadow-purple-500/20 transition disabled:cursor-not-allowed disabled:opacity-40 sm:px-7"
              onClick={handleGenerateWebsite}
              disabled={!prompt.trim() || loading}
            >
              {loading ? "Generating..." : "Generate"}
            </motion.button>
          </div>

          {/* PROGRESS */}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-7"
            >
              {/* PHASE */}

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-300">
                  {PHASES[phaseIndex]}
                </span>

                <span className="text-sm font-medium text-purple-400">
                  {progress}%
                </span>
              </div>

              {/* PROGRESS BAR */}

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                />
              </div>

              {/* TIME */}

              <p className="mt-3 text-xs text-gray-500">
                Estimated time remaining:{" "}
                <span className="text-gray-400">
                  ~8–12 minutes
                </span>
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Generate;