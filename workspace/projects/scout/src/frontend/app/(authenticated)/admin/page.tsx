"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  getAdminSources, getAdminUsers, getSystemHealth,
  updateSource, updateUser, inviteUser, testSource,
  Source, AdminUser,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { isAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

type Tab = "sources" | "users" | "health";

export default function AdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("sources");
  const [sources, setSources] = useState<Source[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [health, setHealth] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviting, setInviting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");

  const token = (session as any)?.accessToken;
  const admin = isAdmin(session);

  useEffect(() => {
    if (session && !admin) {
      // Not an admin — redirect
      window.location.href = "/feed";
    }
  }, [session, admin]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "sources") {
        const data = await getAdminSources(token);
        setSources(data);
      } else if (activeTab === "users") {
        const data = await getAdminUsers(token);
        setUsers(data);
      } else if (activeTab === "health") {
        const data = await getSystemHealth(token);
        setHealth(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleSource(source: Source) {
    try {
      await updateSource(source.id, { enabled: !source.enabled }, token);
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, enabled: !s.enabled } : s))
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleTestSource(sourceId: string) {
    try {
      await testSource(sourceId, token);
      // Brief confirmation
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleToggleBrief(user: AdminUser) {
    try {
      await updateUser(user.id, { receive_brief: !user.receive_brief }, token);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, receive_brief: !u.receive_brief } : u))
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleRoleChange(user: AdminUser, role: string) {
    try {
      await updateUser(user.id, { role }, token);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role } : u))
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setInviteStatus("");
    try {
      await inviteUser(inviteEmail, inviteRole, token);
      setInviteStatus("Invite sent successfully");
      setInviteEmail("");
      const data = await getAdminUsers(token);
      setUsers(data);
    } catch (err: any) {
      setInviteStatus(`Error: ${err.message}`);
    } finally {
      setInviting(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "sources", label: "Sources" },
    { id: "users", label: "Users" },
    { id: "health", label: "System Health" },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-blue-900 text-blue-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Sources tab */}
          {activeTab === "sources" && (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <th className="text-left py-3 pr-4">Source</th>
                      <th className="text-left py-3 pr-4">Type</th>
                      <th className="text-left py-3 pr-4">Cadence</th>
                      <th className="text-left py-3 pr-4">Status</th>
                      <th className="text-left py-3 pr-4">Last collected</th>
                      <th className="text-left py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sources.map((source) => (
                      <tr key={source.id} className="text-sm">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">{source.name}</div>
                          <div className="text-xs text-gray-400 truncate max-w-xs">{source.url}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="secondary">{source.source_type.toUpperCase()}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          Every {source.cadence_minutes >= 60
                            ? `${source.cadence_minutes / 60}h`
                            : `${source.cadence_minutes}m`}
                        </td>
                        <td className="py-3 pr-4">
                          {!source.enabled ? (
                            <Badge variant="secondary">Disabled</Badge>
                          ) : source.healthy ? (
                            <Badge variant="success">Healthy</Badge>
                          ) : (
                            <Badge variant="destructive">
                              Unhealthy ({source.consecutive_failures} failures)
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-gray-500 text-xs">
                          {source.last_collected_at
                            ? formatRelativeTime(source.last_collected_at)
                            : "Never"}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleSource(source)}
                            >
                              {source.enabled ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestSource(source.id)}
                            >
                              Test
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Invite form */}
              <Card>
                <CardHeader>
                  <CardTitle>Invite User</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInvite} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <Input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="user@generalmills.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="h-9 px-3 border border-gray-300 rounded-md text-sm bg-white"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <Button type="submit" disabled={inviting}>
                      {inviting ? "Sending..." : "Send Invite"}
                    </Button>
                  </form>
                  {inviteStatus && (
                    <p className={`mt-2 text-sm ${inviteStatus.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
                      {inviteStatus}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Users table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <th className="text-left py-3 pr-4">Email</th>
                      <th className="text-left py-3 pr-4">Role</th>
                      <th className="text-left py-3 pr-4">Receives Brief</th>
                      <th className="text-left py-3 pr-4">Last Login</th>
                      <th className="text-left py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user.id} className="text-sm">
                        <td className="py-3 pr-4 font-medium text-gray-900">{user.email}</td>
                        <td className="py-3 pr-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => handleToggleBrief(user)}
                            className={cn(
                              "w-10 h-5 rounded-full transition-colors",
                              user.receive_brief ? "bg-blue-900" : "bg-gray-300"
                            )}
                          >
                            <span className={cn(
                              "block w-4 h-4 bg-white rounded-full mx-0.5 transition-transform",
                              user.receive_brief ? "translate-x-5" : "translate-x-0"
                            )} />
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-gray-500 text-xs">
                          {user.last_login_at ? formatRelativeTime(user.last_login_at) : "Never"}
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Health tab */}
          {activeTab === "health" && health && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Collection stats */}
              <Card>
                <CardHeader><CardTitle>Collection Stats</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Raw content today</span>
                    <span className="font-medium">{health.collection_stats?.raw_content_today ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Raw content this week</span>
                    <span className="font-medium">{health.collection_stats?.raw_content_week ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intelligence items today</span>
                    <span className="font-medium">{health.collection_stats?.intelligence_items_today ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intelligence items this week</span>
                    <span className="font-medium">{health.collection_stats?.intelligence_items_week ?? "—"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* LLM Costs */}
              <Card>
                <CardHeader><CardTitle>LLM Costs (Estimated)</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {["today", "week", "month"].map((period) => {
                    const costs = health.llm_costs?.[period] || {};
                    const total = Object.values(costs).reduce((a: number, b: any) => a + Number(b), 0);
                    return (
                      <div key={period}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span className="capitalize">{period}</span>
                          <span className="font-semibold text-gray-900">${total.toFixed(4)}</span>
                        </div>
                        {Object.entries(costs).map(([provider, cost]) => (
                          <div key={provider} className="flex justify-between text-xs pl-2">
                            <span className="text-gray-600">{provider}</span>
                            <span>${Number(cost).toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Source Health */}
              <Card>
                <CardHeader><CardTitle>Source Health</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Healthy sources</span>
                    <span className="font-medium text-green-700">{health.source_health?.healthy ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unhealthy sources</span>
                    <span className="font-medium text-red-600">{health.source_health?.unhealthy ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disabled sources</span>
                    <span className="font-medium text-gray-500">{health.source_health?.disabled ?? "—"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Database */}
              <Card>
                <CardHeader><CardTitle>Database</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total raw content</span>
                    <span className="font-medium">{(health.database?.raw_content_total ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intelligence items</span>
                    <span className="font-medium">{(health.database?.intelligence_items_total ?? 0).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
