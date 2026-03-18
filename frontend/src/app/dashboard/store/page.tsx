"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { Clock } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface StoreItem {
  store_id: string;
  store_name: string;
  is_operational: boolean;
  timing_open?: string;
  timing_close?: string;
  store_type?: string;
}

export default function StorePage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStores() {
      setLoading(true);
      try {
        const data = await fetchApi<StoreItem[]>('/stores');
        setStores(data || []);
      } catch (err) {
        console.error('Error loading stores:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStores();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Stores</h1>
          <p className="text-muted-foreground mt-1">
            Browse available campus stores and make purchases
          </p>
        </div>
      </div>

      {/* Stores List */}
      {loading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : stores.length === 0 ? (
        <NoDataFound entity="stores" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.store_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{store.store_name}</CardTitle>
                  <StatusBadge status={store.is_operational ? 'active' : 'inactive'} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {store.timing_open?.split('T')[0] || 'N/A'} - {store.timing_close?.split('T')[0] || 'N/A'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Type:</p>
                  <p className="font-medium">{store.store_type || 'General Store'}</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <Link href={`/dashboard/store/${store.store_id}`}>
                    <Button variant="outline" className="w-full">View Store</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
