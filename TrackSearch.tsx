"use client";

import { useEffect } from "react";
import { trackEvent } from "../../lib/analytics";

export default function TrackSearch({ query }: { query: string }) {
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed) {
      trackEvent({ eventType: "search", query: trimmed });
    }
  }, [query]);

  return null;
}
