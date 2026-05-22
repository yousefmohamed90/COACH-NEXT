"use client";
import { useState, useEffect } from "react";
import { useListSubscriptions, useUpdateSubscription, useDeleteSubscription, getListSubscriptionsQueryKey } from "@trainova/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, CreditCard, Trash2, Check, X, Clock, Pencil, Copy, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

// ── Types ──────────────────────────────────────────────────────────────────
type CoachPlan = {
  id: number; coachId: number; name: string; description?: string | null;
  durationMonths: number; price: number; currency: string; isActive: boolean; createdAt: string;
};

type SubRequest = {
  id: number; name: string; email: string; phone: string;
  package: string; paymentMethod: string; status: string; createdAt: string;
};

// ── Hooks ──────────────────────────────────────────────────────────────────
function usePlans() {
  const [data, setData] = useState<CoachPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = async () => {
    try {
      const r = await fetch("/api/plans", { credentials: "include" });
      if (r.ok) setData(await r.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { refetch(); }, []);
  return { data, loading, refetch };
}

function useRequests() {
  const [data, setData] = useState<SubRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = async () => {
    try {
      const r = await fetch("/api/subscription-requests", { credentials: "include" });
      if (r.ok) setData(await r.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { refetch(); }, []);
  return { data, loading, refetch };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function durationLabel(months: number) {
  if (months === 1) return "1 Month";
  if (months === 3) return "3 Months";
  if (months === 12) return "1 Year";
  return `${months} Month${months !== 1 ? "s" : ""}`;
}

const paymentMap: Record<string, string> = {
  bank_transfer: "Bank Transfer", card: "Card", cash: "Cash", paypal: "PayPal", crypto: "Crypto",
};

// ── Plan schema ────────────────────────────────────────────────────────────
const planSchema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  durationMonths: z.coerce.number().min(1, "Must be at least 1 month"),
  price: z.coerce.number().min(0, "Price required"),
  currency: z.string().default("USD"),
});

// ── Plan Form Dialog ───────────────────────────────────────────────────────
function PlanDialog({ existing, onSaved }: { existing?: CoachPlan | null; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: existing
      ? { name: existing.name, description: existing.description ?? "", durationMonths: existing.durationMonths, price: existing.price, currency: existing.currency }
      : { name: "", description: "", durationMonths: 1, price: 0, currency: "USD" },
  });

  async function onSubmit(values: z.infer<typeof planSchema>) {
    setSaving(true);
    const url = existing ? `/api/plans/${existing.id}` : "/api/plans";
    const method = existing ? "PATCH" : "POST";
    const res = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    setSaving(false);
    if (res.ok) { toast({ title: existing ? "Plan updated" : "Plan created" }); setOpen(false); onSaved(); }
    else toast({ title: "Error saving plan", variant: "destructive" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existing ? (
          <button className="text-muted-foreground hover:text-foreground p-1"><Pencil className="h-3.5 w-3.5" /></button>
        ) : (
          <Button size="sm"><Plus className="h-4 w-4 mr-2" />New Plan</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{existing ? "Edit Plan" : "Create Subscription Plan"}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider">Plan Name *</FormLabel>
                <FormControl><Input placeholder="e.g. Monthly Coaching" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider">Description</FormLabel>
                <FormControl><Input placeholder="What's included..." {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="durationMonths" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider">Duration (months) *</FormLabel>
                  <FormControl><Input type="number" min="1" placeholder="e.g. 3" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider">Price *</FormLabel>
                  <FormControl><Input type="number" step="0.01" min="0" placeholder="0.00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider">Currency</FormLabel>
                  <FormControl><Input placeholder="e.g. USD" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : (existing ? "Save Changes" : "Create Plan")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Subscriptions() {
  const queryClient = useQueryClient();
  const { data: subs, isLoading } = useListSubscriptions();
  const updateSub = useUpdateSubscription();
  const deleteSub = useDeleteSubscription();
  const { toast } = useToast();
  const plans = usePlans();
  const requests = useRequests();
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});
  const [credentials, setCredentials] = useState<Record<number, { email: string; password: string }>>({});

  async function deletePlan(id: number) {
    await fetch(`/api/plans/${id}`, { method: "DELETE", credentials: "include" });
    plans.refetch();
    toast({ title: "Plan deleted" });
  }

  async function togglePlan(plan: CoachPlan) {
    await fetch(`/api/plans/${plan.id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !plan.isActive }),
    });
    plans.refetch();
  }

  async function updateRequestStatus(id: number, status: "approved" | "rejected") {
    const res = await fetch(`/api/subscription-requests/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    requests.refetch();
    if (status === "approved") {
      const data = await res.json();
      if (data.credentials) {
        setCredentials(prev => ({ ...prev, [id]: data.credentials }));
        setShowPassword(prev => ({ ...prev, [id]: false }));
        toast({ title: "Client account created", description: "Credentials ready — copy them below" });
        return;
      }
    }
    toast({ title: status === "approved" ? "Request approved" : "Request rejected" });
  }

  async function deleteRequest(id: number) {
    await fetch(`/api/subscription-requests/${id}`, { method: "DELETE", credentials: "include" });
    requests.refetch();
  }

  const activeSubs = subs?.filter(s => s.status === "active") ?? [];
  const monthlyRevenue = activeSubs.reduce((sum, s) => sum + s.priceMonthly, 0);
  const pendingCount = requests.data.filter(r => r.status === "pending").length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plans and client requests</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{activeSubs.length}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">${monthlyRevenue.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Monthly Revenue</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Pending Requests</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">My Plans</TabsTrigger>
          <TabsTrigger value="active">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {pendingCount > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs w-4 h-4 inline-flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Plans tab */}
        <TabsContent value="plans">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-muted-foreground">Define the plans clients see on your signup form</p>
            <PlanDialog onSaved={plans.refetch} />
          </div>
          {plans.loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : plans.data.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No plans yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first plan — clients will see them on your signup form</p>
            </CardContent></Card>
          ) : (
            <div className="divide-y divide-border border border-border">
              {plans.data.map(plan => (
                <div key={plan.id} className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{plan.name}</p>
                      <Badge variant={plan.isActive ? "default" : "outline"} className="text-xs">
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {plan.description && <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {durationLabel(plan.durationMonths)} · {plan.currency} {plan.price.toFixed(0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => togglePlan(plan)}>
                      {plan.isActive ? "Disable" : "Enable"}
                    </Button>
                    <PlanDialog existing={plan} onSaved={plans.refetch} />
                    <button onClick={() => deletePlan(plan.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Active subscriptions tab */}
        <TabsContent value="active">
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : subs?.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No active subscriptions yet</p>
            </CardContent></Card>
          ) : (
            <div className="divide-y divide-border border border-border">
              {subs?.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm">{sub.plan}</p>
                    <p className="text-xs text-muted-foreground">
                      Client {sub.clientId} · Since {format(new Date(sub.startDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">${sub.priceMonthly}/mo</span>
                    <Select
                      defaultValue={sub.status}
                      onValueChange={(status) => {
                        updateSub.mutate({ id: sub.id, data: { status } }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSubscriptionsQueryKey() }),
                        });
                      }}
                    >
                      <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => deleteSub.mutate({ id: sub.id }, {
                        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSubscriptionsQueryKey() })
                      })}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests tab */}
        <TabsContent value="requests">
          {requests.loading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : requests.data.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No subscription requests yet</p>
              <p className="text-xs text-muted-foreground mt-1">Share your /subscribe link with potential clients</p>
            </CardContent></Card>
          ) : (
            <div className="divide-y divide-border border border-border">
              {requests.data.map(req => (
                <div key={req.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{req.name}</p>
                        <Badge
                          variant={req.status === "pending" ? "outline" : req.status === "approved" ? "default" : "destructive"}
                          className="text-xs capitalize"
                        >
                          {req.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {req.status === "approved" && <Check className="h-3 w-3 mr-1" />}
                          {req.status === "rejected" && <X className="h-3 w-3 mr-1" />}
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{req.email} · {req.phone}</p>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Package</p>
                          <p className="text-xs font-medium mt-0.5">{req.package.includes("|") ? req.package.split("|")[0] : req.package}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment</p>
                          <p className="text-xs font-medium mt-0.5">{paymentMap[req.paymentMethod] ?? req.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Submitted</p>
                          <p className="text-xs font-medium mt-0.5">{format(new Date(req.createdAt), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      {credentials[req.id] && (
                        <div className="mt-3 p-3 border border-primary/30 bg-primary/5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Client Login Credentials</p>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Email:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{credentials[req.id].email}</span>
                                <button onClick={() => { navigator.clipboard.writeText(credentials[req.id].email); toast({ title: "Copied!" }); }} className="text-muted-foreground hover:text-foreground">
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Password:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">
                                  {showPassword[req.id] ? credentials[req.id].password : "••••••••"}
                                </span>
                                <button onClick={() => setShowPassword(prev => ({ ...prev, [req.id]: !prev[req.id] }))} className="text-muted-foreground hover:text-foreground">
                                  {showPassword[req.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                                <button onClick={() => { navigator.clipboard.writeText(credentials[req.id].password); toast({ title: "Copied!" }); }} className="text-muted-foreground hover:text-foreground">
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Share these credentials with the client to log in at /client/login</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => updateRequestStatus(req.id, "approved")}>
                            <Check className="h-3.5 w-3.5 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateRequestStatus(req.id, "rejected")}>
                            <X className="h-3.5 w-3.5 mr-1" />Reject
                          </Button>
                        </>
                      )}
                      <button onClick={() => deleteRequest(req.id)} className="text-muted-foreground hover:text-destructive p-1 ml-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
