import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { Code2, Monitor, Rocket, MessageSquare, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Editor } from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

function Header({ title, onclose }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">GenWeb.AI</p>

          <h1 className="truncate text-sm font-semibold text-white">
            {title || "Website Editor"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
          <Code2 size={16} className="text-purple-400" />
        </div>

        {onclose && (
          <button
            onClick={onclose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={17} />
          </button>
        )}
      </div>
    </div>
  );
}

function Chat({ message = [] }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5">
      <div className="mb-5 flex items-center gap-2">
        <MessageSquare size={15} className="text-purple-400" />

        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Conversation
        </span>
      </div>

      <div className="space-y-4">
        {message.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center">
            <p className="text-xs text-gray-500">No conversation yet.</p>
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
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  m.role === "user"
                    ? "rounded-br-md bg-purple-600 text-white"
                    : "rounded-bl-md border border-white/10 bg-white/[0.04] text-gray-300"
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

function WebsiteEditor() {
  const { id } = useParams();
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
        },
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
            error.response?.data?.message || "Failed to update the website.",
        },
      ]);
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (!updateLoading) return;

    const i = setInterval(() => {
      setThinkingIndex((index) => (index + 1) % thinkingSteps.length);
    }, 1200);

    return () => clearInterval(i);
  }, [updateLoading]);

  useEffect(() => {
    const handleGetWebsite = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/website/get-by-id/${id}`,
          {
            withCredentials: true,
          },
        );

        setWebsite(result.data);
        setCode(result.data.latestCode);

        /*
          Your earlier backend/schema used "converstaion".
          If your schema has now been corrected to "conversation",
          change this line to:

          result.data.conversation || []
        */
        setMessage(result.data.conversation || result.data.converstaion || []);
      } catch (err) {
        console.log(err);

        setError(err.response?.data?.message || "Failed to load website");
      }
    };

    handleGetWebsite();
  }, [id]);

  const handleDeploy = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/website/deploy/${website._id}`, {
        withCredentials: true,
      });
      setWebsite((prev) =>
        prev
          ? { ...prev, deployed: true, deployUrl: result.data.url }
          : prev
      );
      window.open(result.data.url, "_blank");
    } catch (error) {
      console.log(error);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-5 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />

          <p className="text-sm text-gray-500">Loading your website...</p>
        </div>
      </div>
    );
  }
  const responsiveCode = code?.includes('name="viewport"')
    ? code
    : code?.replace(
        "<head>",
        `<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
      );
  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      {/* LEFT SIDEBAR */}

      <aside className="hidden w-[340px] shrink-0 flex-col border-r border-white/10 bg-[#080808] md:flex">
        <Header title={website.title} />

        <Chat message={message} />

        {/* THINKING */}

        {updateLoading && (
          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />

              <p className="text-xs text-gray-400">
                {thinkingSteps[thinkingIndex]}
              </p>
            </div>
          </div>
        )}

        {/* CHAT INPUT */}

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 focus-within:border-purple-500/40">
            <input
              type="text"
              placeholder="Describe your changes..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdate();
                }
              }}
              disabled={updateLoading}
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-gray-600"
            />

            <button
              onClick={handleUpdate}
              disabled={updateLoading || !prompt.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT PREVIEW */}

      <div className="flex min-w-0 flex-1 flex-col bg-[#111111]">
        {/* PREVIEW HEADER */}

        <div className="flex min-h-[65px] shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#0b0b0b] px-3 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05]">
              <Monitor size={17} className="text-gray-400" />
            </div>

            <div>
              <p className="text-sm font-medium text-white">Live Preview</p>

              <p className="text-xs text-gray-500">Your generated website</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* CODE */}

            <button
              className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:px-3"
              onClick={() => setShowCode(true)}
            >
              <Code2 size={15} />

              <span className="hidden sm:block">Code</span>
            </button>

            {/* PREVIEW */}

            <button
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              onClick={() => setShowFullPreview(true)}
            >
              <Monitor size={15} />

              <span className="hidden sm:block">Preview</span>
            </button>

            {/* CHAT */}

            <button
              onClick={() => setShowChat(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-400 transition hover:bg-white/[0.07] hover:text-white md:hidden"
            >
              <MessageSquare size={16} />
            </button>

            {/* DEPLOY */}
              {website.deployed ? "":
            <button className="flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02] sm:gap-2 sm:px-4"
            onClick={handleDeploy}>
              <Rocket size={15} />

              <span>Deploy</span>
            </button>
              }
          </div>
        </div>

        {/* WEBSITE PREVIEW */}

        <div className="relative flex-1 overflow-auto bg-gray-100 p-2">
          <div className="h-full w-full overflow-hidden rounded-lg bg-white shadow-2xl">
            <iframe
              key={responsiveCode}
              title="Website preview"
              srcDoc={responsiveCode}
              sandbox="allow-scripts allow-forms"
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </div>
      </div>

      {/* CODE EDITOR MODAL */}

      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl"
            >
              {/* EDITOR HEADER */}

              <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
                <div className="flex items-center gap-2">
                  <Code2 size={15} className="text-purple-400" />

                  <span className="text-sm text-gray-300">index.html</span>
                </div>

                <button
                  onClick={() => setShowCode(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={17} />
                </button>
              </div>

              {/* MONACO */}

              <div className="min-h-0 flex-1">
                <Editor
                  theme="vs-dark"
                  value={code}
                  language="html"
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: {
                      enabled: false,
                    },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL PREVIEW MODAL */}

      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#0b0b0b] px-5">
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-purple-400" />

                <span className="text-sm font-medium text-white">
                  Full Preview
                </span>
              </div>

              <button
                onClick={() => setShowFullPreview(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="min-h-0 flex-1 bg-white">
              <iframe
                title="Full website preview"
                srcDoc={responsiveCode}
                sandbox="allow-scripts allow-forms"
                className="h-full w-full border-0"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT MODAL */}

      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-white/10 bg-[#080808] shadow-2xl sm:inset-y-5 sm:right-5 sm:h-[calc(100vh-40px)] sm:w-[380px] sm:rounded-2xl"
          >
            <Header title={website.title} onclose={() => setShowChat(false)} />

            <Chat message={message} />

            <div className="border-t border-white/10 p-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                <p className="text-xs text-gray-500">
                  Continue editing from the main editor.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WebsiteEditor;
