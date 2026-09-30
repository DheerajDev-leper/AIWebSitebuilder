import {
  Check,
  ArrowLeft,
  Sparkles,
  Coins,
  Loader2,
  Zap,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

import { useNavigate } from "react-router-dom";

import { serverUrl } from "../App";

import axios from "axios";

import { useDispatch, useSelector } from "react-redux";

import { setUserData } from "../redux/userSlice";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    key: "free",
    price: "₹0",
    period: "",
    description: "A simple way to get started with GenWeb.AI.",
    credits: 100,
    features: [
      "AI website generation",
      "100 credits",
      "Website editor",
      "Live preview",
      "Deploy websites",
      "Responsive websites",
    ],
    button: "Get 100 Credits",
  },

  {
    name: "Pro",
    key: "pro",
    price: "₹499",
    period: "/month",
    description: "For developers and creators building regularly.",
    credits: 500,
    popular: true,
    features: [
      "Everything in Free",
      "500 credits",
      "More AI generations",
      "AI website editing",
      "Unlimited website previews",
      "Priority generation",
      "Custom deployed websites",
    ],
    button: "Get Pro",
  },

  {
    name: "Premium",
    key: "premium",
    price: "₹999",
    period: "/month",
    description: "For users who want more power and more credits.",
    credits: 1200,
    features: [
      "Everything in Pro",
      "1,200 credits",
      "Advanced AI generation",
      "Faster generation",
      "Unlimited projects",
      "Priority support",
      "Premium features",
    ],
    button: "Get Premium",
  },
];

function Pricing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.user);

  const [loadingPlan, setLoadingPlan] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleBuyCredits = async (plan) => {
    if (loadingPlan) return;

    if (!userData) {
      navigate("/");
      return;
    }

    setLoadingPlan(plan);
    setSuccess("");
    setError("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/user/add-credits`,
        {
          plan,
        },
        {
          withCredentials: true,
        }
      );

      /*
        Update Redux immediately.

        This means Home.jsx will immediately receive
        the new credit amount without requiring a reload.
      */
      dispatch(
        setUserData({
          ...userData,
          credits: result.data.credits,
        })
      );

      setSuccess(
        `${result.data.credits - userData.credits} credits added successfully!`
      );

      /*
        Wait a little so the user can actually see
        the success message before returning home.
      */
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      console.log("Credit purchase error:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[140px]" />

        <div className="absolute bottom-[-250px] right-[-100px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute left-[-200px] top-[45%] h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#050505]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={18} />

            <span className="text-sm font-medium">
              Back
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20">
              <Sparkles size={15} />
            </div>

            <span className="font-bold">
              GenWeb<span className="text-purple-400">.AI</span>
            </span>
          </div>

          <div className="w-[70px] sm:w-[85px]" />
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-300">
            <Zap size={14} />

            Simple & transparent pricing
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Build more.
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Create more.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
            Get the credits you need to generate, edit and
            deploy AI-powered websites with GenWeb.AI.
          </p>
        </motion.div>

        {/* Current Credits */}
        {userData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-xl"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/10">
              <Coins
                size={18}
                className="text-yellow-400"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Current balance
              </p>

              <p className="font-semibold text-white">
                {userData.credits} credits
              </p>
            </div>
          </motion.div>
        )}

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400"
            >
              <Check size={16} />

              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto mt-6 flex max-w-md items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => {
            const isLoading = loadingPlan === plan.key;

            return (
              <motion.div
                key={plan.key}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                }}
                whileHover={{
                  y: -6,
                }}
                className={`relative flex flex-col overflow-hidden rounded-3xl border p-6 transition sm:p-8 ${
                  plan.popular
                    ? "border-purple-500/50 bg-gradient-to-b from-purple-500/[0.12] via-white/[0.04] to-white/[0.02] shadow-2xl shadow-purple-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-500/20">
                    Popular
                  </div>
                )}

                {/* Plan name */}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {plan.name}
                    </h2>

                    {plan.popular && (
                      <Sparkles
                        size={16}
                        className="text-purple-400"
                      />
                    )}
                  </div>

                  <p className="mt-2 min-h-[48px] max-w-[280px] text-sm leading-6 text-gray-400">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mt-7 flex items-end">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>

                  {plan.period && (
                    <span className="mb-1 ml-1 text-sm text-gray-500">
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Credits */}
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
                    <Coins
                      size={17}
                      className="text-purple-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Credits
                    </p>

                    <p className="text-sm font-semibold text-purple-300">
                      {plan.credits.toLocaleString()} credits
                    </p>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={() =>
                    handleBuyCredits(plan.key)
                  }
                  disabled={!!loadingPlan}
                  className={`mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20 hover:opacity-90"
                      : "border border-white/10 bg-white/5 hover:bg-white/10"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Adding credits...
                    </>
                  ) : (
                    <>
                      {plan.button}

                      <span>→</span>
                    </>
                  )}
                </button>

                {/* Features */}
                <div className="mt-8 border-t border-white/10 pt-7">
                  <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    What's included
                  </p>

                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3 text-sm text-gray-300"
                      >
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                          <Check
                            size={13}
                            className="text-purple-400"
                          />
                        </div>

                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-12 max-w-2xl text-center"
        >
          <p className="text-xs leading-5 text-gray-600">
            Credits are used when generating or modifying
            websites. Your credit balance updates instantly
            after adding credits.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default Pricing;