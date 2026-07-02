"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { getAccount, logIn } from "@/lib/session";

const LABEL = "block text-sm font-medium text-[#1A1A17] mb-1.5";
const INPUT =
  "w-full h-11 rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] placeholder:text-[#9B968D] transition-colors focus-visible:outline-none focus-visible:border-[#1E4634] focus-visible:ring-2 focus-visible:ring-[#1E4634]/15";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);

  useEffect(() => {
    const account = getAccount();
    setHasAccount(Boolean(account));
    if (account) setEmail(account.email);
  }, []);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const user = logIn(email);
    if (!user) {
      setSubmitting(false);
      setError(
        "No study space with that email exists in this browser. Create one instead."
      );
      return;
    }
    router.push("/projects");
  }

  return (
    <AuthShell
      title="Enter your study space."
      description="Your exam projects, materials, and review queue are where you left them."
      footer={
        <p>
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#1E4634] underline-offset-2 hover:underline"
          >
            Set up your study space
          </Link>
        </p>
      }
    >
      {hasAccount === false ? (
        <div className="rounded-lg border border-[#E7E3DA] bg-white p-5">
          <p className="text-sm leading-relaxed text-[#1A1A17]">
            No study space exists in this browser yet.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[#1E4634] px-6 text-sm font-medium text-white transition-colors hover:bg-[#16382A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2"
          >
            Create your study space
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="login-email" className={LABEL}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@university.edu"
              className={INPUT}
            />
          </div>

          {error ? (
            <p className="text-sm leading-relaxed text-[#1A1A17]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || hasAccount === null}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#1E4634] px-6 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#16382A] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
          >
            {submitting ? "Signing in…" : "Log in"}
          </button>

          <p className="text-xs leading-relaxed text-[#7A766D]">
            No password needed yet. Your data stays in this browser for now.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
