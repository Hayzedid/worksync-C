import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-light via-teal-medium to-teal-deepest p-8">
      <div className="bg-white/90 rounded-xl shadow-2xl p-12 border border-teal-light/30 backdrop-blur-md text-center">
        <h1 className="text-6xl font-extrabold text-teal-deepest mb-4">404</h1>
        <p className="text-xl text-teal-deep mb-8">Page Not Found</p>
        <Link href="/" className="inline-block px-6 py-3 rounded bg-teal-light text-white font-semibold hover:bg-teal-medium transition">Go Home</Link>
      </div>
    </main>
  );
} 