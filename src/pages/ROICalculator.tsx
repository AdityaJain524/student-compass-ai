import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, TrendingUp, Home, GraduationCap, Sparkles, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

// Average salary data by country (USD)
const salaryEstimates: Record<string, number> = {
  USA: 85000, UK: 55000, Canada: 65000, Germany: 55000, Australia: 70000,
};

const ROICalculator = () => {
  const [country, setCountry] = useState("");
  const [duration, setDuration] = useState("2");
  const [tuition, setTuition] = useState("");
  const [living, setLiving] = useState("");
  const [aiInsight, setAiInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [result, setResult] = useState<null | {
    tuitionTotal: number; livingTotal: number; total: number; salary: number; roi: number;
    breakeven: number; chartData: { name: string; value: number }[];
  }>(null);

  const calculate = () => {
    const t = parseFloat(tuition) || 0;
    const l = parseFloat(living) || 0;
    const y = parseInt(duration) || 2;
    const totalTuition = t * y;
    const totalLiving = l * 12 * y;
    const total = totalTuition + totalLiving;
    const salary = salaryEstimates[country] || 60000;
    const roi = total > 0 ? Math.round(((salary * 5 - total) / total) * 100) : 0;
    const breakeven = salary > 0 ? Math.ceil(total / salary) : 0;

    setResult({
      tuitionTotal: totalTuition, livingTotal: totalLiving, total, salary, roi, breakeven,
      chartData: [
        { name: "Tuition", value: totalTuition },
        { name: "Living", value: totalLiving },
        { name: "1st Year Salary", value: salary },
        { name: "5-Year Earnings", value: salary * 5 },
      ],
    });
  };

  const getAIInsight = async () => {
    if (!result || !country) return;
    setLoadingInsight(true);
    setAiInsight("");

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `As a financial advisor for students, give a brief 3-4 sentence financial insight for studying in ${country}. Total investment: $${result.total.toLocaleString()}, expected annual salary: $${result.salary.toLocaleString()}, ROI: ${result.roi}%, break-even: ${result.breakeven} years. Include advice on scholarships or cost reduction. Be concise.`
          }]
        }),
      });

      if (!resp.ok || !resp.body) { toast.error("Failed to get AI insight"); setLoadingInsight(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

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
            if (c) { content += c; setAiInsight(content); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) {
      toast.error("Failed to connect to AI");
    }
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" /> ROI Calculator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Calculate the return on investment for your education abroad.
        </p>
      </div>

      <Card className="p-6 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Course Duration (years)</Label>
            <Input type="number" placeholder="2" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Annual Tuition (USD)</Label>
            <Input type="number" placeholder="55000" value={tuition} onChange={(e) => setTuition(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Monthly Living Budget (USD)</Label>
            <Input type="number" placeholder="1500" value={living} onChange={(e) => setLiving(e.target.value)} />
          </div>
        </div>
        <Button className="mt-6 gradient-primary border-0 text-primary-foreground" onClick={calculate} disabled={!tuition || !living}>
          <TrendingUp className="mr-2 h-4 w-4" /> Calculate ROI
        </Button>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6 shadow-card space-y-4">
            <h2 className="font-semibold">Cost Breakdown</h2>
            {[
              { label: "Total Tuition", value: result.tuitionTotal, icon: GraduationCap, color: "text-primary" },
              { label: "Total Living Expenses", value: result.livingTotal, icon: Home, color: "text-warning" },
              { label: "Total Investment", value: result.total, icon: DollarSign, color: "text-destructive" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="font-semibold">${item.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="pt-3 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Expected Annual Salary</span>
                <span className="font-bold text-success">${result.salary.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ROI (5 years)</span>
                <span className={`font-bold ${result.roi > 0 ? "text-success" : "text-destructive"}`}>{result.roi}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Break-even</span>
                <span className="font-bold">{result.breakeven} year(s)</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card">
            <h2 className="font-semibold mb-4">Visual Comparison</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* AI Financial Insight */}
      {result && (
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI Financial Insight
            </h2>
            <Button variant="outline" size="sm" onClick={getAIInsight} disabled={loadingInsight}>
              {loadingInsight ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
              {aiInsight ? "Regenerate" : "Get AI Insight"}
            </Button>
          </div>
          {aiInsight ? (
            <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
              <ReactMarkdown>{aiInsight}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click "Get AI Insight" for personalized financial advice.</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default ROICalculator;
