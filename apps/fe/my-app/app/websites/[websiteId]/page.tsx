"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type WebsiteTick = {
  id: string;
  response_time_ms: number;
  status: "Up" | "Down" | "Unknown";
  region_id: string;
  createdAt: string;
};

type WebsiteStatusResponse = {
  id: string;
  url: string;
  timeAdded: string;
  ticks: WebsiteTick[];
};

export default function WebsiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const websiteId = Array.isArray(params.websiteId)
    ? params.websiteId[0]
    : params.websiteId;
  const [website, setWebsite] = useState<WebsiteStatusResponse | null>(null);
  const [ticks, setTicks] = useState<WebsiteTick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const fetchStatus = async () => {
    const token = window.localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBase}/api/v1/status/${websiteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || "Failed to load status.");
      }

      const payload = (await response.json()) as WebsiteStatusResponse;
      setWebsite(payload);
      setTicks(payload.ticks ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchStatus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [websiteId]);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1b1f24]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-[#8b949f]">
              Website Status
            </p>
            <h1 className="font-heading mt-4 text-3xl text-[#111418]">
              {website?.url?.replace(/^https?:\/\//, "") || "Website"}
            </h1>
            <div className="mt-2 text-xs uppercase tracking-[0.3em] text-[#6b7280]">
              ID: {websiteId}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              className="rounded-full border border-[#2b3138] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#2b3138] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
              href="/websites"
            >
              Back
            </Link>
            <button
              className="rounded-full border border-[#2b3138] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#2b3138] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
              type="button"
              onClick={fetchStatus}
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-[#f1d2c2] bg-[#fff7f3] px-4 py-3 text-sm text-[#8b4c2f]">
            {error}
          </div>
        ) : null}

        <div className="mt-10 rounded-3xl border border-[#d8d1c8] bg-white p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-[#8b949f]">
              Last Status Checks
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#8b949f]">
              {loading ? "Refreshing" : `${ticks.length} ticks`}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[#e4ded5]">
            <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1fr] gap-4 bg-[#f2eee8] px-4 py-3 text-xs uppercase tracking-[0.3em] text-[#6b7280]">
              <span>Checked At</span>
              <span>Status</span>
              <span>Latency</span>
              <span>Region</span>
            </div>
            <div className="divide-y divide-[#eee7dd]">
              {ticks.map((tick) => (
                <div
                  key={tick.id}
                  className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1fr] gap-4 px-4 py-4 text-sm"
                >
                  <div className="text-[#3c444d]">
                    {new Date(tick.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${
                        tick.status === "Up"
                          ? "border-[#205b3d] text-[#205b3d]"
                          : tick.status === "Down"
                          ? "border-[#8b2f2f] text-[#8b2f2f]"
                          : "border-[#6b7280] text-[#6b7280]"
                      }`}
                    >
                      {tick.status}
                    </span>
                  </div>
                  <div className="text-[#3c444d]">
                    {tick.response_time_ms} ms
                  </div>
                  <div className="text-[#3c444d]">{tick.region_id}</div>
                </div>
              ))}
              {!ticks.length ? (
                <div className="px-4 py-6 text-sm text-[#8b949f]">
                  No status checks yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
