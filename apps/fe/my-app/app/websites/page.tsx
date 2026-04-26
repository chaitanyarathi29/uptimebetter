"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AddWebsiteModal from "../../components/add-website-modal";

type WebsiteRow = {
  id: string;
  url: string;
  timeAdded: string;
  status: "Up" | "Down" | "Unknown";
  latencyMs: number | null;
  avgResponseTimeMs: number | null;
};

export default function WebsitesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<WebsiteRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const fetchWebsites = async () => {
    const token = window.localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api/v1/websites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || "Failed to load websites.");
      }

      const payload = (await response.json()) as {
        data: Array<{
          id: string;
          url: string;
          timeAdded: string;
          status: "Up" | "Down" | "Unknown";
          latencyMs: number | null;
          avgResponseTimeMs: number | null;
        }>;
      };

      const normalized = payload.data.map((item) => {
        return {
          id: item.id,
          url: item.url,
          timeAdded: item.timeAdded,
          status: item.status,
          latencyMs: item.latencyMs,
          avgResponseTimeMs: item.avgResponseTimeMs,
        };
      });

      setRows(normalized);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchWebsites();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);


  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#1b1f24]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <AddWebsiteModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onWebsiteAdded={(website) => {
            setRows((prev) => [website, ...prev]);
            setError(null);
          }}
        />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-[#8b949f]">
              Website Monitor
            </p>
            <h1 className="font-heading mt-4 text-3xl text-[#111418] whitespace-nowrap">
              Live availability, latency, and response time.
            </h1>
          </div>
          <div className="flex flex-nowrap items-center gap-4">
            <button
              className="rounded-full border border-[#2b3138] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#2b3138] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
              type="button"
              onClick={() => {
                setError(null);
                fetchWebsites();
              }}
            >
              Load Websites
            </button>
            <button
              className="rounded-full border border-[#2b3138] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#2b3138] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
              type="button"
              onClick={() => {
                setError(null);
                setModalOpen(true);
              }}
            >
              Add Website
            </button>
            <button
              className="rounded-full border border-[#2b3138] px-5 py-2 text-xs uppercase tracking-[0.3em] text-[#2b3138] transition hover:bg-[#111418] hover:text-[#f7f4ef]"
              type="button"
              onClick={() => {
                window.localStorage.removeItem("auth_token");
                router.replace("/");
              }}
            >
              Sign out
            </button>
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#8b949f]">
            {rows.length} tracked
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-[#d8d1c8] bg-white p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-[#8b949f]">
              Monitored Websites
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#8b949f]">
              {loading ? "Refreshing" : "Updated now"}
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-[#f1d2c2] bg-[#fff7f3] px-4 py-3 text-sm text-[#8b4c2f]">
              {error}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-2xl border border-[#e4ded5]">
            <div className="grid grid-cols-[1fr] gap-4 bg-[#f2eee8] px-4 py-3 text-xs uppercase tracking-[0.3em] text-[#6b7280]">
              <span>Website</span>
            </div>
            <div className="divide-y divide-[#eee7dd]">
              {rows.map((row) => (
                <Link
                  key={row.id}
                  href={`/websites/${row.id}`}
                  className="grid grid-cols-[1fr] gap-4 px-4 py-4 text-sm transition hover:bg-[#f7f4ef]"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6b7280]">
                    {row.url.replace(/^https?:\/\//, "")}
                  </div>
                </Link>
              ))}
              {!rows.length ? (
                <div className="px-4 py-6 text-sm text-[#8b949f]">
                  No websites available yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
