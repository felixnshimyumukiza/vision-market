"use client";

import { useEffect } from "react";
import { trackEvent } from "../../lib/analytics";

export default function TrackProductView({
  productId,
}: {
  productId: string | number;
}) {
  useEffect(() => {
    if (productId) {
      trackEvent({ eventType: "product_view", productId: String(productId) });
    }
  }, [productId]);

  return null;
}
