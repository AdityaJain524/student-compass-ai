import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, Calculator, FileCheck, CheckCircle, Circle, ArrowRight, Save, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const loanPlans = [
  { bank: "SBI Scholar Loan", rate: 8.5, rateStr: "8.5%", max: "₹1.5 Cr", collateral: "Required > ₹7.5L", processing: "₹10,000" },
  { bank: "HDFC Credila", rate: 9.5, rateStr: "9.5%", max: "₹45L", collateral: "Flexible", processing: "₹5,000" },
  { bank: "Prodigy Finance", rate: 9.0, rateStr: "7.5-11%", max: "$100K", collateral: "Not Required", processing: "None" },
  { bank: "MPOWER Finance", rate: 10.0, rateStr: "7.9-14%", max: "$100K", collateral: "Not Required", processing: "None" },
];

const documents = [
  { name: "Admission Letter", required: true },
  { name: "Passport Copy", required: true },
  { name: "Academic Transcripts", required: true },
  { name: "Bank Statements (6 months)", required: true },
  { name: "Income Proof (Co-applicant)", required: true },
  { name: "Property Documents (for collateral)", required: false },
  { name: "IELTS/GRE Score Card", required: false },
  { name: "Scholarship Letter (if any)", required: false },
];

const LoanAssistance = () => {
  const { user } = useAuth();

  // EMI state
  const [loanAmount, setLoanAmount] = useState("2000000");
  const [interestRate, setInterestRate] = useState("9");
  const [tenure, setTenure] = useState("60");
  const [emi, setEmi] = useState<null | { monthly: number; total: number; interest: number }>(null);

  // Eligibility state
  const [income, setIncome] = useState("");
  const [coIncome, setCoIncome] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const [collateral, setCollateral] = useState("");
  const [eligibility, setEligibility] = useState<null | { eligible: boolean; maxAmount: number; score: number }>(null);

  // Document checklist
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());

  // Saved loans
  const [savedLoans, setSavedLoans] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setSavedLoans(data);
    });
  }, [user]);

  const calcEMI = () => {
    const P = parseFloat(loanAmount) || 0;
    const annualRate = parseFloat(interestRate) || 0;
    const n = parseInt(tenure) || 0;
    if (P <= 0 || annualRate <= 0 || n <= 0) return;

    const r = annualRate / 12 / 100;
    const emiVal = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi({ monthly: Math.round(emiVal), total: Math.round(emiVal * n), interest: Math.round(emiVal * n - P) });
  };

  const checkEligibility = () => {
    const incomeVal = parseFloat(income) || 0;
    const coIncomeVal = parseFloat(coIncome) || 0;
    const creditVal = parseFloat(creditScore) || 700;
    const totalIncome = incomeVal + coIncomeVal;

    // Scoring logic
    let score = 0;
    // Income factor (40%)
    score += Math.min((totalIncome / 1500000) * 40, 40);
    // Credit score (30%)
    score += Math.min(((creditVal - 300) / 550) * 30, 30);
    // Collateral (20%)
    score += collateral === "yes" ? 20 : 5;
    // Co-applicant (10%)
    score += coIncomeVal > 0 ? 10 : 3;

    score = Math.round(Math.max(10, Math.min(98, score)));
    const eligible = score >= 60;
    const maxAmount = eligible ? Math.round(totalIncome * 4) : Math.round(totalIncome * 1.5);

    setEligibility({ eligible, maxAmount, score });
  };

  const saveLoanApplication = async () => {
    if (!user || !emi) return;
    setSaving(true);
    const { error } = await supabase.from("loans").insert({
      user_id: user.id,
      bank_name: "Custom Calculation",
      amount: parseFloat(loanAmount) || 0,
      interest_rate: parseFloat(interestRate) || 0,
      tenure_months: parseInt(tenure) || 0,
      emi: emi.monthly,
      status: "draft",
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Loan calculation saved!");
      const { data } = await supabase.from("loans").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setSavedLoans(data);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" /> Loan Assistance
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Check eligibility, compare plans, calculate EMIs, and track your loan applications.
        </p>
      </div>

      <Tabs defaultValue="eligibility" className="space-y-4">
        <TabsList className="grid grid-cols-5 max-w-2xl">
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="emi">EMI Calc</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
          <TabsTrigger value="saved">My Loans</TabsTrigger>
        </TabsList>

        {/* Eligibility Tab */}
        <TabsContent value="eligibility" className="space-y-4">
          <Card className="p-6 shadow-card max-w-2xl">
            <h2 className="font-semibold mb-4">Check Loan Eligibility</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Annual Family Income (₹)</Label>
                <Input type="number" placeholder="800000" value={income} onChange={(e) => setIncome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Co-applicant Income (₹)</Label>
                <Input type="number" placeholder="400000" value={coIncome} onChange={(e) => setCoIncome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Credit Score (optional)</Label>
                <Input type="number" placeholder="750" value={creditScore} onChange={(e) => setCreditScore(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Collateral Available</Label>
                <Select value={collateral} onValueChange={setCollateral}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="mt-6 gradient-primary border-0 text-primary-foreground" onClick={checkEligibility} disabled={!income}>
              Check Eligibility
            </Button>
          </Card>

          {eligibility && (
            <Card className={`p-6 shadow-elevated border-l-4 max-w-2xl ${eligibility.eligible ? "border-l-success" : "border-l-warning"}`}>
              <div className="flex items-center gap-3 mb-3">
                {eligibility.eligible ? <CheckCircle className="h-6 w-6 text-success" /> : <Circle className="h-6 w-6 text-warning" />}
                <h3 className="text-lg font-semibold">{eligibility.eligible ? "You're Eligible! ✅" : "Conditionally Eligible ⚠️"}</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Eligibility Score: <strong className="text-foreground">{eligibility.score}/100</strong></p>
                <p>Maximum Estimated Loan: <strong className="text-foreground">₹{(eligibility.maxAmount / 100000).toFixed(1)}L</strong></p>
                {!eligibility.eligible && (
                  <p className="text-warning">Tip: Adding a co-applicant with income or providing collateral can improve your eligibility.</p>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* EMI Calculator Tab */}
        <TabsContent value="emi" className="space-y-4">
          <Card className="p-6 shadow-card max-w-2xl">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" /> EMI Calculator
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Loan Amount (₹)</Label>
                <Input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Interest Rate (%)</Label>
                <Input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tenure (months)</Label>
                <Input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button className="gradient-primary border-0 text-primary-foreground" onClick={calcEMI}>
                Calculate EMI
              </Button>
              {emi && user && (
                <Button variant="outline" onClick={saveLoanApplication} disabled={saving}>
                  {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                  Save to My Loans
                </Button>
              )}
            </div>
          </Card>

          {emi && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {[
                { label: "Monthly EMI", value: `₹${emi.monthly.toLocaleString()}` },
                { label: "Total Payment", value: `₹${emi.total.toLocaleString()}` },
                { label: "Total Interest", value: `₹${emi.interest.toLocaleString()}` },
              ].map((item) => (
                <Card key={item.label} className="p-5 shadow-card text-center">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold mt-1">{item.value}</p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Loan Plans Tab */}
        <TabsContent value="plans">
          <div className="grid gap-4 max-w-3xl">
            {loanPlans.map((plan) => (
              <Card key={plan.bank} className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{plan.bank}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Rate: <strong className="text-foreground">{plan.rateStr}</strong></span>
                      <span>Max: <strong className="text-foreground">{plan.max}</strong></span>
                      <span>Collateral: {plan.collateral}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    setInterestRate(String(plan.rate));
                    toast.info(`Applied ${plan.bank} rate to EMI calculator`);
                  }}>
                    Use Rate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Document Checklist Tab */}
        <TabsContent value="docs">
          <Card className="p-6 shadow-card max-w-2xl">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FileCheck className="h-5 w-5" /> Document Checklist
            </h2>
            <div className="space-y-3">
              {documents.map((doc) => (
                <label key={doc.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedDocs.has(doc.name)}
                    onChange={() => {
                      const next = new Set(checkedDocs);
                      next.has(doc.name) ? next.delete(doc.name) : next.add(doc.name);
                      setCheckedDocs(next);
                    }}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className={`text-sm flex-1 ${checkedDocs.has(doc.name) ? "line-through text-muted-foreground" : ""}`}>
                    {doc.name}
                  </span>
                  {doc.required && <span className="text-[10px] font-medium text-destructive">Required</span>}
                </label>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-medium">{checkedDocs.size}/{documents.length}</span>
              </div>
              <Progress value={(checkedDocs.size / documents.length) * 100} className="h-2" />
            </div>
          </Card>
        </TabsContent>

        {/* Saved Loans Tab */}
        <TabsContent value="saved">
          <div className="space-y-4 max-w-3xl">
            {savedLoans.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground shadow-card">
                <Banknote className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No saved loan calculations yet. Use the EMI Calculator and save your results.</p>
              </Card>
            ) : (
              savedLoans.map((loan) => (
                <Card key={loan.id} className="p-5 shadow-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{loan.bank_name}</h3>
                      <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Amount: <strong className="text-foreground">₹{Number(loan.amount).toLocaleString()}</strong></span>
                        <span>Rate: <strong className="text-foreground">{loan.interest_rate}%</strong></span>
                        <span>EMI: <strong className="text-foreground">₹{loan.emi?.toLocaleString() || "N/A"}</strong></span>
                        <span>Tenure: {loan.tenure_months}mo</span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      loan.status === "approved" ? "bg-success/10 text-success" : loan.status === "submitted" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoanAssistance;
