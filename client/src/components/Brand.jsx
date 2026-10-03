import { Sparkles } from "lucide-react";

function Brand({ className = "" }) {
  return (
    <span className={`font-display inline-flex items-center gap-2 text-xl font-extrabold text-white ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-grad text-[#04201A]">
        <Sparkles size={15} strokeWidth={2.5} />
      </span>
      <span>
        GenWeb<span className="text-grad-anim">.AI</span>
      </span>
    </span>
  );
}

export default Brand;