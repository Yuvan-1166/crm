import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Bot,
  Plus,
  Send,
  Sparkles,
  Database,
  Trash2,
  MessageSquare,
  Clock3,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  createAssistantSession,
  getAssistantHistory,
  sendAssistantMessage,
  deleteAssistantSession,
} from "../services/assistantService";

const STORAGE_KEY = "crm_assistant_sessions_v1";

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const parseStoredSessions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s) => s?.token && s?.title);
  } catch {
    return [];
  }
};

const AssistantBubble = ({ message }) => {
  const isAssistant = message.role === "assistant";
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm ${
          isAssistant ? "bg-white border border-slate-200 text-slate-800" : "bg-sky-600 text-white"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {isAssistant && message.query && (
          <div className="mt-3 rounded-xl bg-slate-900 text-slate-100 p-3 overflow-x-auto">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Generated Query</p>
            <pre className="text-xs whitespace-pre-wrap">{message.query}</pre>
          </div>
        )}
        {isAssistant && message.insight && (
          <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-[11px] uppercase tracking-wide text-emerald-700 mb-1">Insight</p>
            <p className="text-sm text-emerald-900 whitespace-pre-wrap">{message.insight}</p>
          </div>
        )}
        <p className={`mt-2 text-[11px] ${isAssistant ? "text-slate-400" : "text-sky-100"}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

const AIAssistantPage = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const [sessions, setSessions] = useState([]);
  const [activeToken, setActiveToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loadingSession, setLoadingSession] = useState(false);
  const [sending, setSending] = useState(false);
  const [executeQuery, setExecuteQuery] = useState(true);
  const [generateInsight, setGenerateInsight] = useState(true);
  const [error, setError] = useState("");

  const endRef = useRef(null);

  useEffect(() => {
    const initial = parseStoredSessions();
    setSessions(initial);
    if (initial[0]?.token) setActiveToken(initial[0].token);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const activeSession = useMemo(() => sessions.find((s) => s.token === activeToken) || null, [sessions, activeToken]);

  const loadHistory = useCallback(async (token) => {
    setLoadingSession(true);
    setError("");
    try {
      const data = await getAssistantHistory(token);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load session history.");
      setMessages([]);
    } finally {
      setLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    if (!activeToken) {
      setMessages([]);
      return;
    }
    loadHistory(activeToken);
  }, [activeToken, loadHistory]);

  const handleCreateSession = useCallback(async () => {
    setError("");
    setLoadingSession(true);
    try {
      const data = await createAssistantSession({
        queryType: "mysql",
        systemInstructions: "Be concise and explain assumptions before final answers.",
      });

      const token = data.sessionToken;
      const createdAt = data?.session?.createdAt || new Date().toISOString();
      const next = [
        {
          token,
          title: `Session ${new Date(createdAt).toLocaleString()}`,
          createdAt,
        },
        ...sessions,
      ];
      setSessions(next.slice(0, 30));
      setActiveToken(token);
      setMessages([]);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create assistant session.");
    } finally {
      setLoadingSession(false);
    }
  }, [sessions]);

  const handleDeleteSession = useCallback(
    async (token) => {
      try {
        await deleteAssistantSession(token);
      } catch {
        // Ignore delete errors and still clean local list.
      }

      const filtered = sessions.filter((s) => s.token !== token);
      setSessions(filtered);

      if (activeToken === token) {
        setActiveToken(filtered[0]?.token || "");
        if (!filtered[0]) setMessages([]);
      }
    },
    [sessions, activeToken]
  );

  const handleSend = useCallback(async () => {
    if (!activeToken || !prompt.trim() || sending) return;

    const userText = prompt.trim();
    const optimistic = {
      role: "user",
      content: userText,
      query: null,
      query_result: null,
      insight: null,
      timestamp: new Date().toISOString(),
    };

    setPrompt("");
    setSending(true);
    setError("");
    setMessages((prev) => [...prev, optimistic]);

    try {
      const data = await sendAssistantMessage(activeToken, {
        message: userText,
        executeQuery,
        generateInsight,
      });

      if (data?.response) {
        setMessages((prev) => [...prev, data.response]);
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.token === activeToken
            ? { ...s, title: userText.slice(0, 42), updatedAt: new Date().toISOString() }
            : s
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }, [activeToken, prompt, executeQuery, generateInsight, sending]);

  return (
    <div className="h-full min-h-[calc(100vh-10rem)] grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-4">
      <aside className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <div className={`px-4 py-3 border-b border-slate-200 ${isAdmin ? "bg-amber-50" : "bg-sky-50"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className={`w-4 h-4 ${isAdmin ? "text-amber-600" : "text-sky-600"}`} />
              <h2 className="text-sm font-semibold text-slate-800">AI Sessions</h2>
            </div>
            <button
              onClick={handleCreateSession}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg text-white ${isAdmin ? "bg-amber-600 hover:bg-amber-700" : "bg-sky-600 hover:bg-sky-700"}`}
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>
        </div>

        <div className="p-3 space-y-2 overflow-y-auto">
          {sessions.length === 0 && (
            <button
              onClick={handleCreateSession}
              className="w-full border border-dashed border-slate-300 rounded-xl p-4 text-left hover:bg-slate-50"
            >
              <p className="text-sm font-medium text-slate-800">Create your first session</p>
              <p className="text-xs text-slate-500 mt-1">Start asking business or CRM data questions.</p>
            </button>
          )}

          {sessions.map((session) => {
            const active = session.token === activeToken;
            return (
              <button
                key={session.token}
                onClick={() => setActiveToken(session.token)}
                className={`w-full text-left rounded-xl border p-3 transition ${
                  active ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{session.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1 inline-flex items-center gap-1">
                      <Clock3 className="w-3 h-3" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.token);
                    }}
                    className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <header className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${isAdmin ? "text-amber-600" : "text-sky-600"}`} />
                CRM AI Assistant
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Read-only analytics assistance with tenant-aware guardrails
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label className="inline-flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="checkbox"
                  checked={executeQuery}
                  onChange={(e) => setExecuteQuery(e.target.checked)}
                />
                Execute Query
              </label>
              <label className="inline-flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="checkbox"
                  checked={generateInsight}
                  onChange={(e) => setGenerateInsight(e.target.checked)}
                />
                Insight
              </label>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/60">
          {!activeToken && (
            <div className="h-full grid place-items-center text-center text-slate-500">
              <div>
                <MessageSquare className="w-9 h-9 mx-auto mb-2 text-slate-400" />
                <p className="text-sm">Create or select a session to start chatting.</p>
              </div>
            </div>
          )}

          {loadingSession && activeToken && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading session history...
            </div>
          )}

          {!loadingSession && messages.map((m, idx) => <AssistantBubble key={`${m.timestamp || idx}-${idx}`} message={m} />)}

          {sending && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Assistant is thinking...
            </div>
          )}

          <div ref={endRef} />
        </div>

        <footer className="px-4 py-3 border-t border-slate-200 bg-white">
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Ask about contacts, revenue, conversion, sessions, campaigns..."
              className="flex-1 resize-none border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
              disabled={!activeToken || sending}
            />
            <button
              onClick={handleSend}
              disabled={!activeToken || sending || !prompt.trim()}
              className={`h-11 px-4 rounded-xl text-white inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isAdmin ? "bg-amber-600 hover:bg-amber-700" : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default AIAssistantPage;
