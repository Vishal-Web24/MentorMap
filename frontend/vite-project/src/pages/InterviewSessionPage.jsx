import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Mic2, Star, CheckCircle } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

function parseAIMessage(content) {
  const feedbackMatch = content.match(/\[FEEDBACK:\s*(.*?)\]/s);
  const scoreMatch    = content.match(/\[SCORE:\s*(\d+)\/10\]/);
  const nextMatch     = content.match(/\[NEXT:\s*(.*?)\](?:\s*$|\s*\[)/s);
  const isEnd         = content.includes("[END_INTERVIEW]");
  let cleanContent    = content
    .replace(/\[FEEDBACK:.*?\]/s,"").replace(/\[SCORE:\s*\d+\/10\]/g,"")
    .replace(/\[NEXT:.*?\]/s,"").replace(/\[END_INTERVIEW\]/g,"").trim();
  return {
    feedback: feedbackMatch?.[1]?.trim() || "",
    score: scoreMatch ? parseInt(scoreMatch[1]) : null,
    nextQuestion: nextMatch?.[1]?.trim() || "",
    cleanContent, isEnd,
  };
}

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get(`/interview/${id}`).then((r) => setInterview(r.data)).catch(() => navigate("/interview")).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [interview?.messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending || interview?.isCompleted) return;
    const msg = input.trim();
    setInput("");
    setSending(true);
    setInterview((prev) => ({ ...prev, messages: [...prev.messages, { role: "user", content: msg }] }));
    try {
      const r = await api.post(`/interview/${id}/message`, { content: msg });
      setInterview(r.data);
      if (r.data.isCompleted) toast.success("Interview complete! Check your score below.");
    } catch { toast.error("Failed to send message"); }
    finally { setSending(false); inputRef.current?.focus(); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  if (loading) return <div className="p-6 flex items-center justify-center h-full text-base" style={{color:"#6e7681"}}>Loading session...</div>;

  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-dark-500 bg-dark-800 flex-shrink-0">
        <button onClick={() => navigate("/interview")} className="btn-ghost p-2">
          <ArrowLeft size={22} />
        </button>
        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
          <Mic2 size={20} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-base">{interview?.domain} — {interview?.interviewType}</p>
          <p className="text-sm capitalize" style={{color:"#6e7681"}}>{interview?.difficulty} difficulty</p>
        </div>
        {interview?.isCompleted && (
          <div className="flex items-center gap-2 badge-green px-4 py-2 text-base">
            <Star size={16} />
            <span className="font-mono font-bold">{interview.overallScore}/10</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {interview?.messages.map((msg, idx) => {
          if (msg.role === "assistant") {
            const parsed = parseAIMessage(msg.content);
            return (
              <div key={idx} className="flex gap-4 animate-slide-up">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Mic2 size={18} className="text-blue-400" />
                </div>
                <div className="flex-1 space-y-2">
                  {parsed.feedback && (
                    <div className="bg-dark-700 border border-dark-500 rounded-2xl rounded-tl-sm p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{color:"#6e7681"}}>Feedback</p>
                      <p className="text-base leading-relaxed" style={{color:"#8b949e"}}>{parsed.feedback}</p>
                      {parsed.score && (
                        <div className="flex items-center gap-2 mt-3">
                          <Star size={15} className="text-yellow-400" />
                          <span className="text-yellow-400 font-mono text-base font-bold">{parsed.score}/10</span>
                        </div>
                      )}
                    </div>
                  )}
                  {(parsed.nextQuestion || parsed.cleanContent) && (
                    <div className="chat-ai p-4 text-base leading-relaxed">
                      {parsed.nextQuestion || parsed.cleanContent}
                    </div>
                  )}
                  {parsed.isEnd && (
                    <div className="flex items-center gap-2 text-brand-400 text-sm">
                      <CheckCircle size={15} /> <span>Interview completed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div key={idx} className="flex gap-3 justify-end animate-slide-up">
              <div className="max-w-[80%] chat-user p-4 text-base leading-relaxed">{msg.content}</div>
            </div>
          );
        })}
        {sending && (
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Mic2 size={18} className="text-blue-400" />
            </div>
            <div className="chat-ai p-4">
              <div className="flex gap-1.5 items-center">
                {[0,1,2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!interview?.isCompleted ? (
        <div className="flex-shrink-0 p-5 border-t border-dark-500 bg-dark-800">
          <div className="flex gap-3 items-end">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
              className="input-field flex-1 resize-none text-base"
              style={{minHeight:"52px", maxHeight:"140px"}} rows={2} disabled={sending} />
            <button onClick={sendMessage} disabled={!input.trim() || sending}
              className="btn-primary p-3 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={20} />
            </button>
          </div>
          <p className="text-sm mt-2" style={{color:"#6e7681"}}>Answer as you would in a real interview — AI gives detailed feedback</p>
        </div>
      ) : (
        <div className="flex-shrink-0 p-5 border-t border-dark-500 bg-dark-800 text-center">
          <p className="text-base mb-3" style={{color:"#8b949e"}}>
            Interview completed! Score: <span className="text-brand-400 font-mono font-bold text-xl">{interview.overallScore}/10</span>
          </p>
          <button onClick={() => navigate("/interview")} className="btn-primary">Start New Interview</button>
        </div>
      )}
    </div>
  );
}