import { Check, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useSelector } from "react-redux";
import { useState } from "react";


const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "Try GenWeb.AI and build your first websites.",
    credits: "100 credits",
    features: [
      "AI website generation",
      "100 credits included",
      "Website editor",
      "Live preview",
      "Deploy websites",
      "Responsive websites",
    ],
    button: "Get Started",
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For developers and creators building regularly.",
    credits: "500 credits / month",
    popular: true,
    features: [
      "Everything in Free",
      "500 credits every month",
      "More AI generations",
      "AI website editing",
      "Unlimited website previews",
      "Priority generation",
      "Custom deployed websites",
    ],
    button: "Upgrade to Pro",
  },
  {
    name: "Premium",
    price: "₹999",
    period: "/month",
    description: "For users who want to build without limits.",
    credits: "1,200 credits / month",
    features: [
      "Everything in Pro",
      "1,200 credits every month",
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
const [buyingPlan, setBuyingPlan] = useState(null);
const [success, setSuccess] = useState("");
const [error, setError] = useState("");

const handleBuyCredits = async (plan) => {
  setBuyingPlan(plan);
  setSuccess("");
  setError("");

  try {
    const result = await axios.post(
      `${serverUrl}/api/user/add-credits`,
      { plan },
      { withCredentials: true }
    );

    // Update credits immediately in Redux
    dispatch(
      setUserData({
        ...userData,
        credits: result.data.credits,
      })
    );

    setSuccess(`${result.data.message}. Your balance is now ${result.data.credits} credits.`);

    setTimeout(() => navigate("/"), 1000);
  } catch (error) {
    console.log(error);
    setError(
      error.response?.data?.message ||
        "Failed to add credits"
    );
  } finally {
    setBuyingPlan(null);
  }
};

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute bottom-[-250px] right-[-100px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#050505]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={19} />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Sparkles size={16} />
            </div>

            <span className="font-bold">GenWeb.AI</span>
          </div>

          <div className="w-[55px]" />
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-300">
            <Sparkles size={14} />
            Simple & transparent pricing
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Build more.
            <span className="block bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
              Pay less.
            </span>
          </h1>

          <p className="mt-5 text-sm leading-6 text-gray-400 sm:text-base">
            Choose a plan that gives you the credits and tools you need to
            create beautiful websites with AI.
          </p>
        </motion.div>

        {success && (
        <div className="relative z-10 mx-auto mt-6 max-w-2xl rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-300">
          {success}
        </div>
      )}

      {error && (
        <div className="relative z-10 mx-auto mt-6 max-w-2xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Pricing Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col rounded-3xl border p-6 sm:p-8 ${
                plan.popular
                  ? "border-purple-500/50 bg-gradient-to-b from-purple-500/10 to-white/[0.03] shadow-2xl shadow-purple-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {/* Popular */}
              {plan.popular && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1.5 text-xs font-semibold">
                  Most Popular
                </div>
              )}

              {/* Plan */}
              <div>
                <h2 className="text-xl font-semibold">{plan.name}</h2>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-400">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-end">
                  <span className="text-4xl font-bold">{plan.price}</span>

                  {plan.period && (
                    <span className="mb-1 ml-1 text-sm text-gray-500">
                      {plan.period}
                    </span>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-sm font-medium text-purple-300">
                    {plan.credits}
                  </p>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => handleBuyCredits(plan.name.toLowerCase())}
                disabled={buyingPlan !== null}
                className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20 hover:opacity-90"
                    : "border border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {buyingPlan === plan.name.toLowerCase() ? "Processing..." : plan.button}
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
                        <Check size={13} className="text-purple-400" />
                      </div>

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mx-auto mt-14 max-w-2xl text-center"
        >
          <p className="text-xs leading-5 text-gray-500">
            Credits are used when generating or modifying websites. You can
            upgrade your plan whenever you need more.
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default Pricing;