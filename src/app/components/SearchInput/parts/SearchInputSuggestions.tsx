"use client";

import { Search } from "@/app/lib/icons";
import { Button } from "@/app/components/atoms/Button";
import MobileMenuToggleIcon from "../../Header/MobileMenuToggleIcon";
import type { LiveSearchResult } from "../../../hooks/useLiveSearch";

interface CustomSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  typeLabel?: string;
}

interface SearchInputSuggestionsProps {
  suggestionsMode: "business" | "custom";
  liveLoading: boolean;
  businessSuggestions: LiveSearchResult[];
  normalizedCustomSuggestions: CustomSuggestion[];
  querySuggestions: Array<{ type: string; query: string }>;
  activeIndex: number;
  setActiveIndex: (idx: number) => void;
  onSelectQuerySuggestion: (q: string) => void;
  onSelectBusiness: (item: LiveSearchResult) => void;
  onSelectCustom: (item: CustomSuggestion) => void;
  dismissSuggestions: () => void;
}

export default function SearchInputSuggestions({
  suggestionsMode,
  liveLoading,
  businessSuggestions,
  normalizedCustomSuggestions,
  querySuggestions,
  activeIndex,
  setActiveIndex,
  onSelectQuerySuggestion,
  onSelectBusiness,
  onSelectCustom,
  dismissSuggestions,
}: SearchInputSuggestionsProps) {
  return (
    <>
      <div className="px-4 py-3 border-b border-charcoal/10 flex items-center justify-between">
        <div className="text-xs font-semibold text-charcoal/70">Suggestions</div>
        <Button
          variant="bare"
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            dismissSuggestions();
          }}
          onClick={dismissSuggestions}
          className="w-8 h-8 flex items-center justify-center text-charcoal/60 hover:text-charcoal transition-colors min-h-0 p-0"
          aria-label="Close suggestions"
        >
          <MobileMenuToggleIcon isOpen={true} />
        </Button>
      </div>

      {suggestionsMode === "business" && querySuggestions.length > 0 && (
        <div className="py-1 border-b border-charcoal/6">
          {querySuggestions.map((s) => (
            <Button
              key={`qs-${s.type}-${s.query}`}
              variant="bare"
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelectQuerySuggestion(s.query)}
              className="mi-tap w-full text-left px-4 py-2.5 flex items-center gap-2.5 hover:bg-charcoal/5 transition-colors duration-150 group min-h-0 rounded-none"
            >
              <Search className="w-3.5 h-3.5 text-charcoal/40 flex-shrink-0 group-hover:text-charcoal/60 transition-colors" />
              <span className="text-sm text-charcoal truncate flex-1">{s.query}</span>
              <span className="text-[11px] text-charcoal/40 flex-shrink-0">
                {s.type === "location" ? "area" : "category"}
              </span>
            </Button>
          ))}
        </div>
      )}

      <div className="py-2" role="listbox" aria-label="Search suggestions">
        {suggestionsMode === "business" ? (
          liveLoading && businessSuggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-charcoal/60">Searching…</div>
          ) : (
            businessSuggestions.map((item, idx) => {
              const isActive = idx === activeIndex;
              const label = (item as any).category_label ?? item.category ?? "";
              return (
                <Button
                  key={item.id}
                  variant="bare"
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => onSelectBusiness(item)}
                  className={`mi-tap w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-150 min-h-0 rounded-none ${
                    isActive ? "bg-gradient-to-r from-sage/10 to-coral/5" : "hover:bg-charcoal/5"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-charcoal truncate">{item.name}</div>
                    <div className="text-xs text-charcoal/60 truncate">
                      {label ? `${label} • ` : ""}
                      {item.location}
                    </div>
                  </div>
                </Button>
              );
            })
          )
        ) : (
          normalizedCustomSuggestions.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <Button
                key={item.id}
                variant="bare"
                type="button"
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => onSelectCustom(item)}
                className={`mi-tap w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-150 min-h-0 rounded-none ${
                  isActive ? "bg-gradient-to-r from-sage/10 to-coral/5" : "hover:bg-charcoal/5"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-charcoal truncate">{item.title}</div>
                    {item.typeLabel && (
                      <span className="shrink-0 rounded-full bg-charcoal/5 px-2 py-0.5 text-[11px] font-semibold text-charcoal/70">
                        {item.typeLabel}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <div className="text-xs text-charcoal/60 truncate">{item.subtitle}</div>
                  )}
                </div>
              </Button>
            );
          })
        )}
      </div>
    </>
  );
}
