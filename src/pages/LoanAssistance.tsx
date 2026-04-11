import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, Calculator, FileCheck, CheckCircle, Circle, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const loanPlans = [
  { bank: "SBI Scholar Loan", rate: "8.5%", max: "₹1.5 Cr", collateral: "Required > ₹7.5L", processing: "₹10,000" },
  { bank: "HDFC Credila", rate: "9.5%", max: "₹45L", collateral: "Flexible", processing: "₹5,000" },
  { bank: "Prodigy Finance", rate: "7.5-11%", max: "$100K", collateral: "Not Required", processing: "None" },
  { bank: "MPOWER Finance", rate: "7.9-14%", max: "$100K", collateral: "Not Required", processing: "None" },
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
  const [emi, setEmi] = useState<null | { monthly: number; total: number; interest: number }>(null);
  const [eligibility, setEligibility] = useState<null | { eligible: boolean; amount: number; score: number }>(null);
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());

  const calcEMI = () => {
    const P = 2000000;
    const r = 9 / 12 / 100;
    const n = 60;
    const emiVal = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi({ monthly: Math.round(emiVal), total: Math.round(emiVal * n), interest: Math.round(emiVal * n - P) });
  };

  const checkEligibility = () => {
    const score = Math.floor(Math.random() * 30) + 65;
    setEligibility({ eligible: score >= 70, amount: score >= 70 ? 2500000 : 1000000, score });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" /> Loan Assistance
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Check eligibility, compare plans, and calculate EMIs.
        </p>
      </div>

      <Tabs defaultValue="eligibility" className="space-y-4">
        <TabsList className="grid grid-cols-4 max-w-lg">
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="emi">EMI Calc</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="eligibility" className="space-y-4">
          <Card className="p-6 shadow-card max-w-2xl">
            <h2 className="font-semibold mb-4">Check Loan Eligibility</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Annual Family Income</Label><Input type="number" placeholder="800000" /></div>
              <div className="space-y-2"><Label>Loan Amount Required</Label><Input type="number" placeholder="2000000" /></div>
              <div className="space-y-2"><Label>Collateral Available</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Co-applicant</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <Button className="mt-6 gradient-primary border-0 text-primary-foreground" onClick={checkEligibility}>
              Check Eligibility
            </Button>
          </Card>

          {eligibility && (
            <Card className={`p-6 shadow-elevated border-l-4 max-w-2xl ${eligibility.eligible ? "border-l-success" : "border-l-warning"}`}>
              <div className="flex items-center gap-3 mb-3">
                {eligibility.eligible ? <CheckCircle className="h-6 w-6 text-success" /> : <Circle className="h-6 w-6 text-warning" />}
                <h3 className="text-lg font-semibold">{eligibility.eligible ? "You're Eligible!" : "Conditionally Eligible"}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Eligibility Score: <strong>{eligibility.score}/100</strong> • Max Loan: <strong>₹{(eligibility.amount / 100000).toFixed(1)}L</strong>
              </p>
              <Button className="mt-4" variant="outline" size="sm">
                Apply Now <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="emi" className="space-y-4">
          <Card className="p-6 shadow-card max-w-2xl">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" /> EMI Calculator
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Loan Amount (₹)</Label><Input type="number" placeholder="2000000" /></div>
              <div className="space-y-2"><Label>Interest Rate (%)</Label><Input type="number" placeholder="9" step="0.1" /></div>
              <div className="space-y-2"><Label>Tenure (months)</Label><Input type="number" placeholder="60" /></div>
            </div>
            <Button className="mt-6 gradient-primary border-0 text-primary-foreground" onClick={calcEMI}>
              Calculate EMI
            </Button>
          </Card>

          {emi && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              {[
                { label: "Monthly EMI", value: `₹${emi.monthly.toLocaleString()}`, color: "gradient-primary" },
                { label: "Total Payment", value: `₹${emi.total.toLocaleString()}`, color: "gradient-accent" },
                { label: "Total Interest", value: `₹${emi.interest.toLocaleString()}`, color: "gradient-warm" },
              ].map((item) => (
                <Card key={item.label} className="p-5 shadow-card text-center">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold mt-1">{item.value}</p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid gap-4 max-w-3xl">
            {loanPlans.map((plan) => (
              <Card key={plan.bank} className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{plan.bank}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Rate: <strong className="text-foreground">{plan.rate}</strong></span>
                      <span>Max: <strong className="text-foreground">{plan.max}</strong></span>
                      <span>Collateral: {plan.collateral}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Compare</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

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
      </Tabs>
    </div>
  );
};

export default LoanAssistance;
