"use client";
import { useState } from "react";
import { IntelligenceItem } from "@/lib/api";
import { Badge } from "./ui/badge";
import { formatRelativeTime, cn } from "@/lib/utils";
import { getCompanyColor, getScoreBg, DOMAIN_LABELS } from "@/lib/auth-utils";

interface IntelligenceItemCardProps {
  item: IntelligenceItem;
}

export function IntelligenceItemCard({ item }: IntelligenceItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  const scoreClass = cn(
    "text-xs font-semibold px-2 py-0.5 rounded-full",
    getScoreBg(item.relevance_score)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          {/* Headline */}
          {item.source_url ? (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-gray-900 hover:text-blue-900 hover:underline leading-snug block"
            >
              {item.headline}
            </a>
          ) : (
            <p className="text-sm font-semibold text-gray-900 leading-snug">{item.headline}</p>
          )}

          {/* Source + date */}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            {item.source_name && <span>{item.source_name}</span>}
            {item.source_name && item.published_at && <span>·</span>}
            {item.published_at && <span>{formatRelativeTime(item.published_at)}</span>}
          </div>
        </div>

        {/* Score badge */}
        <div className={scoreClass}>{item.relevance_score}</div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {/* Company chips */}
        {item.companies.slice(0, 4).map((company) => (
          <span
            key={company}
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              getCompanyColor(company)
            )}
          >
            {company}
          </span>
        ))}
        {/* Domain tag */}
        <Badge variant="secondary">
          {DOMAIN_LABELS[item.domain] || item.domain}
        </Badge>
      </div>

      {/* Summary (expandable) */}
      {item.summary && (
        <div>
          <p className={cn(
            "text-sm text-gray-700 leading-relaxed",
            !expanded && "line-clamp-2"
          )}>
            {item.summary}
          </p>
          {item.summary.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-700 hover:text-blue-900 mt-1 font-medium"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Strategic relevance (shown when expanded) */}
      {expanded && item.strategic_relevance && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Strategic relevance
          </p>
          <p className="text-sm text-gray-700">{item.strategic_relevance}</p>
        </div>
      )}
    </div>
  );
}
