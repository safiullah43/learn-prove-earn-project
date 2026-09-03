"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const redirectTo =
          searchParams.get("redirect");

        if (
          redirectTo &&
          redirectTo.startsWith("/")
        ) {
          router.replace(redirectTo);
        } else {
          router.replace("/dashboard");
        }

        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [router, searchParams]);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (loginError) {
      setError(
        loginError.message ||
          "Login failed. Please check your email and password."
      );
      return;
    }

    if (!data.session) {
      setError(
        "Login could not be completed. Please try again."
      );
      return;
    }

    const redirectTo =
      searchParams.get("redirect");

    if (
      redirectTo &&
      redirectTo.startsWith("/")
    ) {
      router.replace(redirectTo);
    } else {
      router.replace("/dashboard");
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#060913] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-yellow-400" />

          <p className="mt-4 text-sm text-white/40">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060913] text-white flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.14),transparent_35%)]" />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-black tracking-tight"
          >
            LPE<span className="text-yellow-400">.</span>
          </Link>

          <p className="mt-3 text-white/40 text-sm">
            Learn • Prove • Earn
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">

          <div className="mb-8">
            <h1 className="text-3xl font-black">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-white/45">
              Login to continue your learning journey.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">

                <label className="text-sm font-semibold text-white/70">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password reset will be added next."
                    )
                  }
                  className="text-xs font-semibold text-yellow-400 hover:text-yellow-300"
                >
                  Forgot Password?
                </button>

              </div>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none placeholder:text-white/25 transition focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 text-sm text-white/50 cursor-pointer">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="h-4 w-4 accent-yellow-400"
              />

              Remember me

            </label>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-300">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 px-5 py-3.5 font-black text-black transition hover:bg-yellow-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading
                ? "Logging in..."
                : "Login →"}
            </button>

          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs text-white/30">
              OR
            </span>

            <div className="h-px flex-1 bg-white/10" />

          </div>

          {/* Google */}
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-white/40"
          >
            <span className="text-lg">
              G
            </span>

            Continue with Google

            <span className="text-xs">
              (Coming Soon)
            </span>
          </button>

          {/* Signup */}
          <p className="mt-7 text-center text-sm text-white/40">
            Don&apos;t have an account?{" "}

            <Link
              href="/auth/signup"
              className="font-bold text-yellow-400 hover:text-yellow-300"
            >
              Create Account
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

function LoginLoading() {
  return (
    <main className="min-h-screen bg-[#060913] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-yellow-400" />

        <p className="mt-4 text-sm text-white/40">
          Loading login...
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}