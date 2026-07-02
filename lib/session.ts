"use client";

/**
 * Local session — honest, browser-only identity.
 *
 * There is no server auth yet: the "account" is a profile stored in this
 * browser's localStorage, and signing in simply reopens it. The UI says so
 * plainly ("your data stays in this browser for now"). When real auth ships,
 * this module is the single seam to replace.
 */

export interface LocalUser {
  name: string;
  email: string;
  createdAt: string;
}

const USER_KEY = "ivvy:user";
const SESSION_KEY = "ivvy:session";

function safeRead<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getAccount(): LocalUser | null {
  const user = safeRead<Partial<LocalUser>>(USER_KEY);
  if (!user || typeof user.email !== "string" || typeof user.name !== "string") {
    return null;
  }
  return {
    name: user.name,
    email: user.email,
    createdAt:
      typeof user.createdAt === "string"
        ? user.createdAt
        : new Date().toISOString(),
  };
}

export function getSession(): LocalUser | null {
  if (typeof window === "undefined") return null;
  const active = window.localStorage.getItem(SESSION_KEY);
  if (active !== "1") return null;
  return getAccount();
}

export function signUp(name: string, email: string): LocalUser {
  const user: LocalUser = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };
  safeWrite(USER_KEY, user);
  window.localStorage.setItem(SESSION_KEY, "1");
  return user;
}

/** Reopen the profile stored in this browser. Returns null when none matches. */
export function logIn(email: string): LocalUser | null {
  const account = getAccount();
  if (!account) return null;
  if (account.email !== email.trim().toLowerCase()) return null;
  window.localStorage.setItem(SESSION_KEY, "1");
  return account;
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

/**
 * Existing local data predates the session layer: if projects exist but no
 * profile does, open an implicit session so returning users are never locked
 * out of their own browser data.
 */
export function ensureSessionForExistingData(hasProjects: boolean): LocalUser | null {
  const session = getSession();
  if (session) return session;
  if (!hasProjects) return null;
  const account = getAccount();
  if (account) {
    window.localStorage.setItem(SESSION_KEY, "1");
    return account;
  }
  return signUp("Student", "student@local");
}
