import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import {
  Code2,
  Monitor,
  Rocket,
  MessageSquare,
  Send,
  X,
  Save,
  ExternalLink,
  Smartphone,
  ArrowLeft,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Editor } from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

function Header({ title, onclose, onBack }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1D343D] px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back to dashboard"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1D343D] text-gray-400 transition hover:border-[#3EE8C0]/40 hover:text-white"
          >
            <ArrowLeft size={17} />
          </button>
        )}
        <div className="min-w-0">
          <p className="text-xs text-[#6B858B]">SiteNova</p>
          <h1 className="truncate text-sm font-semibold text-white">{title || "Website editor"}</h1>
        </div>
      </div>

      {onclose && (
        <button
          onClick={onclose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}

function Chat({ message = [] }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [message]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto px-4 py-5">
      <div className="mb-5 flex items-center gap-2">
        <MessageSquare size={15} className="text-[#3EE8C0]" />

        <span className="text-xs font-medium text-gray-500">
          Chat with AI
        </span>
      </div>

      <div className="space-y-4">
        {message.length === 0 ? (
          <div className="rounded-xl border border-[#1D343D] bg-white/[0.03] px-4 py-4 text-center">
            <p className="text-xs text-gray-500">Ask for a change, like "make the hero section bolder".</p>
          </div>
        ) : (
          message.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                  m.role === "user"
                    ? "rounded-br-md bg-grad text-[#04201A]"
                    : "rounded-bl-md border border-[#1D343D] bg-white/[0.04] text-gray-300"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ChatInput({ prompt, setPrompt, onSend, loading, step }) {
  return (
    <>
      {loading && (
        <div className="border-t border-[#1D343D] px-4 py-3" role="status">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-grad" />

            <p className="text-xs text-gray-400">{step}</p>
          </div>
        </div>
      )}

      <div className="border-t border-[#1D343D] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 rounded-xl border border-[#1D343D] bg-white/[0.03] p-2 focus-within:border-[#3EE8C0]/50">
          <input
            type="text"
            placeholder="Describe your changes..."
            aria-label="Describe your changes"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                onSend();
              }
            }}
            disabled={loading}
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-base text-white outline-none placeholder:text-gray-600 md:text-sm"
          />

          <button
            onClick={onSend}
            aria-label="Send"
            disabled={loading || !prompt.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-grad text-[#04201A] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function WebsiteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);

  const [website, setWebsite] = useState(null);
  const [error, setError] = useState("");

  const [code, setCode] = useState("");
  const [message, setMessage] = useState([]);

  const [prompt, setPrompt] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const [thinkingIndex, setThinkingIndex] = useState(0);

  const [showCode, setShowCode] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [device, setDevice] = useState("desktop");

  const [deploying, setDeploying] = useState(false);
  const [saving, setSaving] = useState(false);

  const deferredCode = useDeferredValue(code);

  const thinkingSteps = [
    "Understanding your request",
    "Improving response",
    "Applying the steps",
    "Finalizing update",
  ];

  const handleUpdate = async () => {
    if (!prompt.trim() || updateLoading) return;

    setUpdateLoading(true);
    setThinkingIndex(0);

    setMessage((m) => [
      ...m,
      {
        role: "user",
        content: prompt,
      },
    ]);

    try {
      const result = await axios.post(
        `${serverUrl}/api/website/update/${id}`,
        {
          prompt,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result);

      setMessage((m) => [
        ...m,
        {
          role: "assistant",
          content: result.data.message,
        },
      ]);

      setCode(result.data.code);

      setWebsite((w) =>
        w ? { ...w, latestCode: result.data.code } : w
      );

      if (
        userData &&
        typeof result.data.remainingCredits === "number"
      ) {
        dispatch(
          setUserData({
            ...userData,
            credits: result.data.remainingCredits,
          })
        );
      }

      setPrompt("");
    } catch (error) {
      console.log(error);

      setMessage((m) => [
        ...m,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Failed to update the website.",
        },
      ]);
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (!updateLoading) return;

    const i = setInterval(() => {
      setThinkingIndex(
        (index) => (index + 1) % thinkingSteps.length
      );
    }, 1200);

    return () => clearInterval(i);
  }, [updateLoading, thinkingSteps.length]);

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/website/get-by-id/${id}`,
          {
            withCredentials: true,
          }
        );

        setWebsite(result.data);
        setCode(result.data.latestCode);

        /*
          Your earlier backend/schema used "converstaion".
          If your schema has now been corrected to "conversation",
          change this line to:

          result.data.conversation || []
        */

        setMessage(
          result.data.conversation ||
            result.data.converstaion ||
            []
        );
      } catch (err) {
        console.log(err);

        setError(
          err.response?.data?.message ||
            "Failed to load website"
        );
      }
    };

    handleGetWebsite();
  }, [id]);

  const handleDeploy = async () => {
    if (deploying) return;

    setDeploying(true);

    // Open synchronously so mobile/Safari popup blockers allow it
    const win = window.open("", "_blank");

    try {
      const result = await axios.get(
        `${serverUrl}/api/website/deploy/${website._id}`,
        {
          withCredentials: true,
        }
      );

      setWebsite((prev) =>
        prev
          ? {
              ...prev,
              deployed: true,
              deployUrl: result.data.url,
            }
          : prev
      );

      if (win) {
        win.location.href = result.data.url;
      }
    } catch (error) {
      console.log(error);

      if (win) {
        win.close();
      }

      alert(
        error.response?.data?.message ||
          "Deployment failed. Please try again."
      );
    } finally {
      setDeploying(false);
    }
  };

  const dirty = !!website && code !== website.latestCode;

  const handleSave = async () => {
    if (saving || !dirty) return;

    setSaving(true);

    try {
      await axios.put(
        `${serverUrl}/api/website/save/${id}`,
        { code },
        { withCredentials: true }
      );

      setWebsite((w) =>
        w ? { ...w, latestCode: code } : w
      );
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowCode(false);
        setShowFullPreview(false);
        setShowChat(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () =>
      window.removeEventListener("keydown", onKey);
  }, []);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#071217] px-6 text-white">
        <div className="rounded-2xl border border-[#FF8A5B]/30 bg-[#FF8A5B]/10 px-6 py-5 text-center">
          <p className="text-sm text-[#FFB398]">{error}</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#071217] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1D343D] border-t-[#38BDF8]" />

          <p className="text-sm text-gray-500">
            Loading your website...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Make sure generated HTML always has a responsive viewport.
   */
  const VP =
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">';

  /*
   * Remove markdown fences if the AI returns:
   *
   * ```html
   * <html>...</html>
   * ```
   */
  const src = (deferredCode || "")
    .replace(/^\s*```(?:html)?\s*/i, "")
    .replace(/\s*```\s*$/, "");

  /*
   * Add viewport meta tag when it does not already exist.
   */
  const responsiveCode =
    /name=["']viewport["']/i.test(src)
      ? src
      : /<head[^>]*>/i.test(src)
      ? src.replace(
          /<head[^>]*>/i,
          (m) => m + VP
        )
      : VP + src;

  return (
    <div className="flex h-dvh overflow-hidden bg-[#071217] text-white">

      {/* =====================================================
          LEFT SIDEBAR
      ====================================================== */}

      <aside className="hidden w-[340px] shrink-0 flex-col border-r border-[#1D343D] bg-[#0A171D] md:flex">
        <Header title={website.title} onBack={() => navigate("/dashboard")} />

        <Chat message={message} />

        <ChatInput
          prompt={prompt}
          setPrompt={setPrompt}
          onSend={handleUpdate}
          loading={updateLoading}
          step={thinkingSteps[thinkingIndex]}
        />
      </aside>

      {/* =====================================================
          RIGHT PREVIEW
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col bg-[#091519]">

        {/* ===================================================
            PREVIEW HEADER
        ==================================================== */}

        <div className="flex min-h-[65px] shrink-0 items-center justify-between gap-2 border-b border-[#1D343D] bg-[#0D1D24] px-3 py-3 sm:px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05]">
              <Monitor
                size={17}
                className="text-gray-400"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Live preview
              </p>

              <p className="text-xs text-gray-500">
                Updates as you edit
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            {/* DEVICE */}

            <div className="hidden items-center rounded-lg border border-[#1D343D] p-0.5 sm:flex">
              <button
                onClick={() => setDevice("desktop")}
                aria-label="Desktop preview"
                aria-pressed={device === "desktop"}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition ${device === "desktop" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"}`}
              >
                <Monitor size={15} />
              </button>
              <button
                onClick={() => setDevice("mobile")}
                aria-label="Mobile preview"
                aria-pressed={device === "mobile"}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition ${device === "mobile" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"}`}
              >
                <Smartphone size={15} />
              </button>
            </div>

            {/* CODE */}

            <button
              className="flex h-9 items-center gap-2 rounded-lg border border-[#1D343D] bg-white/[0.03] px-2.5 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:px-3"
              onClick={() => setShowCode(true)}
              aria-label="Open code editor"
            >
              <Code2 size={15} />

              <span className="hidden sm:block">
                Code
              </span>
            </button>

            {/* FULL PREVIEW */}

            <button
              className="flex items-center gap-2 rounded-lg border border-[#1D343D] bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              onClick={() => setShowFullPreview(true)}
              aria-label="Open full preview"
            >
              <Monitor size={15} />

              <span className="hidden sm:block">
                Preview
              </span>
            </button>

            {/* CHAT */}

            <button
              onClick={() => setShowChat(true)}
              aria-label="Open chat"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1D343D] bg-white/[0.03] text-gray-400 transition hover:bg-white/[0.07] hover:text-white md:hidden"
            >
              <MessageSquare size={16} />
            </button>

            {/* DEPLOY */}

            {website.deployed ? (
              website.deployUrl && (
                <a
                  href={website.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[#1D343D] bg-white/[0.03] px-2.5 text-xs font-medium text-gray-300 transition hover:bg-white/[0.07] hover:text-white sm:px-3"
                >
                  <ExternalLink size={15} />

                  <span>View live</span>
                </a>
              )
            ) : (
              <button
                className="flex h-9 items-center gap-1.5 rounded-lg bg-grad px-2.5 text-xs font-semibold text-[#04201A] transition hover:brightness-110 disabled:opacity-60 sm:gap-2 sm:px-4"
                onClick={handleDeploy}
                disabled={deploying}
              >
                <Rocket size={15} />

                <span>
                  {deploying
                    ? "Deploying..."
                    : "Deploy"}
                </span>
              </button>
            )}

          </div>
        </div>

        {/* ===================================================
            WEBSITE PREVIEW

            IMPORTANT:
            - No overflow-hidden on the outer preview.
            - iframe receives touch events.
            - allow-scripts enables generated JS.
            - allow-forms enables forms.
            - allow-modals enables alert/confirm/prompt.
            - allow-popups enables links/window.open.
        ==================================================== */}

        <div className="relative flex-1 min-h-0 bg-[#091519] p-3">

          <div className={`relative mx-auto h-full min-h-[320px] rounded-lg bg-white shadow-2xl transition-[width] duration-300 ${device === "mobile" ? "w-[390px] max-w-full" : "w-full"}`}>

            <iframe
              title="Website preview"
              srcDoc={responsiveCode}
              sandbox="allow-scripts allow-forms allow-modals allow-popups"
              className="absolute inset-0 h-full w-full rounded-lg border-0 bg-white"
              style={{
                touchAction: "auto",
              }}
            />

            {!src.trim() && (
              <div className="absolute inset-0 flex items-center justify-center bg-white px-6 text-center text-sm text-gray-500">
                No preview yet: the generated code is empty.
                Send a change request in the chat to regenerate.
              </div>
            )}

          </div>
        </div>
      </div>

      {/* =====================================================
          CODE EDITOR MODAL
      ====================================================== */}

      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-5"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
              }}
              className="flex h-[90dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#1D343D] bg-[#0D1D24] shadow-2xl"
            >

              {/* EDITOR HEADER */}

              <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#1D343D] px-4">

                <div className="flex items-center gap-2">

                  <Code2
                    size={15}
                    className="text-[#3EE8C0]"
                  />

                  <span className="text-sm text-gray-300">
                    index.html
                  </span>

                  <button
                    onClick={handleSave}
                    disabled={saving || !dirty}
                    className="ml-3 flex h-8 items-center gap-1.5 rounded-lg bg-grad px-3 text-xs font-semibold text-[#04201A] transition hover:brightness-110 disabled:opacity-40"
                  >
                    <Save size={14} />

                    {saving
                      ? "Saving..."
                      : dirty
                      ? "Save"
                      : "Saved"}
                  </button>

                </div>

                <button
                  onClick={() => setShowCode(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close code editor"
                >
                  <X size={17} />
                </button>

              </div>

              {/* MONACO */}

              <div className="min-h-0 flex-1">

                <Editor
                  theme="vs-dark"
                  loading={
                    <p className="text-sm text-gray-500">
                      Loading editor...
                    </p>
                  }
                  value={code}
                  language="html"
                  onChange={(value) =>
                    setCode(value || "")
                  }
                  options={{
                    minimap: {
                      enabled: false,
                    },

                    fontSize: 14,

                    scrollBeyondLastLine: false,

                    wordWrap: "on",

                    automaticLayout: true,
                  }}
                />

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          FULL PREVIEW MODAL
      ====================================================== */}

      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black"
          >

            <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#1D343D] bg-[#0D1D24] px-5">

              <div className="flex items-center gap-2">

                <Monitor
                  size={16}
                  className="text-[#3EE8C0]"
                />

                <span className="text-sm font-medium text-white">
                  Full Preview
                </span>

              </div>

              <button
                onClick={() =>
                  setShowFullPreview(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close full preview"
              >
                <X size={17} />
              </button>

            </div>

            {/* FULL INTERACTIVE PREVIEW */}

            <div className="relative min-h-0 flex-1 bg-white">

              <iframe
                title="Full website preview"
                srcDoc={responsiveCode}
                sandbox="allow-scripts allow-forms allow-modals allow-popups"
                className="absolute inset-0 h-full w-full border-0"
                style={{
                  touchAction: "auto",
                }}
              />

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          CHAT MODAL
      ====================================================== */}

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: 30,
            }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-[#1D343D] bg-[#0A171D] shadow-2xl sm:inset-y-5 sm:right-5 sm:h-[calc(100dvh-40px)] sm:w-[380px] sm:rounded-2xl"
          >

            <Header
              title={website.title}
              onBack={() => navigate("/dashboard")}
              onclose={() => setShowChat(false)}
            />

            <Chat message={message} />

            <ChatInput
              prompt={prompt}
              setPrompt={setPrompt}
              onSend={handleUpdate}
              loading={updateLoading}
              step={thinkingSteps[thinkingIndex]}
            />

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default WebsiteEditor;