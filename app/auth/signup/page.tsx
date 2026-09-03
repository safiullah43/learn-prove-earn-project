"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    if (data.user) {
      setMessage(
        "Account created successfully! Please check your email to verify your account."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#060913] text-white flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.14),transparent_35%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black tracking-tight">
            LPE<span className="text-yellow-400">.</span>
          </Link>

          <p className="mt-3 text-white/40 text-sm">
            Learn • Prove • Earn
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-black">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-white/45">
              Start your learning journey with LPE.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
              />

              <p className="mt-2 text-xs text-white/30">
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 text-sm text-white/50 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(event) =>
                  setAgreeTerms(event.target.checked)
                }
                className="mt-1 h-4 w-4 accent-yellow-400"
              />

              <span>
                I agree to the{" "}
                <span className="text-yellow-400">
                  Terms & Conditions
                </span>{" "}
                and Privacy Policy.
              </span>
            </label>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm leading-6 text-green-300">
                {message}
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 px-5 py-3.5 font-black text-black transition hover:bg-yellow-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Google */}
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white/40"
          >
            <span className="text-lg">G</span>
            Continue with Google
            <span className="text-xs">(Coming Soon)</span>
          </button>

          {/* Login */}
          <p className="mt-7 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-yellow-400 hover:text-yellow-300"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-white/35 transition hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}