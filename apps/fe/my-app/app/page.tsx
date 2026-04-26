
"use client";

import { useState } from "react";
import Link from "next/link";

import AuthModal from "../components/auth-modal";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isAuthed, setIsAuthed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return Boolean(window.localStorage.getItem("auth_token"));
  });

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1b1f24]">
      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onToggleMode={() =>
          setAuthMode(authMode === "signin" ? "signup" : "signin")
        }
      />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-96 w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.12),transparent_60%)]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(185,142,93,0.18),transparent_65%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10">
          <header className="fade-up flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full border border-[#2b3138] bg-[#111418]" />
              <div className="text-sm uppercase tracking-[0.35em] text-[#5b6470]">
                BetterUptime
              </div>
            </div>
            <nav className="hidden items-center gap-8 text-base text-[#3c444d] md:flex">
              <a className="transition hover:text-[#111418]" href="#capabilities">
                CAPABILITIES
              </a>
              <a className="transition hover:text-[#111418]" href="#assurance">
                ASSURANCE
              </a>
              <a className="transition hover:text-[#111418]" href="#contact">
                CONTACT
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                className="rounded-full border border-[#2b3138] px-6 py-2 text-sm uppercase tracking-[0.3em] text-[#2b3138] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
                href="/websites"
              >
                Dashboard
              </Link>
              {isAuthed ? (
                <button
                  className="rounded-full border border-[#2b3138] px-6 py-2 text-sm uppercase tracking-[0.3em] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
                  onClick={() => {
                    window.localStorage.removeItem("auth_token");
                    setIsAuthed(false);
                  }}
                  type="button"
                >
                  Sign out
                </button>
              ) : (
                <button
                  className="rounded-full border border-[#2b3138] px-6 py-2 text-sm uppercase tracking-[0.3em] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthOpen(true);
                  }}
                  type="button"
                >
                  Login
                </button>
              )}
            </div>
          </header>

          <section className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="fade-up fade-up-delay-1">
              <p className="text-xs uppercase tracking-[0.45em] text-[#8b949f]">
                Enterprise Monitoring
              </p>
              <h1 className="font-heading mt-6 text-4xl leading-tight text-[#111418] md:text-5xl">
                Uptime assurance for organizations that cannot afford uncertainty.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-[#4a525d]">
                BetterUptime delivers real-time monitoring, incident response, and
                service-level reporting in a single, disciplined system. Know the
                moment performance drifts, act with precision, and document every
                decision for stakeholders.
              </p>
              <p className="mt-6 text-sm uppercase tracking-[0.35em] text-[#6b7280]">
                Get notified when your website goes down. We care for your website.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[#d8d1c8] pt-8 text-sm">
                <div>
                  <div className="font-heading text-2xl text-[#111418]">99.99%</div>
                  <div className="mt-2 text-[#6b7280]">Historical uptime</div>
                </div>
                <div>
                  <div className="font-heading text-2xl text-[#111418]">3 mins</div>
                  <div className="mt-2 text-[#6b7280]">Check cadence</div>
                </div>
                <div>
                  <div className="font-heading text-2xl text-[#111418]">24/7</div>
                  <div className="mt-2 text-[#6b7280]">Human response</div>
                </div>
              </div>
            </div>

            <div className="fade-up fade-up-delay-2 rounded-3xl border border-[#cfc7bc] bg-white/70 p-8 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.6)]">
              <div className="flex items-center justify-between border-b border-[#e4ded5] pb-4 text-xs uppercase tracking-[0.3em] text-[#6b7280]">
                <span>Latest Website Ticks</span>
                <span>Region: West Europe</span>
              </div>
              <div className="mt-8 rounded-2xl border border-[#e4ded5] bg-white/80">
                <div className="border-b border-[#e4ded5] px-6 py-4 text-xs uppercase tracking-[0.3em] text-[#6b7280]">
                  Websites Table
                </div>
                <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr] gap-4 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-[#8b949f]">
                  <span>Website</span>
                  <span>Status</span>
                  <span>Latency</span>
                </div>
                {[
                  {
                    url: "api.betteruptime.io",
                    status: "Up",
                    latency: "142ms",
                  },
                  {
                    url: "app.betteruptime.io",
                    status: "Up",
                    latency: "168ms",
                  },
                  {
                    url: "status.betteruptime.io",
                    status: "Down",
                    latency: "-",
                  },
                ].map((row) => (
                  <div
                    key={row.url}
                    className="grid grid-cols-[1.4fr_0.7fr_0.7fr] gap-4 border-t border-[#f0e9df] px-6 py-4 text-sm"
                  >
                    <span className="text-[#111418]">{row.url}</span>
                    <span
                      className={`text-xs uppercase tracking-[0.3em] ${
                        row.status === "Up"
                          ? "text-[#205b3d]"
                          : "text-[#8b2f2f]"
                      }`}
                    >
                      {row.status}
                    </span>
                    <span className="text-[#3c444d]">{row.latency}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl bg-[#f2eee8] px-6 py-5">
                <div className="text-xs uppercase tracking-[0.3em] text-[#6b7280]">
                  Monitoring Summary
                </div>
                <div className="mt-3 text-sm text-[#3c444d]">
                  Last tick latency: <span className="font-semibold">142ms</span>
                </div>
                <div className="mt-2 text-sm text-[#3c444d]">
                  Status snapshot: <span className="font-semibold">UP</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section id="capabilities" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
          <div className="fade-up">
            <p className="text-xs uppercase tracking-[0.4em] text-[#8b949f]">
              Capabilities
            </p>
            <h2 className="font-heading mt-5 text-3xl text-[#111418]">
              A disciplined stack for modern reliability teams.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#5b6470]">
              Bring monitoring, alerting, on-call, and reporting into one
              accountable workflow. Every signal is prioritized and every action
              is traceable.
            </p>
          </div>
          <div className="fade-up fade-up-delay-1 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Website monitoring",
                body: "Track URLs you add and keep historical uptime in one place.",
              },
              {
                title: "Status & latency",
                body: "Record response times and up/down status for every tick.",
              },
              {
                title: "Regional tracking",
                body: "Store checks by region to understand where failures occur.",
              },
              {
                title: "Secure access",
                body: "JWT-based sign-in keeps your monitoring data private.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#d8d1c8] bg-white p-6">
                <h3 className="font-heading text-lg text-[#111418]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5b6470]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="assurance" className="bg-[#111418] text-[#f7f4ef]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="fade-up">
              <p className="text-xs uppercase tracking-[0.4em] text-[#b7bcc4]">
                Reliability
              </p>
              <h2 className="font-heading mt-5 text-3xl">
                Built for real uptime checks, not just dashboards.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#cbd0d6]">
                We store every website, every tick, and every status change so you
                can see what happened, when it happened, and from which region.
              </p>
            </div>
            <div className="fade-up fade-up-delay-1 rounded-3xl border border-white/10 bg-white/5 p-8">
              <div className="text-xs uppercase tracking-[0.3em] text-[#b7bcc4]">
                Live Status Summary
              </div>
              <div className="mt-6 space-y-4">
                {[
                  "Website statuses logged per tick",
                  "Response times captured in milliseconds",
                  "Region-based checks stored for analysis",
                ].map((line) => (
                  <div key={line} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#e7d3b2]" />
                    <span className="text-sm text-[#e6e8ea]">{line}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-white/10 pt-6 text-sm text-[#cbd0d6]">
                New checks appear in the timeline as soon as they are recorded.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#f2eee8]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="fade-up">
              <p className="text-xs uppercase tracking-[0.4em] text-[#8b949f]">
                Partnership
              </p>
              <h2 className="font-heading mt-4 text-3xl text-[#111418]">
                Begin a formal reliability engagement.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#5b6470]">
                Share your uptime priorities and receive a tailored monitoring and
                governance roadmap within five business days.
              </p>
            </div>
            <div className="fade-up fade-up-delay-1 rounded-3xl border border-[#d8d1c8] bg-white p-6">
              <div className="text-xs uppercase tracking-[0.3em] text-[#8b949f]">
                Executive Contact
              </div>
              <div className="mt-4 text-sm text-[#3c444d]">
                partnerships@betteruptime.com
              </div>
              <div className="mt-2 text-sm text-[#3c444d]">
                +1 (212) 555-0192
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button className="rounded-full bg-[#111418] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[#f7f4ef]">
                  Schedule briefing
                </button>
                <button className="rounded-full border border-[#2b3138] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[#2b3138]">
                  Download overview
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d8d1c8] bg-[#f7f4ef]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-xs uppercase tracking-[0.3em] text-[#8b949f] md:flex-row md:items-center md:justify-between">
          <span>BetterUptime</span>
          <span>Trust. Transparency. Resilience.</span>
        </div>
      </footer>
    </div>
  );
}
