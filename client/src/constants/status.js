export const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

// Validated with dataviz's palette validator (adjacent-pairs, categorical, 4 slots):
// worst adjacent CVD floor-band WARN (legal with direct value labels as secondary
// encoding); light-mode contrast WARN on amber mitigated the same way.
export const STATUS_CHART_COLORS = {
  Applied: "#2a78d6",
  Interview: "#eda100",
  Offer: "#008300",
  Rejected: "#e34948",
};

export const STATUS_STYLES = {
  Applied: {
    dot: "bg-blue-500",
    accent: "border-l-blue-500",
  },
  Interview: {
    dot: "bg-amber-500",
    accent: "border-l-amber-500",
  },
  Offer: {
    dot: "bg-emerald-500",
    accent: "border-l-emerald-500",
  },
  Rejected: {
    dot: "bg-rose-500",
    accent: "border-l-rose-500",
  },
};
