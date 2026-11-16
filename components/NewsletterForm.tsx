"use client";

import { useState, type FormEvent } from "react";
import { nl } from "@/content/nl";

type Status = "idle" | "sending" | "success" | "unavailable" | "error";

const MESSAGES: Partial<Record<Status, string>> = {
  success: nl.signup.success,
  unavailable: nl.signup.unavailable,
  error: nl.signup.error,
};

// Answered by app/api/subscribe/route.server.ts (a Vercel function), which adds the address to Brevo.
const SIGNUP_URL = "/api/subscribe";

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    try {
      const response = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: new FormData(form).get("email") }),
      });
      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus(response.status === 503 ? "unavailable" : "error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="relative z-10 flex w-full max-w-[326px] flex-col gap-2 lg:absolute lg:right-7 lg:bottom-[calc(100%+var(--spacing-3))] lg:w-[min(326px,calc(50vw-(100svh-var(--floor-h)-48px)*0.2637-48px))]">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="sr-only">
          {nl.signup.label}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={nl.signup.placeholder}
          className="h-7 w-full min-w-0 rounded-sm border border-night-600 bg-night-800 px-4 text-body text-cream-100 placeholder:text-cream-400"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="flex h-7 items-center gap-2 bg-gold-500 px-4 text-knop whitespace-nowrap text-night-900 hover:bg-gold-300 active:bg-gold-600 disabled:bg-night-700 disabled:text-night-500"
        >
          {nl.signup.button} <span aria-hidden>→</span>
        </button>
      </div>
      <p role="status" className="text-klein text-cream-100 empty:hidden">
        {MESSAGES[status] ?? ""}
      </p>
      <ul className="flex flex-col text-klein text-cream-400">
        {nl.signup.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </form>
  );
}
