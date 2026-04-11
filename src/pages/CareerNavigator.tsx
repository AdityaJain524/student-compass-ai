import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Compass, MapPin, DollarSign, BookOpen, Sparkles } from "lucide-react";

const mockResults = [
  { country: "USA", university: "MIT", course: "MS Computer Science", match: 95, tuition: "$55,000/yr", flag: "🇺🇸" },
  { country: "UK", university: "Oxford", course: "MS Data Science", match: 88, tuition: "£32,000/yr", flag: "🇬🇧" },
  { country: "Canada", university: "UofT", course: "MS AI", match: 85, tuition: "CAD 45,000/yr", flag: "🇨🇦" },
  { country: "Germany", university: "TU Munich", course: "MS Informatics", match: 82, tuition: "€3,000/yr", flag: "🇩🇪" },
  { country: "Australia", university: "UNSW", course: "MS IT", match: 78, tuition: "AUD 42,000/yr", flag: "🇦🇺" },
];

const CareerNavigator = () => {
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" /> AI Career Navigator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tell us about yourself and get personalized university & course recommendations.
        </p>
      </div>

      <Card className="p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Field of Interest</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="business">Business/MBA</SelectItem>
                <SelectItem value="data">Data Science</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred Country</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Any country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Country</SelectItem>
                <SelectItem value="usa">USA</SelectItem>
                <SelectItem value="uk">UK</SelectItem>
                <SelectItem value="canada">Canada</SelectItem>
                <SelectItem value="germany">Germany</SelectItem>
                <SelectItem value="australia">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Current GPA (out of 4.0)</Label>
            <Input type="number" placeholder="3.5" step="0.1" min="0" max="4" />
          </div>
          <div className="space-y-2">
            <Label>Annual Budget (USD)</Label>
            <Input type="number" placeholder="50000" />
          </div>
        </div>
        <Button className="mt-6 gradient-primary border-0 text-primary-foreground" onClick={() => setShowResults(true)}>
          <Sparkles className="mr-2 h-4 w-4" /> Get AI Recommendations
        </Button>
      </Card>

      {showResults && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">🎯 Top Recommendations</h2>
          <div className="grid gap-4">
            {mockResults.map((r) => (
              <Card key={r.university} className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-3xl">{r.flag}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{r.university}</h3>
                      <Badge variant="secondary" className="text-xs">{r.match}% match</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{r.course}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.country}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{r.tuition}</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />2 years</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerNavigator;
