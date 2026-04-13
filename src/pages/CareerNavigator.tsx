import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, MapPin, DollarSign, BookOpen, Sparkles, GraduationCap, Users, Globe, Award, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type University = Tables<"universities">;

const countryFlags: Record<string, string> = {
  "USA": "🇺🇸", "UK": "🇬🇧", "Canada": "🇨🇦", "Germany": "🇩🇪", "Australia": "🇦🇺",
  "France": "🇫🇷", "Japan": "🇯🇵", "Singapore": "🇸🇬", "Netherlands": "🇳🇱", "Sweden": "🇸🇪",
};

const CareerNavigator = () => {
  const [showResults, setShowResults] = useState(false);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [results, setResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [field, setField] = useState("");
  const [country, setCountry] = useState("");
  const [gpa, setGpa] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setShowResults(true);

    let query = supabase.from("universities").select("*");

    if (country && country !== "any") {
      query = query.ilike("country", country);
    }
    if (budget) {
      query = query.lte("tuition_min", Number(budget));
    }

    const { data, error } = await query.order("ranking", { ascending: true, nullsFirst: false });

    if (!error && data) {
      // Filter by field/course if selected
      let filtered = data;
      if (field) {
        filtered = data.filter((u) =>
          u.courses?.some((c) => c.toLowerCase().includes(field.toLowerCase())) || true
        );
      }
      setResults(filtered);
    }
    setLoading(false);
  };

  const getReqs = (uni: University) => {
    const r = uni.requirements as Record<string, any> | null;
    if (!r) return [];
    const items: string[] = [];
    if (r.min_gpa) items.push(`GPA: ${r.min_gpa}+`);
    if (r.ielts) items.push(`IELTS: ${r.ielts}+`);
    if (r.toefl) items.push(`TOEFL: ${r.toefl}+`);
    if (r.gre) items.push(`GRE: ${r.gre}+`);
    if (r.extras) items.push(...(Array.isArray(r.extras) ? r.extras : [r.extras]));
    return items;
  };

  const formatTuition = (uni: University) => {
    if (uni.tuition_min && uni.tuition_max) return `$${(uni.tuition_min / 1000).toFixed(0)}k–$${(uni.tuition_max / 1000).toFixed(0)}k/yr`;
    if (uni.tuition_min) return `$${(uni.tuition_min / 1000).toFixed(0)}k/yr`;
    return "N/A";
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" /> AI Career Navigator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search universities from our database and get personalized recommendations.
        </p>
      </div>

      <Card className="p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Field of Interest</Label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="computer science">Computer Science</SelectItem>
                <SelectItem value="business">Business/MBA</SelectItem>
                <SelectItem value="data science">Data Science</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue placeholder="Any country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Country</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Current GPA (out of 4.0)</Label>
            <Input type="number" placeholder="3.5" step="0.1" min="0" max="4" value={gpa} onChange={(e) => setGpa(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Annual Budget (USD)</Label>
            <Input type="number" placeholder="50000" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
        </div>
        <Button className="mt-6 gradient-primary border-0 text-primary-foreground" onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Get AI Recommendations
        </Button>
      </Card>

      {showResults && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">🎯 Top Recommendations ({results.length} found)</h2>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : results.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No universities found matching your criteria. Try broadening your search.</Card>
          ) : (
            <div className="grid gap-4">
              {results.map((r) => (
                <Card key={r.id} className="p-5 shadow-card hover:shadow-elevated transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-3xl">{countryFlags[r.country] || "🏫"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{r.name}</h3>
                        {r.ranking && <Badge variant="secondary" className="text-xs">#{r.ranking}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{r.courses?.slice(0, 2).join(", ") || "Multiple programs"}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.city}, {r.country}</span>
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatTuition(r)}</span>
                        {r.acceptance_rate && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.acceptance_rate}% acceptance</span>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedUni(r)}>
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* University Details Dialog */}
      <Dialog open={!!selectedUni} onOpenChange={() => setSelectedUni(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedUni && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{countryFlags[selectedUni.country] || "🏫"}</span>
                  <div>
                    <DialogTitle className="text-xl">{selectedUni.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUni.city}, {selectedUni.country}</p>
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedUni.description || "No description available."}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "World Ranking", value: selectedUni.ranking ? `#${selectedUni.ranking}` : "N/A", icon: Award },
                      { label: "Acceptance Rate", value: selectedUni.acceptance_rate ? `${selectedUni.acceptance_rate}%` : "N/A", icon: Users },
                      { label: "Programs", value: `${selectedUni.courses?.length || 0}`, icon: BookOpen },
                      { label: "Country", value: selectedUni.country, icon: Globe },
                    ].map((stat) => (
                      <Card key={stat.label} className="p-3 text-center">
                        <stat.icon className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </Card>
                    ))}
                  </div>

                  {selectedUni.courses && selectedUni.courses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Available Programs</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUni.courses.map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUni.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedUni.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3 w-3" /> Visit Website
                      </a>
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4 mt-4">
                  <h4 className="text-sm font-semibold">Admission Requirements</h4>
                  {getReqs(selectedUni).length > 0 ? (
                    <div className="space-y-2">
                      {getReqs(selectedUni).map((req) => (
                        <div key={req} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                          <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                          {req}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific requirements listed.</p>
                  )}
                </TabsContent>

                <TabsContent value="finances" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {[
                      { label: "Tuition Range", value: formatTuition(selectedUni) },
                      { label: "Acceptance Rate", value: selectedUni.acceptance_rate ? `${selectedUni.acceptance_rate}%` : "N/A" },
                      { label: "World Ranking", value: selectedUni.ranking ? `#${selectedUni.ranking}` : "N/A" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <span className="text-sm">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="/roi"><ExternalLink className="mr-2 h-3 w-3" /> Calculate Full ROI</a>
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
