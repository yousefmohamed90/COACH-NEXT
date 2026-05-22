"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, User, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SocialLinks = {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
  facebook?: string;
};

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/yourhandle" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/9665xxxxxxxx" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
];

export default function CoachProfile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [bio, setBio] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        setBio(data.bio || "");
        setWelcomeMessage(data.welcomeMessage || "");
        if (data.socialLinks) {
          try {
            setSocialLinks(typeof data.socialLinks === "string" ? JSON.parse(data.socialLinks) : data.socialLinks);
          } catch {
            setSocialLinks({});
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function updateSocial(key: keyof SocialLinks, value: string) {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, welcomeMessage, socialLinks }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast({ title: "Profile updated", description: "Your coach site has been updated" });
    } catch {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted" />
          <div className="h-4 w-64 bg-muted" />
          <div className="h-64 w-full bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Coach Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your public coach site that clients see</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-2">
            <User className="h-3.5 w-3.5" />Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
            <p className="font-medium mt-1">{user?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
            <p className="font-medium mt-1">{user?.email ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-2">
            <User className="h-3.5 w-3.5" />Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold">Welcome Message</label>
            <Input
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Start Your Transformation"
            />
            <p className="text-xs text-muted-foreground">Shown as the headline on your coach site</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold">About Me / Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell potential clients about yourself, your coaching philosophy, certifications, and experience..."
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5" />Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider font-semibold">{label}</label>
                <Input
                  value={socialLinks[key] || ""}
                  onChange={(e) => updateSocial(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
