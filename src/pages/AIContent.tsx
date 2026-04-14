import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Mail, Lightbulb, Loader2, Copy, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const countries = ["", "USA", "UK", "Canada", "Australia", "Germany"];

const AIContent = () => {
  const { user } = useAuth();
  const [contentType, setContentType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [country, setCountry] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedContent, setSavedContent] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("ai_generated_content").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setSavedContent(data); });
  }, [user]);

  const generate = async () => {
    if (!topic.trim()) { toast.error("Enter a topic"); return; }
    setLoading(true);
    setContent("");

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ contentType, topic, country }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to generate");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setContent(fullContent);
            }
          } catch { /* partial chunk */ }
        }
      }

      // Track activity
      if (user) {
        await supabase.from("user_activity").insert({
          user_id: user.id, activity_type: "content_generated", page: "/ai-content",
          metadata: { contentType, topic, country },
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!user || !content) return;
    const title = content.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 100) || topic;
    const { data, error } = await supabase.from("ai_generated_content").insert({
      user_id: user.id, content_type: contentType, topic, country, title, content,
    }).select().single();
    if (error) { toast.error("Failed to save"); return; }
    setSavedContent(prev => [data, ...prev]);
    toast.success("Content saved!");
  };

  const deleteContent = async (id: string) => {
    await supabase.from("ai_generated_content").delete().eq("id", id);
    setSavedContent(prev => prev.filter(c => c.id !== id));
    toast.success("Deleted");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Content Engine</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate blog posts, emails, and study tips with AI</p>
      </div>

      <Card className="p-6 space-y-4">
        <Tabs value={contentType} onValueChange={setContentType}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="blog"><FileText className="h-4 w-4 mr-1" /> Blog Post</TabsTrigger>
            <TabsTrigger value="email"><Mail className="h-4 w-4 mr-1" /> Email</TabsTrigger>
            <TabsTrigger value="tips"><Lightbulb className="h-4 w-4 mr-1" /> Study Tips</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <Label>Topic</Label>
            <Input placeholder="e.g. How to get into MIT" value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div>
            <Label>Country (optional)</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue placeholder="Any country" /></SelectTrigger>
              <SelectContent>
                {countries.map(c => <SelectItem key={c || "any"} value={c || "any"}>{c || "Any"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={loading} className="gradient-primary text-primary-foreground">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : "Generate Content"}
          </Button>
        </div>
      </Card>

      {content && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Generated Content</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
              <Button variant="outline" size="sm" onClick={saveContent}><Save className="h-4 w-4 mr-1" /> Save</Button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </Card>
      )}

      {savedContent.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Saved Content</h3>
          <div className="space-y-3">
            {savedContent.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.content_type} • {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setContent(item.content); setContentType(item.content_type); }}>View</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteContent(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIContent;
