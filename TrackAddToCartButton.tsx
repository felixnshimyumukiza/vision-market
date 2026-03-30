"use client";

import { useState } from "react";
import { trackEvent } from "../../lib/analytics";
import FeedbackNotice, { type FormFeedback } from "../feedback-notice";
import { useT } from "../../hooks/use-t";
import {
  buildActionErrorFeedback,
  buildInfoFeedback,
  buildNetworkFeedback,
} from "../../lib/form-feedback";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type Props = {
  productId: string | number;
  label?: string;
  className?: string;
};

export default function TrackAddToCartButton({
  productId,
  label = "Add to cart",
  className,
}: Props) {
  const { locale, t } = useT();
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const handleClick = async () => {
    const token = localStorage.getItem("vm_token") || "";
    if (!token) {
      setFeedback(
        buildActionErrorFeedback(401, { message: "Unauthorized" }, "add-to-cart", locale)
      );
      return;
    }

    setStatus("saving");
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback(buildActionErrorFeedback(res.status, data, "add-to-cart", locale));
        setStatus("idle");
        return;
      }

      trackEvent({ eventType: "add_to_cart", productId: String(productId) });
      setFeedback(
        buildInfoFeedback(
          locale === "rw" ? "Byashyizwe mu gatebo." : "Added to cart.",
          [
            locale === "rw"
              ? "Ushobora kubisuzuma cyangwa kubihindura ku rupapuro rw'igitebo."
              : "You can review or update this item from your cart page.",
          ]
        )
      );
    } catch {
      setFeedback(buildNetworkFeedback("addToCart", locale));
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className={className}
        onClick={handleClick}
        disabled={status === "saving"}
      >
        {status === "saving" ? t.productCard.adding : label}
      </button>
      {feedback ? <FeedbackNotice feedback={feedback} /> : null}
    </div>
  );
}
