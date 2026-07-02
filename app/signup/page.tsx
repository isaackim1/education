"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { signUp } from "@/lib/session";

const LABEL = "block text-sm font-medium text-[#1A1A17] mb-1.5";
const INPUT =
  "w-full h-11 rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] placeholder:text-[#9B968D] transition-colors focus-visible:outline-none focus-visible:border-[#1E4634] focus-visible:ring-2 focus-visible:ring-[#1E4634]/15";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Tell Ivvy your name so your coach knows who it's training.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    signUp(name, email);
    router.push("/projects");
  }

  return (
    <AuthShell
      title="Set up your study space."
      description="Next you'll create your first exam project. Have a syllabus or your notes ready."
      footer={
        <p>
          Already set up in this browser?{" "}
          <Link
            href="/login"
            className="font-medium text-[#1E4634] underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="signup-name" className={LABEL}>
            Name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="signup-email" className={LABEL}>
            Email
          </label>
          <input
            id="signup-email"
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
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#1E4634] px-6 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[#16382A] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4634] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
        >
          {submitting ? "Setting up…" : "Create your study space"}
        </button>

        <p className="text-xs leading-relaxed text-[#7A766D]">
          No password needed yet. Your projects, materials, and mistakes stay in
          this browser for now.
        </p>
      </form>
    </AuthShell>
  );
}
