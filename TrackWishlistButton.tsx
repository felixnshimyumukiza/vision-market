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
  className?: string;
  label?: string;
};

export default function TrackWishlistButton({
  productId,
  className,
  label,
}: Props) {
  const { locale } = useT();
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const handleClick = async () => {
    const token = localStorage.getItem("vm_token") || "";
    if (!token) {
      setFeedback(
        buildActionErrorFeedback(401, { message: "Unauthorized" }, "wishlist", locale)
      );
      return;
    }

    setStatus("saving");
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/api/wishlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback(buildActionErrorFeedback(res.status, data, "wishlist", locale));
        setStatus("idle");
        return;
      }

      trackEvent({ eventType: "wishlist_add", productId: String(productId) });
      setStatus("saved");
      setFeedback(
        buildInfoFeedback(
          locale === "rw" ? "Byabitswe ku rutonde rw'ibyifuzo." : "Saved to wishlist.",
          [
            locale === "rw"
              ? "Ushobora kuzagaruka kuri iki gicuruzwa nyuma ukoresheje urwo rutonde."
              : "You can return to this item later from your saved list.",
          ]
        )
      );
    } catch {
      setFeedback(buildNetworkFeedback("saveWishlist", locale));
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={className}
        onClick={handleClick}
        disabled={status === "saving"}
      >
        {status === "saved"
          ? locale === "rw"
            ? "Byabitswe"
            : "Saved"
          : label || (locale === "rw" ? "Bika ku byifuzo" : "Save to wishlist")}
      </button>
      {feedback ? <FeedbackNotice feedback={feedback} /> : null}
    </div>
  );
}
