"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await login(form.get("email") as string, form.get("password") as string);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <p className="mt-2 text-sm text-slate-600">
        Don&apos;t have an account? <Link href="/register" className="text-emerald-600 hover:underline">Register</Link>
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" />
        <input name="password" type="password" required placeholder="Password" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
