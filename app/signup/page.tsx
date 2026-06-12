"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

/**
 * Prototype-only account / create-workspace page.
 *
 * This is NOT real authentication: no password, no backend, no storage. It
 * exists to make the landing → workspace flow feel complete for the agency
 * demo. On submit it simply routes into the real project-creation flow.
 */

const LABEL = "block text-sm font-medium text-[#1A1A17] mb-1.5";
const INPUT =
  "w-full h-12 rounded-lg border border-[#D8D3C8] bg-white px-4 text-sm text-[#1A1A17] placeholder:text-[#9B968D] transition-colors focus-visible:outline-none focus-visible:border-[#1A1A17] focus-visible:ring-2 focus-visible:ring-[#1A1A17]/15";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // Prototype: nothing is persisted. Hand off to the real project setup flow.
    router.push("/projects/new");
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1A1A17]">
      <header className="border-b border-[#E7E3DA]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/home"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-[#1A1A17] font-serif text-sm text-white">
              I
            </span>
            <span className="font-serif text-[19px] tracking-[-0.01em] text-[#1A1A17]">
              Ivvy
            </span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-[#56524B] transition-colors duration-200 hover:bg-[#EFEBE2] hover:text-[#1A1A17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F4]"
          >
            Open workspace
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 py-16 sm:py-24">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#7A766D]">
          Get started
        </p>
        <h1 className="mt-2.5 font-serif text-[34px] leading-[1.08] tracking-[-0.01em] text-[#1A1A17] sm:text-[40px]">
          Create your Ivvy workspace
        </h1>
        <p className="mt-3.5 text-[15px] leading-relaxed text-[#56524B]">
          Tell Ivvy who you are and what you&apos;re training for. You&apos;ll
          add your materials in the next step.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-[#E7E3DA] bg-white p-6 sm:p-7"
        >
          <div className="space-y-5">
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
                placeholder="you@example.com"
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="signup-subject" className={LABEL}>
                Main exam or subject
              </label>
              <input
                id="signup-subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. CFA Level I, A-Level Economics"
                className={INPUT}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-full bg-[#1A1A17] px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Create workspace
          </button>

          <p className="mt-4 text-center text-xs text-[#7A766D]">
            Prototype preview — no account or password required.
          </p>
        </form>
      </main>
    </div>
  );
}
