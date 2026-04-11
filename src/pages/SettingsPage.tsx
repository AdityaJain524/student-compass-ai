import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const SettingsPage = () => (
  <div className="space-y-6 max-w-2xl">
    <h1 className="text-2xl font-bold flex items-center gap-2">
      <SettingsIcon className="h-6 w-6 text-primary" /> Settings
    </h1>
    <Card className="p-6 shadow-card">
      <p className="text-muted-foreground text-sm">Settings page coming soon. Connect Lovable Cloud to enable authentication and profile management.</p>
    </Card>
  </div>
);

export default SettingsPage;
