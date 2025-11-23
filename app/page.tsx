"use client";

import React, { useEffect, useState } from "react";

type LinkItem = {
  code: string;
  url: string;
  totalClicks: number;
  lastClicked: string | null;
  createdAt: string;
};

async function api<T>(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, { ...opts, cache: "no-store" });
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw json || { message: `HTTP ${res.status}` };
    return json as T;
  } catch (e) {
    if (!res.ok) throw { message: text || `HTTP ${res.status}` };
    return (null as unknown) as T;
  }
}

/* Add link form as a card */
function AddLinkForm({ onCreate }: { onCreate: () => void }) {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api<LinkItem>("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, code: code || undefined }),
      });
      setSuccess("Link created");
      setUrl("");
      setCode("");
      onCreate();
    } catch (err: any) {
      setError(err?.error || err?.message || "Failed");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 2000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="flex-1 min-w-0">
          <label className="block text-sm text-slate-600 mb-1">Target URL</label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div className="w-48 min-w-[12rem]">
          <label className="block text-sm text-slate-600 mb-1">Custom code (opt.)</label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            placeholder="abcdef"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={8}
          />
        </div>

        <div className="flex-shrink-0">
          <label className="block text-sm text-transparent mb-1">Create</label>
          <button
            className="btn inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md shadow"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="mt-3 text-sm">
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <div className="text-slate-500 mt-1 text-xs">
        {"Codes must follow [A-Za-z0-9]{6,8} (if provided)."}
        </div>
      </div>
    </form>
  );
}

/* Links grid/table */
function LinksTable({ links, onDelete }: { links: LinkItem[]; onDelete: () => void }) {
  const copy = async (code: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    // subtle toast replacement
    const el = document.createElement("div");
    el.textContent = `Copied https://${location.host}/${code}`;
    el.className = "fixed bottom-6 right-6 bg-slate-800 text-white px-3 py-2 rounded";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  };

  return (
    <div className="space-y-3">
      {links.length === 0 && (
        <div className="card p-5 text-center text-slate-500">No links yet. Create your first short link above.</div>
      )}

      <div className="grid gap-3">
        {links.map((l) => (
          <div key={l.code} className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <a className="text-indigo-600 font-medium text-lg" href={`/${l.code}`}>{l.code}</a>
                <div className="text-sm text-slate-500 truncate max-w-md" title={l.url}>{l.url}</div>
              </div>
              <div className="flex gap-4 items-center mt-2 text-sm text-slate-600">
                <div>Clicks: <span className="font-semibold text-slate-800">{l.totalClicks}</span></div>
                <div>Last: <span className="text-slate-700">{l.lastClicked ? new Date(l.lastClicked).toLocaleString() : "-"}</span></div>
                <div className="text-xs text-slate-400">Created: {new Date(l.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex gap-2 mt-3 md:mt-0">
              <button onClick={() => copy(l.code)} className="btn-ghost">Copy</button>
              <a className="btn-ghost" href={`/code/${l.code}`}>Stats</a>
              <button onClick={() => { if(confirm('Delete link?')) { fetch(`/api/links/${l.code}`, { method: 'DELETE' }).then(()=>onDelete()) }}} className="btn-ghost text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Dashboard (page) */
export default function Page() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api<LinkItem[]>("/api/links");
      setLinks(data || []);
    } catch (e) {
      console.error(e);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = links.filter((l) => l.code.includes(q) || l.url.includes(q));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-slate-500">Create short links, view clicks and manage your links.</p>
      </div>

      <AddLinkForm onCreate={load} />

      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search code or URL"
          className="px-3 py-2 border rounded w-full md:w-64"
        />
        <div className="text-sm text-slate-500">{loading ? "Loading..." : `${links.length} links`}</div>
      </div>

      <LinksTable links={filtered} onDelete={load} />
    </div>
  );
}
