/**
 * Auth helpers for SCOUT.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  if ((session.user as { role?: string })?.role !== "admin") {
    redirect("/feed");
  }
  return session;
}

export function isAdmin(session: { user?: { role?: string } } | null): boolean {
  return (session?.user as { role?: string })?.role === "admin";
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-gray-400";
}

export function getScoreBg(score: number): string {
  if (score >= 70) return "bg-green-100 text-green-800";
  if (score >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-600";
}

export const DOMAIN_LABELS: Record<string, string> = {
  new_products: "New Products",
  technology_digital: "Technology",
  science_trends: "Science",
  earnings_strategy: "Earnings & Strategy",
  leadership: "Leadership",
  other: "Other",
};

export const COMPETITOR_COLORS: Record<string, string> = {
  "Conagra": "bg-blue-100 text-blue-800",
  "Kraft Heinz": "bg-purple-100 text-purple-800",
  "Nestlé": "bg-red-100 text-red-800",
  "PepsiCo": "bg-indigo-100 text-indigo-800",
  "Mondelez": "bg-pink-100 text-pink-800",
  "J.M. Smucker": "bg-orange-100 text-orange-800",
  "Hormel": "bg-teal-100 text-teal-800",
  "Mars": "bg-green-100 text-green-800",
  default: "bg-gray-100 text-gray-800",
};

export function getCompanyColor(company: string): string {
  return COMPETITOR_COLORS[company] || COMPETITOR_COLORS.default;
}
