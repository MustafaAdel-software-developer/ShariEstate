"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await register({
        email: form.get("email") as string,
        password: form.get("password") as string,
        firstName: form.get("firstName") as string,
        lastName: form.get("lastName") as string,
        role: form.get("role") as string,
      });
      router.push("/dashboard");
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Already have an account? <Link href="/login" className="text-emerald-600 hover:underline">Sign in</Link>
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input name="firstName" required placeholder="First name" className="rounded-lg border border-slate-300 px-4 py-3 text-sm" />
          <input name="lastName" required placeholder="Last name" className="rounded-lg border border-slate-300 px-4 py-3 text-sm" />
        </div>
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" />
        <input name="password" type="password" required minLength={8} placeholder="Password (min 8 chars)" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" />
        <select name="role" className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm">
          <option value="buyer">Buyer</option>
          <option value="agent">Agent</option>
          <option value="seller">Seller</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}
