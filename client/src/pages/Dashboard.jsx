import axios from "axios";
import { ArrowLeft, Rocket, Share2, ExternalLink, Check, Plus, Coins } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../config";
import Brand from "../components/Brand";
import Aurora from "../components/Aurora";

function Dashboard() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [websites, setWebsites] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedID, setCopiedId] = useState(null);

  const handleDeploy = async (id) => {
    // open synchronously so Safari/mobile popup blockers allow it
    const win = window.open("", "_blank");
    try {
      const result = await axios.get(`${serverUrl}/api/website/deploy/${id}`, {
        withCredentials: true,
      });
      if (win) win.location.href = result.data.url;
      setWebsites((prev) =>
        (prev || []).map((w) =>
          w._id === id ? { ...w, deployed: true, deployUrl: result.data.url } : w
        )
      );
    } catch (error) {
      console.log(error);
      if (win) win.close();
      alert(error.response?.data?.message || "Deployment failed. Please try again.");
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
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.log("Copy error:", error);
    }
  };

  const firstName = (userData?.name || "there").split(" ")[0];

  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden bg-[#071217] text-[#E9F2F1]">
      <Aurora />
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-[#1D343D] bg-[#071217]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate("/")}
              aria-label="Back to home"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#1D343D] bg-[#0D1D24] text-[#C5D6D8] transition hover:border-[#3EE8C0]/40 hover:text-white"
            >
              <ArrowLeft size={19} />
            </button>
            <Brand className="hidden text-lg sm:inline-flex" />
          </div>

          <div className="flex items-center gap-3">
            {userData && (
              <button
                onClick={() => navigate("/pricing")}
                className="hidden items-center gap-2 rounded-full border border-[#1D343D] bg-[#0D1D24] px-3.5 py-2 text-sm transition hover:border-[#FF8A5B]/50 sm:flex"
              >
                <Coins size={15} className="text-[#FF8A5B]" />
                <span className="font-semibold text-white">{userData.credits}</span>
                <span className="text-[#8AA2A8]">credits</span>
              </button>
            )}
            <button
              onClick={() => navigate("/generate")}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-grad px-4 py-2.5 text-sm font-semibold text-[#04201A] transition hover:brightness-110"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">New website</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* WELCOME */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-grad-anim truncate pb-2 font-display text-4xl font-bold sm:text-5xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-3 text-[#8AA2A8]">
            {websites?.length > 0
              ? `You have ${websites.length} ${websites.length === 1 ? "website" : "websites"}. Open one to keep editing.`
              : "Manage your websites and create something new with AI."}
          </p>
        </motion.div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24" role="status">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1D343D] border-t-[#38BDF8]" />
            <p className="mt-4 text-sm text-[#6B858B]">Loading your websites...</p>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div role="alert" className="mt-8 rounded-2xl border border-[#FF8A5B]/30 bg-[#FF8A5B]/10 px-5 py-4">
            <p className="text-sm text-[#FFB398]">{error}</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && websites?.length === 0 && (
          <div className="mt-10 flex flex-col items-start rounded-3xl border border-dashed border-[#2A4650] bg-[#0D1D24]/60 p-8 sm:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3EE8C0]/15 to-[#A78BFA]/15">
              <Rocket size={22} className="text-[#3EE8C0]" />
            </div>
            <h2 className="font-display mt-6 text-2xl font-bold text-white">No websites yet</h2>
            <p className="mt-2 max-w-md text-[#8AA2A8]">
              Describe your first site and it will show up here, ready to edit and publish.
            </p>
            <button
              onClick={() => navigate("/generate")}
              className="mt-7 rounded-xl bg-grad px-6 py-3 text-sm font-semibold text-[#04201A] transition hover:brightness-110"
            >
              Create your first website
            </button>
          </div>
        )}

        {/* WEBSITES */}
        {!loading && !error && websites?.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {websites.map((w, i) => {
              const copied = copiedID === w._id;
              return (
                <motion.div
                  key={w._id || i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="gcard lift group cursor-pointer overflow-hidden rounded-2xl hover:shadow-2xl hover:shadow-[#38BDF8]/10"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/editor/${w._id}`)}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      navigate(`/editor/${w._id}`);
                    }
                  }}
                >
                  {/* PREVIEW (scaled desktop render) */}
                  <div className="relative h-48 overflow-hidden bg-white">
                    <iframe
                      srcDoc={w.latestCode}
                      title={w.title}
                      sandbox="allow-scripts allow-forms"
                      tabIndex={-1}
                      className="pointer-events-none absolute left-0 top-0 border-0"
                      style={{ width: "250%", height: "250%", transform: "scale(0.4)", transformOrigin: "top left" }}
                    />

                    <span
                      className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${
                        w.deployed ? "bg-[#071217]/85 text-[#3EE8C0]" : "bg-[#071217]/85 text-[#C5D6D8]"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${w.deployed ? "bg-grad" : "bg-[#8AA2A8]"}`} />
                      {w.deployed ? "Live" : "Draft"}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/editor/${w._id}`);
                      }}
                      aria-label="Open editor"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#071217]/85 text-white backdrop-blur-sm transition sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <ExternalLink size={15} />
                    </button>
                  </div>

                  {/* INFO */}
                  <div className="p-5">
                    <h3 className="truncate text-base font-semibold text-white">{w.title}</h3>
                    <p className="mt-1 text-xs text-[#6B858B]">
                      Updated {w.updatedAt ? new Date(w.updatedAt).toLocaleDateString() : "Unknown"}
                    </p>

                    <div className="mt-5">
                      {!w.deployed ? (
                        <button
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-grad px-4 py-2.5 text-sm font-semibold text-[#04201A] transition hover:brightness-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeploy(w._id);
                          }}
                        >
                          <Rocket size={15} />
                          Deploy
                        </button>
                      ) : (
                        <button
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1D343D] px-4 py-2.5 text-sm font-medium text-[#C5D6D8] transition hover:border-[#3EE8C0]/40 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(w);
                          }}
                        >
                          {copied ? (
                            <>
                              <Check size={15} className="text-[#3EE8C0]" />
                              Link copied
                            </>
                          ) : (
                            <>
                              <Share2 size={15} />
                              Copy share link
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;