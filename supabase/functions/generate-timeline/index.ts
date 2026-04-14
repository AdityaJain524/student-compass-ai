import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { country, intake } = await req.json();
    if (!country || !intake) {
      return new Response(JSON.stringify({ error: "country and intake are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `Generate a detailed step-by-step study abroad timeline for a student targeting ${country} for ${intake} intake. Include these phases with specific months and actionable tasks:
1. Exam Preparation (IELTS/GRE/GMAT)
2. University Research & Shortlisting
3. Application Preparation & Submission
4. Application Deadlines
5. Visa Process
6. Loan & Financial Planning
7. Pre-Departure Preparation

For each phase, provide:
- Phase name
- Start month and end month (e.g., "January 2025 - March 2025")
- 3-5 specific action items
- Key tips

Format as JSON array: [{"phase":"...","period":"...","tasks":["..."],"tips":"..."}]
Return ONLY the JSON array, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert study abroad counselor. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Extract JSON from possible markdown wrapping
    let jsonStr = content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let timeline;
    try {
      timeline = JSON.parse(jsonStr);
    } catch {
      timeline = [
        { phase: "Exam Preparation", period: "12-10 months before", tasks: ["Register for IELTS/GRE", "Start preparation", "Take mock tests"], tips: "Aim for scores above university minimums" },
        { phase: "University Shortlisting", period: "10-8 months before", tasks: ["Research universities", "Check requirements", "Shortlist 8-10 universities"], tips: "Mix safe, moderate, and ambitious choices" },
        { phase: "Application Submission", period: "8-6 months before", tasks: ["Prepare SOP", "Get recommendations", "Submit applications"], tips: "Apply early for better chances" },
        { phase: "Visa Process", period: "4-2 months before", tasks: ["Gather documents", "Book visa appointment", "Prepare for interview"], tips: "Start early as slots fill up fast" },
        { phase: "Loan & Finance", period: "6-3 months before", tasks: ["Compare loan options", "Apply for loans", "Arrange funds"], tips: "Check eligibility on our Loan module" },
        { phase: "Pre-Departure", period: "2-0 months before", tasks: ["Book flights", "Arrange accommodation", "Pack essentials"], tips: "Join student groups for your university" },
      ];
    }

    return new Response(JSON.stringify({ timeline }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Timeline error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
