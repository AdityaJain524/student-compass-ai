import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, TrendingUp, Home, GraduationCap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const ROICalculator = () => {
  const [result, setResult] = useState<null | {
    tuition: number; living: number; total: number; salary: number; roi: number;
    breakeven: number; chartData: { name: string; value: number }[];
  }>(null);

  const calculate = () => {
    const tuition = 55000;
    const living = 18000;
    const years = 2;
    const total = (tuition + living) * years;
    const salary = 120000;
    const roi = ((salary - total / 5) / total) * 100;
    const breakeven = Math.ceil(total / salary);

    setResult({
      tuition, living, total, salary, roi: Math.round(roi), breakeven,
      chartData: [
        { name: "Tuition", value: tuition * years },
        { name: "Living", value: living * years },
        { name: "1st Year Salary", value: salary },
        { name: "5-Year Earnings", value: salary * 5 },
      ],
    });
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
            <Select>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="usa">USA</SelectItem>
                <SelectItem value="uk">UK</SelectItem>
                <SelectItem value="canada">Canada</SelectItem>
                <SelectItem value="australia">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Course Duration (years)</Label>
            <Input type="number" placeholder="2" />
          </div>
          <div className="space-y-2">
            <Label>Annual Tuition (USD)</Label>
            <Input type="number" placeholder="55000" />
          </div>
          <div className="space-y-2">
            <Label>Monthly Living Budget (USD)</Label>
            <Input type="number" placeholder="1500" />
          </div>
        </div>
        <Button className="mt-6 gradient-primary border-0 text-primary-foreground" onClick={calculate}>
          <TrendingUp className="mr-2 h-4 w-4" /> Calculate ROI
        </Button>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-6 shadow-card space-y-4">
            <h2 className="font-semibold">Cost Breakdown</h2>
            {[
              { label: "Total Tuition", value: result.tuition * 2, icon: GraduationCap, color: "text-primary" },
              { label: "Total Living Expenses", value: result.living * 2, icon: Home, color: "text-warning" },
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
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm">Expected Annual Salary</span>
                <span className="font-bold text-success">${result.salary.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">ROI (5 years)</span>
                <span className="font-bold text-primary">{result.roi}%</span>
              </div>
              <div className="flex items-center justify-between mt-2">
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
                <Bar dataKey="value" fill="hsl(230, 80%, 56%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ROICalculator;
