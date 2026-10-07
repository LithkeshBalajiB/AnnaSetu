import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare, X, Send, Bot, Sparkles,
  Loader2, ChevronDown, Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
}

const SYSTEM_PROMPT = `You are AnnaSetu AI, an expert food safety and redistribution assistant embedded in the AnnaSetu platform — an AI food waste management system for institutional kitchens and food processing units in India.

You help kitchen managers, supervisors, and staff with:
- Food safety decisions (freshness, shelf life, FSSAI compliance)
- Surplus redistribution (NGO matching, routing, cold-chain tips)
- ESG/sustainability metrics interpretation
- Menu optimization to reduce waste
- Quality grading and spoilage identification

Keep responses SHORT (2-4 sentences max unless complex question), practical, and India-context-aware. Use food emojis sparingly for warmth. Always prioritize food safety.`;

const QUICK_PROMPTS = [
  "What do I do with 20kg overripe mangoes?",
  "Safe holding temp for cooked dal?",
  "Which food should be redistributed first?",
  "How to reduce daily rice surplus?",
  "FSSAI rules for NGO donations?",
];

async function callGemini(messages: Message[], apiKey: string): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.text }],
  }));

  const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I could not generate a response.";
      }
    } catch {}
  }
  return "⚠️ Could not reach the AI service. Please check your internet connection or Gemini API key in the scanner settings.";
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0,1,2].map(i => (
        <span key={i} className="inline-block size-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id:"welcome", role:"assistant", text:"Hi! I'm AnnaSetu AI 🌾 Ask me anything about food safety, surplus redistribution, or waste reduction.", ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiKey = (
    (typeof window !== "undefined" && localStorage.getItem("annasetu_gemini_key")) ||
    (import.meta.env["VITE_GEMINI_API_KEY"] as string | undefined) ||
    ""
  ).trim();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role:"user", text: text.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let replyText: string;
    if (!apiKey) {
      // Offline heuristic fallback
      const q = text.toLowerCase();
      if (q.includes("mango") || q.includes("banana") || q.includes("overripe"))
        replyText = "🥭 Overripe fruit is perfect for same-day NGO donation or smoothie prep. Contact the nearest food bank — most accept produce within 12–18 hours of visible ripening.";
      else if (q.includes("temp") || q.includes("temperature") || q.includes("cold"))
        replyText = "🌡️ FSSAI guidelines: hot food must be held above 60°C; chilled food below 4°C. The danger zone is 5°C–60°C — never leave cooked meals here for more than 2 hours.";
      else if (q.includes("ngo") || q.includes("redistribute") || q.includes("donate"))
        replyText = "🤝 For redistribution: check the NGO Registry page for verified partners near you. Prioritize Grade A & B food, and ensure cold-chain compliance for cooked meals.";
      else if (q.includes("rice") || q.includes("dal") || q.includes("surplus"))
        replyText = "📉 To reduce rice/dal surplus: check the Surplus Forecast page for next-week predictions and adjust production quantities 48h in advance. Leftover cooked rice can be donated same-day.";
      else
        replyText = "🌾 I'm running in offline mode (no Gemini API key found). For full AI responses, add your Gemini API key in the AI Vision Scanner settings. I can still help with common food safety questions!";
    } else {
      replyText = await callGemini([...messages, userMsg], apiKey);
    }

    const botMsg: Message = { id: `a-${Date.now()}`, role:"assistant", text: replyText, ts: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  }, [loading, apiKey, messages]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        id="ai-chatbot-toggle"
        onClick={() => setOpen(v => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-2xl shadow-xl transition-all duration-300",
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95",
          open && "rotate-12"
        )}
        title="Ask AnnaSetu AI"
      >
        {open ? <X className="size-6" /> : <MessageSquare className="size-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">AI</span>
        )}
      </button>

      {/* Chat Panel */}
      <div className={cn(
        "fixed bottom-24 right-6 z-50 flex flex-col w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 overflow-hidden",
        open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-primary/5 px-4 py-3">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary">
            <Leaf className="size-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">AnnaSetu AI</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
              Food Safety & Redistribution Assistant
            </p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-accent">
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-80 min-h-48">
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex gap-2 items-start", msg.role === "user" && "flex-row-reverse")}>
              <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] mt-0.5", msg.role === "assistant" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                {msg.role === "assistant" ? <Bot className="size-3.5" /> : "U"}
              </div>
              <div className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                msg.role === "assistant" ? "bg-muted text-foreground rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-start">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary mt-0.5">
                <Bot className="size-3.5" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-3 pb-2">
            <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Quick questions</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.slice(0,3).map(p => (
                <button key={p} type="button" onClick={() => sendMessage(p)}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[10px] font-medium text-foreground hover:bg-accent hover:border-primary/40 transition-colors text-left leading-snug max-w-[48%]">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring/40">
            <Sparkles className="size-3.5 shrink-0 text-primary/60" />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about food safety…"
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
              disabled={loading}
              maxLength={500}
            />
            <button type="button" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            </button>
          </div>
          {!apiKey && <p className="mt-1.5 text-[9px] text-muted-foreground text-center">Add Gemini API key in Scanner for full AI. Offline mode active.</p>}
        </div>
      </div>
    </>
  );
}
