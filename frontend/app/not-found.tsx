import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0705] text-[#e0d5c1] p-6 text-center">
      <h2 className="text-4xl font-heading font-bold text-[#ffd700] mb-4">404 - Page Not Found</h2>
      <p className="text-[#a89680] font-body mb-6">The page you are navigating to does not exist in the Odyssey.</p>
      <Link href="/" className="px-6 py-3 gold-action-btn font-heading text-xs tracking-wider uppercase">
        Return to PhotoFinder
      </Link>
    </div>
  );
}
