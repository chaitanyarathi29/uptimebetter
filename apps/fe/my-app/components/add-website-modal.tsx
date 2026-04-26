import { useState } from "react";

type WebsiteRow = {
  id: string;
  url: string;
  timeAdded: string;
  status: "Up" | "Down" | "Unknown";
  latencyMs: number | null;
  avgResponseTimeMs: number | null;
};

type AddWebsiteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onWebsiteAdded: (website: WebsiteRow) => void;
};

export default function AddWebsiteModal({
  isOpen,
  onClose,
  onWebsiteAdded,
}: AddWebsiteModalProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
    "http://localhost:3000";


  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    if (!websiteUrl.trim()) {
      setError("Website URL is required.");
      return;
    }

    const token = window.localStorage.getItem("auth_token");
    if (!token) {
      setError("Please sign in again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api/v1/website`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: websiteUrl.trim(),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || "Failed to add website.");
      }

      const payload = (await response.json()) as { id?: string };
      onWebsiteAdded({
        id: payload.id || `temp-${Date.now()}`,
        url: websiteUrl.trim(),
        timeAdded: new Date().toISOString(),
        status: "Unknown",
        latencyMs: null,
        avgResponseTimeMs: null,
      });

      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111418]/70 px-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#d8d1c8] bg-white p-8 shadow-[0_35px_120px_-80px_rgba(15,23,42,0.65)]">
        <button
          className="absolute right-5 top-5 rounded-full border border-[#cfc7bc] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#5b6470] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
          onClick={() => {
            setWebsiteUrl("");
            setError(null);
            setSubmitting(false);
            onClose();
          }}
          type="button"
        >
          Close
        </button>
        <div className="text-xs uppercase tracking-[0.35em] text-[#8b949f]">
          Add Website
        </div>
        <h2 className="font-heading mt-4 text-2xl text-[#111418]">
          Register a monitored URL
        </h2>
        <div className="mt-6 grid gap-4">
          <input
            className="h-11 rounded-2xl border border-[#d8d1c8] px-4 text-sm text-[#111418]"
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            type="url"
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
          {submitting ? "Saving" : "Add Website"}
        </button>
      </div>
    </div>
  );
}
