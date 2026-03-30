"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { useT } from "../../hooks/use-t";
import FeedbackNotice, {
  type FormFeedback,
} from "../../components/feedback-notice";
import {
  buildNetworkFeedback,
  buildSellerErrorFeedback,
} from "../../lib/form-feedback";
import { formatText } from "../../lib/i18n";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type SellerOverview = {
  topProducts: Array<{
    product_id: number;
    name: string;
    units_sold: number;
    revenue: string;
  }>;
  topLocations: Array<{
    country: string;
    city: string;
    district: string;
    order_count: number;
  }>;
  eventCounts: {
    product_views: number;
    add_to_cart: number;
    purchases: number;
    wishlist_adds: number;
    searches: number;
  };
  totals: {
    orders: number;
    revenue: string;
  };
};

type NotificationItem = {
  id: number;
  title: string;
  body: string | null;
  created_at: string;
};

type SellerOrder = {
  id: number;
  status: string;
  created_at: string;
  item_count: number;
  seller_total: string;
};

export default function SellerDashboardPage() {
  const { locale, t } = useT();
  const [overview, setOverview] = useState<SellerOverview | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<SellerOrder[]>([]);
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("vm_token") || "";
      if (!token) {
        setFeedback(
          buildSellerErrorFeedback(401, { message: "Unauthorized" }, "products", locale)
        );
        return;
      }
      try {
        const [overviewRes, notificationsRes, sellerOrdersRes] = await Promise.all([
          fetch(`${API_BASE}/api/analytics/seller/overview`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/orders/seller`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const overviewData = await overviewRes.json();
        if (!overviewRes.ok) {
          setFeedback(
            buildSellerErrorFeedback(
              overviewRes.status,
              overviewData,
              "products",
              locale
            )
          );
          return;
        }

        setOverview(overviewData);

        if (notificationsRes.ok) {
          const notificationData = await notificationsRes.json();
          setNotifications(
            notificationData.filter((item: NotificationItem) =>
              item.title.toLowerCase().includes("reservation")
            )
          );
        } else {
          setNotifications([]);
        }

        if (sellerOrdersRes.ok) {
          const sellerOrdersData = await sellerOrdersRes.json();
          setRecentOrders(Array.isArray(sellerOrdersData) ? sellerOrdersData : []);
        } else {
          setRecentOrders([]);
        }
      } catch {
        setFeedback(buildNetworkFeedback("loadSellerAnalytics", locale));
      }
    };

    loadDashboard();
  }, [locale]);

  const nextMoves = useMemo(() => {
    if (!overview) return [];
    const moves: string[] = [];
    if (overview.eventCounts.product_views > 0 && overview.eventCounts.purchases === 0) {
      moves.push(t.sellerDashboard.move1);
    }
    if (overview.eventCounts.add_to_cart > 0 && overview.eventCounts.purchases === 0) {
      moves.push(t.sellerDashboard.move2);
    }
    if (overview.topProducts.length > 0) {
      moves.push(
        formatText(t.sellerDashboard.restock, {
          name: overview.topProducts[0].name,
        })
      );
    }
    if (overview.topLocations.length > 0) {
      const location = overview.topLocations[0];
      moves.push(
        formatText(t.sellerDashboard.move3, {
          city: location.city,
          country: location.country,
        })
      );
    }
    if (moves.length === 0) {
      moves.push(t.sellerDashboard.move4);
    }
    return moves;
  }, [overview, t]);

  return (
    <div className="theme-page">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="theme-title text-2xl font-bold">
          {t.sellerDashboard.title}
        </h1>
        <p className="theme-note mt-2">{t.sellerDashboard.description}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/seller/products" className="theme-panel rounded-xl p-6">
            <h2 className="theme-title text-lg font-semibold">
              {t.sellerDashboard.productsTitle}
            </h2>
            <p className="theme-note mt-2 text-sm">
              {t.sellerDashboard.productsDescription}
            </p>
          </Link>

          <Link href="/seller/inventory" className="theme-panel rounded-xl p-6">
            <h2 className="theme-title text-lg font-semibold">
              {t.sellerDashboard.inventoryTitle}
            </h2>
            <p className="theme-note mt-2 text-sm">
              {t.sellerDashboard.inventoryDescription}
            </p>
          </Link>

          <Link href="/orders" className="theme-panel rounded-xl p-6 sm:col-span-2">
            <h2 className="theme-title text-lg font-semibold">
              {t.sellerDashboard.ordersToolTitle}
            </h2>
            <p className="theme-note mt-2 text-sm">
              {t.sellerDashboard.ordersToolDescription}
            </p>
          </Link>
        </div>

        <section className="theme-panel mt-10 rounded-xl p-6">
          <h2 className="theme-title text-lg font-semibold">
            {t.sellerDashboard.insightsTitle}
          </h2>
          {feedback ? (
            <div className="mt-2">
              <FeedbackNotice feedback={feedback} />
            </div>
          ) : null}

          {overview ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="theme-panel-soft rounded-lg p-4">
                <p className="theme-note text-xs uppercase">
                  {t.sellerDashboard.orders30d}
                </p>
                <p className="theme-title mt-2 text-2xl font-semibold">
                  {overview.totals.orders}
                </p>
                <p className="theme-note mt-1 text-sm">
                  {t.sellerDashboard.revenue}: ${overview.totals.revenue}
                </p>
              </div>
              <div className="theme-panel-soft rounded-lg p-4">
                <p className="theme-note text-xs uppercase">
                  {t.sellerDashboard.events7d}
                </p>
                <p className="theme-note mt-2 text-sm">
                  {t.sellerDashboard.views}: {overview.eventCounts.product_views}
                </p>
                <p className="theme-note mt-1 text-sm">
                  {t.sellerDashboard.addToCart}: {overview.eventCounts.add_to_cart}
                </p>
                <p className="theme-note mt-1 text-sm">
                  {t.sellerDashboard.wishlistAdds}: {overview.eventCounts.wishlist_adds}
                </p>
                <p className="theme-note mt-1 text-sm">
                  {t.sellerDashboard.purchases}: {overview.eventCounts.purchases}
                </p>
              </div>
            </div>
          ) : null}

          {overview ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="theme-title text-sm font-semibold">
                  {t.sellerDashboard.topProducts}
                </h3>
                <ul className="theme-note mt-2 space-y-2 text-sm">
                  {overview.topProducts.length === 0 ? (
                    <li>{t.sellerDashboard.noSales}</li>
                  ) : null}
                  {overview.topProducts.map((item) => (
                    <li key={item.product_id}>
                      {item.name} - {item.units_sold} {t.sellerDashboard.sold} (${item.revenue})
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="theme-title text-sm font-semibold">
                  {t.sellerDashboard.topLocations}
                </h3>
                <ul className="theme-note mt-2 space-y-2 text-sm">
                  {overview.topLocations.length === 0 ? (
                    <li>{t.sellerDashboard.noLocationData}</li>
                  ) : null}
                  {overview.topLocations.map((item, idx) => (
                    <li key={`${item.city}-${idx}`}>
                      {item.city}, {item.country} - {item.order_count} {t.sellerDashboard.orders}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {overview ? (
            <div className="mt-6">
              <h3 className="theme-title text-sm font-semibold">
                {t.sellerDashboard.nextMoves}
              </h3>
              <ul className="theme-note mt-2 list-disc pl-5 text-sm">
                {nextMoves.map((move) => (
                  <li key={move}>{move}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6">
            <h3 className="theme-title text-sm font-semibold">
              {t.sellerDashboard.reservationAlerts}
            </h3>
            <ul className="theme-note mt-2 space-y-3 text-sm">
              {notifications.length === 0 ? (
                <li>{t.sellerDashboard.noReservationAlerts}</li>
              ) : null}
              {notifications.slice(0, 5).map((item) => (
                <li key={item.id} className="theme-panel-soft rounded-lg p-3">
                  <p className="theme-title text-sm font-semibold">{item.title}</p>
                  {item.body ? <p className="mt-1">{item.body}</p> : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="theme-title text-sm font-semibold">
              {t.sellerDashboard.recentOrders}
            </h3>
            <ul className="theme-note mt-2 space-y-3 text-sm">
              {recentOrders.length === 0 ? (
                <li>{t.sellerDashboard.noRecentOrders}</li>
              ) : null}
              {recentOrders.slice(0, 5).map((order) => (
                <li key={order.id} className="theme-panel-soft rounded-lg p-3">
                  <p className="theme-title text-sm font-semibold">
                    #{order.id} - {order.status}
                  </p>
                  <p className="mt-1">
                    {order.item_count} {t.ordersPage.items} - {t.ordersPage.sellerOrderTotal}: $
                    {Number(order.seller_total).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs opacity-80">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
