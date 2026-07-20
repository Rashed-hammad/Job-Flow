export default function Logo({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="13" width="3.5" height="7" rx="1.2" fill="currentColor" opacity="0.55" />
      <rect x="10.25" y="9" width="3.5" height="11" rx="1.2" fill="currentColor" opacity="0.8" />
      <rect x="16.5" y="4" width="3.5" height="16" rx="1.2" fill="currentColor" />
    </svg>
  );
}
