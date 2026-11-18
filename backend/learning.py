"""Command-driven web knowledge for NOVA.

This stores sourced notes in SQLite; it does NOT modify model weights.
Only explicit learn commands trigger web retrieval. Results are short snippets
with source URLs and timestamps, and should be treated as untrusted reference data.
"""
import os, re, sqlite3, time
from urllib.parse import urlparse
from ddgs import DDGS

DB_PATH = os.getenv("NOVA_KNOWLEDGE_DB", "/data/nova_knowledge.sqlite3")

def _db():
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.execute("""CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY, topic TEXT NOT NULL, title TEXT NOT NULL,
        snippet TEXT NOT NULL, url TEXT NOT NULL UNIQUE, saved_at INTEGER NOT NULL
    )""")
    return con

def learn(topic: str, limit: int = 5):
    topic = re.sub(r"\s+", " ", topic).strip()[:180]
    if not topic:
        return {"saved": 0, "sources": []}
    results = []
    with DDGS() as ddgs:
        for item in ddgs.text(topic, max_results=limit):
            url = (item.get("href") or "").strip()
            title = (item.get("title") or "").strip()[:240]
            snippet = (item.get("body") or "").strip()[:900]
            parsed = urlparse(url)
            if parsed.scheme not in ("http", "https") or not parsed.hostname:
                continue
            if not title or not snippet:
                continue
            results.append((topic, title, snippet, url, int(time.time())))
    con = _db()
    saved = 0
    for row in results:
        try:
            con.execute("INSERT OR REPLACE INTO notes(topic,title,snippet,url,saved_at) VALUES(?,?,?,?,?)", row)
            saved += 1
        except sqlite3.Error:
            pass
    con.commit()
    con.close()
    return {"saved": saved, "sources": [{"title": r[1], "snippet": r[2], "url": r[3]} for r in results]}

def recall(query: str, limit: int = 4):
    words = [w for w in re.findall(r"[\w\u0980-\u09ff\u0900-\u097f]{3,}", query.lower())[:8]]
    if not words:
        return []
    con = _db()
    clauses = " OR ".join(["lower(topic || ' ' || title || ' ' || snippet) LIKE ?" for _ in words])
    args = [f"%{w}%" for w in words]
    rows = con.execute(f"SELECT topic,title,snippet,url FROM notes WHERE {clauses} ORDER BY saved_at DESC LIMIT ?", (*args, limit)).fetchall()
    con.close()
    return [{"topic":r[0],"title":r[1],"snippet":r[2],"url":r[3]} for r in rows]
