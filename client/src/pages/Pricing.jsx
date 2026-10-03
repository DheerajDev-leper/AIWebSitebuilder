import { Check, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../config";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useState } from "react";
import Brand from "../components/Brand";
import Aurora from "../components/Aurora";

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
    button: "Get started",
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
    if (buyingPlan) return;
    if (!userData) {
      navigate("/");
      return;
    }
    setBuyingPlan(plan);
    setSuccess("");
    setError("");

    try {
      const result = await axios.post(`${serverUrl}/api/user/add-credits`, { plan }, { withCredentials: true });

      // Update credits immediately in Redux
      dispatch(setUserData({ ...userData, credits: result.data.credits }));

      setSuccess(`${result.data.message}. Your balance is now ${result.data.credits} credits.`);

      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Failed to add credits");
    } finally {
      setBuyingPlan(null);
    }
  };

  return (
    <div className="relative isolate min-h-dvh overflow-x-hidden bg-[#071217] text-[#E9F2F1]">
      <Aurora />
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[560px]" />

      <header className="relative z-10 border-b border-[#1D343D] bg-[#071217]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#C5D6D8] transition hover:text-white"
          >
            <ArrowLeft size={19} />
            <span className="text-sm">Back</span>
          </button>
          <Brand className="text-lg" />
          <div className="w-[55px]" />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <h1 className="text-grad-anim pb-2 font-display text-5xl font-bold leading-[1] sm:text-6xl">
            Pay for the credits you use.
          </h1>
          <p className="mt-5 max-w-xl leading-7 text-[#8AA2A8]">
            Credits are spent when you generate or change a website. Start free and upgrade whenever you need more.
          </p>
        </motion.div>

        {success && (
          <div role="status" className="mt-8 max-w-2xl rounded-xl border border-[#3EE8C0]/30 bg-gradient-to-br from-[#3EE8C0]/15 to-[#A78BFA]/15 px-4 py-3 text-sm text-[#7DF2D5]">
            {success}
          </div>
        )}
        {error && (
          <div role="alert" className="mt-8 max-w-2xl rounded-xl border border-[#FF8A5B]/30 bg-[#FF8A5B]/10 px-4 py-3 text-sm text-[#FFB398]">
            {error}
          </div>
        )}

        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
          {plans.map((plan, index) => {
            const p = !!plan.popular;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`lift relative flex flex-col rounded-3xl border p-6 sm:p-8 ${
                  p ? "border-transparent bg-grad text-[#04201A] shadow-2xl shadow-[#38BDF8]/25" : "gcard"
                }`}
              >
                {p && (
                  <div className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-grad-warm px-3.5 py-1 text-xs font-semibold text-[#2A0E04]">
                    Most popular
                  </div>
                )}

                <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
                <p className={`mt-2 min-h-[48px] text-sm leading-6 ${p ? "text-[#04201A]/75" : "text-[#8AA2A8]"}`}>
                  {plan.description}
                </p>

                <div className="mt-6 flex items-end">
                  <span className="font-display text-5xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className={`mb-1.5 ml-1 text-sm ${p ? "text-[#04201A]/70" : "text-[#6B858B]"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <p className={`mt-3 text-sm font-semibold ${p ? "text-[#04201A]" : "text-[#3EE8C0]"}`}>
                  {plan.credits}
                </p>

                <button
                  onClick={() => handleBuyCredits(plan.name.toLowerCase())}
                  disabled={buyingPlan !== null}
                  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    p
                      ? "bg-[#04201A] text-[#3EE8C0] hover:bg-[#0A332A]"
                      : "border border-[#2A4650] text-white hover:border-[#3EE8C0]/50 hover:bg-white/5"
                  }`}
                >
                  {buyingPlan === plan.name.toLowerCase() ? "Processing..." : plan.button}
                </button>

                <ul className={`mt-8 space-y-3.5 border-t pt-7 ${p ? "border-[#04201A]/20" : "border-[#1D343D]"}`}>
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-3 text-sm ${p ? "" : "text-[#C5D6D8]"}`}>
                      <Check size={16} strokeWidth={3} className={`mt-0.5 shrink-0 ${p ? "text-[#04201A]" : "text-[#3EE8C0]"}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Pricing;