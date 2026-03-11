"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getBriefs, getBriefByDate, getLatestBrief, generateBrief, BriefSummary, DailyBrief } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";
import { isAdmin } from "@/lib/auth";

export default function BriefsPage() {
  const { data: session } = useSession();
  const [briefs, setBriefs] = useState<BriefSummary[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [briefLoading, setBriefLoading] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const admin = isAdmin(session);
  const token = (session as any)?.accessToken;

  useEffect(() => {
    async function loadBriefs() {
      try {
        const list = await getBriefs(token);
        setBriefs(list);

        // Load the most recent brief
        if (list.length > 0) {
          await loadBriefByDate(list[0].brief_date);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load briefs");
        setLoading(false);
      }
    }
    loadBriefs();
  }, []);

  async function loadBriefByDate(date: string) {
    setBriefLoading(true);
    setError("");
    try {
      const brief = await getBriefByDate(date, token);
      setSelectedBrief(brief);
    } catch (err: any) {
      setError(err.message || "Failed to load brief");
    } finally {
      setBriefLoading(false);
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateBrief(token);
      // Reload the list after a brief delay
      setTimeout(async () => {
        const list = await getBriefs(token);
        setBriefs(list);
        if (list.length > 0) await loadBriefByDate(list[0].brief_date);
        setGenerating(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to trigger brief generation");
      setGenerating(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex gap-6">
        <aside className="w-56 flex-shrink-0">
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </aside>
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar: brief list / calendar */}
      <aside className="w-56 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Archive</h3>
          {admin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
              className="text-xs"
            >
              {generating ? "Generating..." : "+ Generate"}
            </Button>
          )}
        </div>

        {briefs.length === 0 ? (
          <p className="text-sm text-gray-500">No briefs yet.</p>
        ) : (
          <div className="space-y-1">
            {briefs.map((brief) => (
              <button
                key={brief.id}
                onClick={() => loadBriefByDate(brief.brief_date)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedBrief?.brief_date === brief.brief_date
                    ? "bg-blue-50 text-blue-900 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div className="font-medium">
                  {new Date(brief.brief_date + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                {brief.word_count && (
                  <div className="text-xs text-gray-500 mt-0.5">{brief.word_count} words</div>
                )}
                {brief.delivered_at && (
                  <div className="w-2 h-2 bg-green-500 rounded-full inline-block ml-1" title="Delivered" />
                )}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main area: brief content */}
      <div className="flex-1 min-w-0">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {briefLoading ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6" />
            <div className="space-y-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
              ))}
            </div>
          </div>
        ) : selectedBrief ? (
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Brief header actions */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-500">
                {new Date(selectedBrief.brief_date + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Brief content */}
            <div
              className="p-6 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedBrief.content_html }}
            />

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
              <span>
                Generated {formatDate(selectedBrief.generated_at)}
                {selectedBrief.model_used && ` · ${selectedBrief.model_used}`}
              </span>
              <span>
                {selectedBrief.word_count && `${selectedBrief.word_count} words · `}
                {selectedBrief.item_ids.length} items
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium mb-1">No brief selected</p>
            <p className="text-sm">Select a date from the archive, or generate today's brief.</p>
          </div>
        )}
      </div>
    </div>
  );
}
