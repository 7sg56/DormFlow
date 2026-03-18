"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface Purchase {
  purchase_id: string;
  purchase_date: string;
  item_description?: string;
  total_amount?: number | string;
  store?: { store_name: string };
}

export default function StorePurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPurchases() {
      setLoading(true);
      try {
        const data = await fetchApi<Purchase[]>('/store-purchases');
        setPurchases(data || []);
      } catch (err) {
        console.error('Error loading purchases:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPurchases();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Purchases</h1>
          <p className="text-muted-foreground mt-1">
            View your purchase history from campus stores
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : purchases.length === 0 ? (
        <NoDataFound entity="purchases" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Store</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.purchase_id} className="border-b border-border">
                    <td className="px-4 py-3 text-sm">{purchase.store?.store_name || '-'}</td>
                    <td className="px-4 py-3 text-sm line-clamp-1">{purchase.item_description}</td>
                    <td className="px-4 py-3 text-sm">{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-right">${purchase.total_amount || '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
