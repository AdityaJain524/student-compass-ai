import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Copy, Download, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const SOP_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sop`;

const SOPGenerator = () => {
  const { user } = useAuth();
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [background, setBackground] = useState("");
  const [achievements, setAchievements] = useState("");
  const [goals, setGoals] = useState("");
  const [tone, setTone] = useState("professional yet personal");
  const [sopContent, setSopContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [sopContent]);

  const generate = async () => {
    if (!university.trim() || !course.trim()) {
      toast.error("Please provide university and course name.");
      return;
    }
    setIsGenerating(true);
    setSopContent("");

    try {
      const resp = await fetch(SOP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ university, course, background, achievements, goals, tone }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Unknown error" }));
        toast.error(body.error || "Failed to generate SOP");
        setIsGenerating(false);
        return;
      }

      if (!resp.body) { toast.error("No stream"); setIsGenerating(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) { fullContent += c; setSopContent(fullContent); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }

      // Save to DB if logged in
      if (user && fullContent) {
        await supabase.from("sop_drafts").insert({
          user_id: user.id,
          university_name: university,
          course,
          content: fullContent,
          prompt_context: { background, achievements, goals, tone },
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect. Please try again.");
    }
    setIsGenerating(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sopContent);
    toast.success("SOP copied to clipboard!");
  };

  const downloadSOP = () => {
    const blob = new Blob([sopContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOP_${university.replace(/\s+/g, "_")}_${course.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> AI SOP Generator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate personalized Statements of Purpose with AI assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="p-6 shadow-card space-y-4">
          <h2 className="font-semibold">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>University *</Label>
              <Input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="e.g., MIT" />
            </div>
            <div className="space-y-2">
              <Label>Course/Program *</Label>
              <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g., MS Computer Science" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Academic Background</Label>
            <Textarea value={background} onChange={(e) => setBackground(e.target.value)} placeholder="Your degree, university, GPA, relevant coursework..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Key Achievements</Label>
            <Textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="Research, projects, internships, awards..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Career Goals</Label>
            <Textarea value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="What do you want to achieve after graduation?" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional yet personal">Professional yet Personal</SelectItem>
                <SelectItem value="formal and academic">Formal & Academic</SelectItem>
                <SelectItem value="passionate and story-driven">Passionate & Story-driven</SelectItem>
                <SelectItem value="concise and direct">Concise & Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={isGenerating} className="w-full gradient-primary border-0 text-primary-foreground">
            {isGenerating ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate SOP</>}
          </Button>
        </Card>

        {/* Output */}
        <Card className="p-6 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Generated SOP</h2>
            {sopContent && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}><Copy className="mr-1 h-3 w-3" /> Copy</Button>
                <Button variant="outline" size="sm" onClick={downloadSOP}><Download className="mr-1 h-3 w-3" /> Download</Button>
              </div>
            )}
          </div>
          <div ref={contentRef} className="flex-1 min-h-[400px] max-h-[600px] overflow-y-auto rounded-xl bg-muted/30 p-4">
            {sopContent ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{sopContent}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <p>Fill in your details and click "Generate SOP" to get started.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SOPGenerator;
