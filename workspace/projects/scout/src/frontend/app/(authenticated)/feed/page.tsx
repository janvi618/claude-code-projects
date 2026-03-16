"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getItems, IntelligenceItem, ItemFilters } from "@/lib/api";
import { IntelligenceItemCard } from "@/components/intelligence-item-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DOMAIN_LABELS } from "@/lib/auth-utils";

const COMPETITORS = [
  "Conagra", "Kraft Heinz", "Nestlé", "PepsiCo",
  "Mondelez", "J.M. Smucker", "Hormel", "Mars",
];

const DOMAINS = Object.entries(DOMAIN_LABELS);

const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All time", value: "all" },
];

function getAfterDate(preset: string): string | undefined {
  const now = new Date();
  if (preset === "today") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today.toISOString();
  }
  if (preset === "7d") {
    return new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
  }
  if (preset === "30d") {
    return new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();
  }
  return undefined;
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<IntelligenceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState("7d");
  const [minScore, setMinScore] = useState(40);
  const [offset, setOffset] = useState(0);

  const LIMIT = 25;

  const fetchItems = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
      setItems([]);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }
    setError("");

    try {
      const filters: ItemFilters = {
        limit: LIMIT,
        offset: currentOffset,
        min_score: minScore,
        after: getAfterDate(datePreset),
      };
      if (selectedCompanies.length > 0) filters.companies = selectedCompanies.join(",");
      if (selectedDomains.length > 0) filters.domains = selectedDomains.join(",");

      const token = (session as any)?.accessToken;
      const result = await getItems(filters, token);

      if (reset) {
        setItems(result.items);
      } else {
        setItems((prev) => [...prev, ...result.items]);
      }
      setTotal(result.total);
      setOffset(currentOffset + result.items.length);
    } catch (err: any) {
      setError(err.message || "Failed to load items");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [session, selectedCompanies, selectedDomains, datePreset, minScore, offset]);

  useEffect(() => {
    fetchItems(true);
  }, [selectedCompanies, selectedDomains, datePreset, minScore]);

  function toggleCompany(company: string) {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  }

  function toggleDomain(domain: string) {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  }

  const hasMore = items.length < total;

  return (
    <div className="flex gap-6">
      {/* Sidebar filters */}
      <aside className="w-56 flex-shrink-0 hidden lg:block">
        <div className="sticky top-20 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Competitors</h3>
            <div className="space-y-1.5">
              {COMPETITORS.map((company) => (
                <label key={company} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company)}
                    onChange={() => toggleCompany(company)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{company}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Domain</h3>
            <div className="space-y-1.5">
              {DOMAINS.map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(value)}
                    onChange={() => toggleDomain(value)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-900 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Date Range</h3>
            <div className="space-y-1">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setDatePreset(preset.value)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                    datePreset === preset.value
                      ? "bg-blue-50 text-blue-900 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Min relevance score"
            min={0}
            max={100}
            value={minScore}
            onChange={setMinScore}
          />
        </div>
      </aside>

      {/* Main feed */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">
            Intelligence Feed
            {!loading && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                {total.toLocaleString()} items
              </span>
            )}
          </h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium mb-1">No items found</p>
            <p className="text-sm">Try adjusting the filters or date range.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <IntelligenceItemCard key={item.id} item={item} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchItems(false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : `Load more (${total - items.length} remaining)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
