import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, MapPin, DollarSign, BookOpen, Sparkles, X, GraduationCap, Users, Globe, Award, ExternalLink } from "lucide-react";

interface UniversityResult {
  id: string;
  country: string;
  university: string;
  course: string;
  match: number;
  tuition: string;
  flag: string;
  ranking: number;
  acceptance: string;
  duration: string;
  livingCost: string;
  avgSalary: string;
  description: string;
  highlights: string[];
  requirements: string[];
}

const mockResults: UniversityResult[] = [
  {
    id: "mit",
    country: "USA",
    university: "Massachusetts Institute of Technology",
    course: "MS Computer Science",
    match: 95,
    tuition: "$55,000/yr",
    flag: "🇺🇸",
    ranking: 1,
    acceptance: "3.5%",
    duration: "2 years",
    livingCost: "$2,500/mo",
    avgSalary: "$135,000/yr",
    description: "MIT's EECS department is consistently ranked #1 globally. The program offers unparalleled research opportunities in AI, systems, and theory with access to world-class labs like CSAIL.",
    highlights: ["#1 CS Program Globally", "CSAIL Research Lab", "Strong Industry Connections", "Optional Thesis Track"],
    requirements: ["GPA: 3.8+", "GRE: 330+", "TOEFL: 100+", "Research experience preferred"],
  },
  {
    id: "oxford",
    country: "UK",
    university: "University of Oxford",
    course: "MS Data Science",
    match: 88,
    tuition: "£32,000/yr",
    flag: "🇬🇧",
    ranking: 3,
    acceptance: "8%",
    duration: "1 year",
    livingCost: "£1,400/mo",
    avgSalary: "£65,000/yr",
    description: "Oxford's MSc in Data Science combines statistics, machine learning, and computer science. The intensive 1-year program includes a dissertation and access to Oxford's renowned research network.",
    highlights: ["1-Year Intensive Program", "Tutorial-Based Learning", "Oxford Research Network", "City of Dreaming Spires"],
    requirements: ["GPA: 3.7+", "IELTS: 7.5+", "Strong math background", "Programming proficiency"],
  },
  {
    id: "uoft",
    country: "Canada",
    university: "University of Toronto",
    course: "MS Artificial Intelligence",
    match: 85,
    tuition: "CAD 45,000/yr",
    flag: "🇨🇦",
    ranking: 10,
    acceptance: "12%",
    duration: "2 years",
    livingCost: "CAD 1,800/mo",
    avgSalary: "CAD 95,000/yr",
    description: "UofT is home to the Vector Institute, a global leader in AI research. The program offers deep learning, NLP, and robotics specializations with industry partnerships.",
    highlights: ["Vector Institute Partnership", "Pioneer of Deep Learning", "Post-Graduation Work Permit", "Multicultural City"],
    requirements: ["GPA: 3.5+", "GRE: 315+", "IELTS: 7.0+", "CS background required"],
  },
  {
    id: "tum",
    country: "Germany",
    university: "Technical University of Munich",
    course: "MS Informatics",
    match: 82,
    tuition: "€3,000/yr",
    flag: "🇩🇪",
    ranking: 15,
    acceptance: "20%",
    duration: "2 years",
    livingCost: "€1,000/mo",
    avgSalary: "€60,000/yr",
    description: "TU Munich offers world-class education at minimal tuition fees. The Informatics program covers software engineering, AI, and data science with strong industry ties to BMW, Siemens, and SAP.",
    highlights: ["Near-Free Tuition", "Strong Industry Ties", "Research Excellence", "Heart of Europe"],
    requirements: ["GPA: 3.3+", "IELTS: 6.5+ or German B2", "CS prerequisites", "Motivation letter"],
  },
  {
    id: "unsw",
    country: "Australia",
    university: "University of New South Wales",
    course: "MS Information Technology",
    match: 78,
    tuition: "AUD 42,000/yr",
    flag: "🇦🇺",
    ranking: 25,
    acceptance: "30%",
    duration: "2 years",
    livingCost: "AUD 2,000/mo",
    avgSalary: "AUD 85,000/yr",
    description: "UNSW Sydney offers a flexible IT program with specializations in AI, cybersecurity, and data science. Students benefit from co-op programs and Sydney's thriving tech ecosystem.",
    highlights: ["Co-op Work Program", "Sydney Tech Hub", "Post-Study Work Visa (2-4 yrs)", "Diverse Campus"],
    requirements: ["GPA: 3.0+", "IELTS: 6.5+", "Any bachelor's degree", "Statement of purpose"],
  },
];

const CareerNavigator = () => {
  const [showResults, setShowResults] = useState(false);
  const [selectedUni, setSelectedUni] = useState<UniversityResult | null>(null);

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
              <Card key={r.id} className="p-5 shadow-card hover:shadow-elevated transition-shadow">
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
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{r.duration}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedUni(r)}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* University Details Dialog */}
      <Dialog open={!!selectedUni} onOpenChange={() => setSelectedUni(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedUni && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedUni.flag}</span>
                  <div>
                    <DialogTitle className="text-xl">{selectedUni.university}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUni.course}</p>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="finances">Finances</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedUni.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "World Ranking", value: `#${selectedUni.ranking}`, icon: Award },
                      { label: "Acceptance Rate", value: selectedUni.acceptance, icon: Users },
                      { label: "Duration", value: selectedUni.duration, icon: BookOpen },
                      { label: "Country", value: selectedUni.country, icon: Globe },
                    ].map((stat) => (
                      <Card key={stat.label} className="p-3 text-center">
                        <stat.icon className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </Card>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUni.highlights.map((h) => (
                        <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4 mt-4">
                  <h4 className="text-sm font-semibold">Admission Requirements</h4>
                  <div className="space-y-2">
                    {selectedUni.requirements.map((req) => (
                      <div key={req} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                        <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                        {req}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full gradient-primary border-0 text-primary-foreground mt-4" size="sm">
                    Check My Admission Chances
                  </Button>
                </TabsContent>

                <TabsContent value="finances" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {[
                      { label: "Annual Tuition", value: selectedUni.tuition },
                      { label: "Monthly Living Cost", value: selectedUni.livingCost },
                      { label: "Average Salary After Graduation", value: selectedUni.avgSalary },
                      { label: "Match Score", value: `${selectedUni.match}%` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <span className="text-sm">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="mr-2 h-3 w-3" /> Calculate Full ROI
                  </Button>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareerNavigator;
