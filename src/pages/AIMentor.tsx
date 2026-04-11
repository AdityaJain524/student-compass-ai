import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickQuestions = [
  "What are the best universities for Computer Science?",
  "How do I apply for a student visa to the USA?",
  "What loans are available for studying abroad?",
  "Help me write a Statement of Purpose",
];

const mockResponses: Record<string, string> = {
  default: "I'd be happy to help! As your AI mentor, I can assist with university selection, visa processes, loan options, and application preparation. What specific area would you like to explore?",
  university: "For Computer Science, the top universities include:\n\n🏛 **MIT** - #1 globally, strong research focus\n🏛 **Stanford** - Silicon Valley connections\n🏛 **Carnegie Mellon** - Excellent for AI/ML\n🏛 **ETH Zurich** - Top European option, low tuition\n🏛 **University of Toronto** - Great for AI research\n\nWould you like me to check your admission chances for any of these?",
  visa: "Here's a step-by-step guide for a US student visa (F-1):\n\n1. **Get I-20 form** from your university\n2. **Pay SEVIS fee** ($350)\n3. **Complete DS-160** application online\n4. **Schedule interview** at US Embassy\n5. **Prepare documents**: passport, I-20, financials, transcripts\n6. **Attend interview** and answer confidently\n\nProcessing typically takes 3-5 business days. Start at least 3 months before your program begins!",
  loan: "Here are popular education loan options:\n\n💰 **SBI Scholar Loan** - Up to ₹1.5 Cr, 8.5% interest\n💰 **HDFC Credila** - Up to ₹45L, flexible repayment\n💰 **Prodigy Finance** - No collateral needed\n💰 **MPOWER** - For international students\n\nKey factors:\n- Interest rates: 8-12%\n- Moratorium period: Course + 6 months\n- Collateral: Required above ₹7.5L usually\n\nShall I check your loan eligibility?",
  sop: "I'll help you craft a compelling SOP! Here's a structure:\n\n📝 **Paragraph 1**: Hook - Your motivation/story\n📝 **Paragraph 2**: Academic background & achievements\n📝 **Paragraph 3**: Professional experience\n📝 **Paragraph 4**: Why this program/university?\n📝 **Paragraph 5**: Future goals & how the program fits\n\n**Tips**:\n- Be specific, not generic\n- Show, don't tell\n- Keep it under 1000 words\n- Tailor for each university\n\nWould you like me to help draft one based on your profile?",
};

const getResponse = (msg: string): string => {
  const lower = msg.toLowerCase();
  if (lower.includes("university") || lower.includes("computer science") || lower.includes("best")) return mockResponses.university;
  if (lower.includes("visa") || lower.includes("apply")) return mockResponses.visa;
  if (lower.includes("loan") || lower.includes("finance")) return mockResponses.loan;
  if (lower.includes("sop") || lower.includes("statement")) return mockResponses.sop;
  return mockResponses.default;
};

const AIMentor = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI Study Abroad Mentor 🎓. I can help with university selection, visa guidance, loan options, SOP writing, and more. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: getResponse(text) }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-3xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
          <MessageCircle className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold">AI Mentor</h1>
          <p className="text-xs text-muted-foreground">Powered by AI • Always available</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-card">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-lg gradient-accent flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-accent-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "gradient-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              }`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-lg gradient-accent flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-muted transition-colors text-muted-foreground"
              >
                <Sparkles className="inline h-3 w-3 mr-1" />{q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t">
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about studying abroad..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" size="icon" className="gradient-primary border-0 shrink-0" disabled={isTyping || !input.trim()}>
              <Send className="h-4 w-4 text-primary-foreground" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AIMentor;
