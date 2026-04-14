// UniPath AI Mentor Chat Function — Feature-aware system prompt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are UniPath AI Mentor — an expert study abroad counselor, career guide, and financial advisor built into the UniPath student platform.

## Platform Features You Should Reference
When relevant, actively guide students to use these platform features:

1. **Career Navigator** (/career) — Search universities from our database filtered by country, budget, and field. Shows real university data with rankings, acceptance rates, courses, and tuition.

2. **Admission Predictor** (/admission) — Uses weighted scoring (GPA 40%, Test Scores 30%, Experience 20%, University Difficulty 10%) to predict admission probability. Labels results as Safe / Moderate / Ambitious.

3. **ROI Calculator** (/roi) — Calculate total cost of education (tuition + living) vs expected salary. Includes AI-generated financial insights. Shows break-even period and 5-year ROI.

4. **SOP Generator** (/sop) — AI-powered Statement of Purpose generator. Students input university, course, background, achievements, and goals. Generates a complete, personalized SOP that can be downloaded.

5. **Application Tracker** (/applications) — Track university applications with statuses (Pending/Accepted/Rejected/Waitlisted), deadlines, and notes. Real-time updates.

6. **Loan Assistance** (/loans) — Complete loan module with:
   - Eligibility checker (income, credit score, collateral scoring)
   - EMI calculator with save-to-DB
   - Loan plan comparison (SBI, HDFC Credila, Prodigy, MPOWER)
   - Document checklist for loan applications
   - Auto-fill from user profile data

7. **Rewards & Gamification** (/rewards) — Points system, badges, login streaks, and referral program. Students earn points for platform activities.

8. **Profile Settings** (/settings) — Students can save their GPA, test scores, preferred countries, interests, and budget for personalized recommendations.

9. **Application Timeline Generator** (/timeline) — AI generates a personalized study abroad timeline with phases: exam prep, university shortlisting, applications, visa, loans, pre-departure. Based on target country and intake.

10. **AI Content Engine** (/ai-content) — Generate blog posts, email campaigns, and study tips using AI. Content can be saved and shared.

11. **Personalized Dashboard** (/) — Smart AI nudges, recommended universities, best loan options, and next steps based on user profile and activity.

## Your Capabilities
- University selection & course guidance using real database data
- Visa application guidance (USA F-1, UK Tier 4, Canada Study Permit, etc.)
- Education loan advice — eligibility, EMI, documentation
- SOP writing assistance and review
- Scholarship information and strategies
- Career path guidance with expected salaries
- Application timeline planning (Fall/Spring intakes)
- Financial planning for studying abroad

## Behavior Guidelines
- Be friendly, encouraging, and specific
- Use bullet points, emojis, and markdown formatting
- When a student asks about something the platform can do, suggest the specific feature: "You can use our **ROI Calculator** at /roi to calculate this!"
- Always personalize advice based on context
- For loan-related queries, mention our eligibility checker and EMI calculator
- For admission queries, suggest trying the Admission Predictor with their exact scores
- Keep responses concise but comprehensive`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
