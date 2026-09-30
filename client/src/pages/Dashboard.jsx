import axios from "axios";
import { ArrowLeft, Rocket, Share2, ExternalLink, Check } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";

function Dashboard() {
  const { userData } = useSelector((state) => state.user);

  const navigate = useNavigate();

  const [websites, setWebsites] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedID, setCopiedId] = useState(null);
  const handleDeploy = async (id) => {
    try {
      const result = await axios.get(`${serverUrl}/api/website/deploy/${id}`, {
        withCredentials: true,
      });
      window.open(`${result.data.url}`, "_blank");
      setWebsites((prev)=>prev.map((w)=>{
        w._id === id
        ? {...w, deployed:true, deployUrl:result.data.url}
        : w
      }))
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleGetAllWebsite = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await axios.get(`${serverUrl}/api/website/get-all`, {
          withCredentials: true,
        });

        setWebsites(result.data || []);
      } catch (error) {
        console.log(error);

        setError(error.response?.data?.message || "Failed to load websites");
      } finally {
        setLoading(false);
      }
    };

    handleGetAllWebsite();
  }, []);

  const handleCopy = async (site) => {
    try {
      await navigator.clipboard.writeText(site.deployUrl);
      setCopiedId(site._id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.log("Copy error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* HEADER */}

      <div className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>

            <h1 className="truncate text-lg font-bold sm:text-xl">Dashboard</h1>
          </div>

          {/* NEW WEBSITE */}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/generate")}
            className="shrink-0 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-2.5 text-xs font-semibold shadow-lg shadow-purple-500/20 sm:px-5 sm:text-sm"
          >
            <span className="sm:hidden">+ New</span>
            <span className="hidden sm:inline">+ New Website</span>
          </motion.button>
        </div>
      </div>

      {/* MAIN */}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* WELCOME */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:rounded-3xl sm:p-8"
        >
          <p className="text-sm font-medium text-purple-400">Welcome Back</p>

          <h1 className="mt-2 truncate text-2xl font-bold sm:text-3xl">
            {userData?.name || "User"}
          </h1>

          <p className="mt-2 text-sm text-gray-400 sm:text-base">
            Manage your websites and create something new with AI.
          </p>
        </motion.div>

        {/* LOADING */}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />

            <p className="mt-4 text-sm text-gray-500">
              Loading your websites...
            </p>
          </div>
        )}

        {/* ERROR */}

        {error && !loading && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* NO WEBSITES */}

        {!loading && !error && websites?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
              <Rocket size={24} className="text-purple-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">You have no websites</h2>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              Create your first AI-powered website and it will appear here.
            </p>

            <button
              onClick={() => navigate("/generate")}
              className="mt-6 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2.5 text-sm font-semibold transition hover:scale-[1.02]"
            >
              Create Website
            </button>
          </motion.div>
        )}

        {/* WEBSITES */}

        {!loading && !error && websites?.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {websites.map((w, i) => {
              const copied = copiedID === w._id;

              return (
                <motion.div
                  key={w._id || i}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: i * 0.08,
                  }}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]"
                  onClick={()=>navigate(`/editor/${w._id}`)}
                >
                  {/* WEBSITE PREVIEW */}

                  <div className="relative h-52 overflow-hidden bg-white">
                    <iframe
                      srcDoc={w.latestCode}
                      title={w.title}
                      sandbox="allow-scripts allow-forms"
                      className="h-full w-full border-0"
                    />

                    {/* OPEN EDITOR */}

                    <button
                      onClick={() => navigate(`/editor/${w._id}`)}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
                    >
                      <ExternalLink size={15} />
                    </button>
                  </div>

                  {/* WEBSITE INFO */}

                  <div className="p-5">
                    <h3 className="truncate text-base font-semibold text-white">
                      {w.title}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Last Updated{" "}
                      {w.updatedAt
                        ? new Date(w.updatedAt).toLocaleDateString()
                        : "Unknown"}
                    </p>

                    {/* ACTION */}

                    <div className="mt-5">
                      {!w.deployed ? (
                        <button
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                          onClick={() => handleDeploy(w._id)}
                        >
                          <Rocket size={15} />
                          Deploy
                        </button>
                      ) : (
                        <motion.button
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
                          onClick={() => handleCopy(w)}
                        >
                          {copied ? (
                            <>
                              <Check size={15} />
                              Link Copied
                            </>
                          ) : (
                            <>
                              <Share2 size={15} />
                              Share Link
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
