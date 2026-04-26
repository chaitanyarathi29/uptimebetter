import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "signin" | "signup";

type AuthModalProps = {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onToggleMode: () => void;
};

export default function AuthModal({
  isOpen,
  mode,
  onClose,
  onToggleMode,
}: AuthModalProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const endpoint = mode === "signup" ? "/api/v1/signup" : "/api/v1/signin";
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || "Request failed.");
      }

      const payload = (await response.json()) as { token?: string };
      if (payload.token) {
        window.localStorage.setItem("auth_token", payload.token);
      }

      setFullName("");
      setEmail("");
      setPassword("");
      onClose();
      router.push("/websites");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111418]/70 px-4">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-[#d8d1c8] bg-white p-8 shadow-[0_35px_120px_-80px_rgba(15,23,42,0.65)]"
        role="dialog"
        aria-modal="true"
      >
        <button
          className="absolute right-5 top-5 rounded-full border border-[#cfc7bc] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#5b6470] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
        <div className="text-xs uppercase tracking-[0.35em] text-[#8b949f]">
          BetterUptime Access
        </div>
        <h3 className="font-heading mt-4 text-2xl text-[#111418]">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h3>
        <p className="mt-2 text-sm text-[#5b6470]">
          {mode === "signin"
            ? "Access your monitoring command center."
            : "Start a formal reliability engagement in minutes."}
        </p>

        <div className="mt-8 grid gap-4">
          {mode === "signup" ? (
            <input
              className="h-11 rounded-2xl border border-[#d8d1c8] px-4 text-sm text-[#111418]"
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              type="text"
            />
          ) : null}
          <input
            className="h-11 rounded-2xl border border-[#d8d1c8] px-4 text-sm text-[#111418]"
            placeholder="Work email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
          />
          <input
            className="h-11 rounded-2xl border border-[#d8d1c8] px-4 text-sm text-[#111418]"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-[#f1d2c2] bg-[#fff7f3] px-4 py-3 text-sm text-[#8b4c2f]">
            {error}
          </div>
        ) : null}

        <button
          className="mt-6 w-full rounded-full bg-[#111418] py-3 text-xs uppercase tracking-[0.3em] text-[#f7f4ef] transition hover:bg-[#2b3138] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? "Submitting"
            : mode === "signin"
            ? "Sign in"
            : "Create account"}
        </button>

        <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[#8b949f]">
          <span>{mode === "signin" ? "New here?" : "Already invited?"}</span>
          <button
            className="text-[#2b3138]"
            onClick={() => {
              setError(null);
              onToggleMode();
            }}
            type="button"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
