// app/page.tsx
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
  } catch {
    if (!res.ok) throw { message: text || `HTTP ${res.status}` };
    return (null as unknown) as T;
  }
}

function AddLinkForm({ onCreate }: { onCreate: () => void }) {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await api("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, code: code || undefined }),
      });
      setUrl("");
      setCode("");
      setMsg({ type: "success", text: "Link created." });
      onCreate();
    } catch (err: any) {
      setMsg({ type: "error", text: err?.error || err?.message || "Failed to create link" });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 2500);
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field grow">
          <label className="label">Target URL</label>
          <input
            className="input"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label className="label">Custom code (opt.)</label>
          <input
            className="input"
            placeholder="6-8 chars"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={8}
          />
        </div>

        <div className="form-field actions">
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="helper-row">
        <div className="helper-text">{"Codes must follow [A-Za-z0-9]{6,8} (if provided)."}</div>
        {msg && <div className={msg.type === "error" ? "message error" : "message success"}>{msg.text}</div>}
      </div>
    </form>
  );
}

function LinksTable({ links, refresh }: { links: LinkItem[]; refresh: () => void }) {
  const copy = async (code: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    const el = document.createElement("div");
    el.textContent = `Copied: ${window.location.origin}/${code}`;
    el.className = "toast";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  };

  const remove = async (code: string) => {
    if (!confirm("Delete this link?")) return;
    await fetch(`/api/links/${code}`, { method: "DELETE" });
    refresh();
  };

  return (
    <div>
      {links.length === 0 ? (
        <div className="card empty">No links yet. Create one above.</div>
      ) : (
        <div className="links-grid">
          {links.map((l) => (
            <div key={l.code} className="card link-card">
              <div className="link-top">
                <a className="short" href={`/${l.code}`} target="_blank" rel="noreferrer">
                  {l.code}
                </a>
                <div className="url truncate" title={l.url}>
                  {l.url}
                </div>
              </div>

              <div className="link-meta">
                <div>Clicks: <strong>{l.totalClicks}</strong></div>
                <div>Last: {l.lastClicked ? new Date(l.lastClicked).toLocaleString() : "-"}</div>
                <div className="created">Created: {new Date(l.createdAt).toLocaleDateString()}</div>
              </div>

              <div className="link-actions">
                <button onClick={() => copy(l.code)} className="btn ghost">Copy</button>
                <a className="btn ghost" href={`/code/${l.code}`}>Stats</a>
                <button onClick={() => remove(l.code)} className="btn ghost danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <div className="page-head">
        <h1 className="title">TinyLink Dashboard</h1>
        <p className="muted">Create, manage and track your short links.</p>
      </div>

      <AddLinkForm onCreate={load} />

      <div className="controls">
        <input className="input search" placeholder="Search code or URL" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="muted">{loading ? "Loading..." : `${links.length} links`}</div>
      </div>

      <LinksTable links={filtered} refresh={load} />
    </div>
  );
}
