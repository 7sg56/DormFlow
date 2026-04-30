"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function LaundryPage() {
  const [laundries, setLaundries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/dashboard/laundry-info")
      .then((data: any) => setLaundries(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
        <span className="text-sm font-ui text-on-surface-variant">Loading laundry services...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Laundry Services</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">{laundries.length} laundry services</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {laundries.map((l) => (
          <Card key={l.laundry_id} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-tertiary" />
            <CardHeader className="pt-5">
              <CardTitle>{l.laundry_name}</CardTitle>
              <p className="text-sm text-on-surface-variant">{l.hostel_name}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-on-surface-variant">Vendor:</span> <span className="font-medium text-on-surface">{l.vendor_name}</span></div>
              <div><span className="text-on-surface-variant">Per Piece:</span> <span className="data-tabular font-medium text-on-surface">Rs. {l.price_per_piece}</span></div>
              <div><span className="text-on-surface-variant">Per Kg:</span> <span className="data-tabular font-medium text-on-surface">Rs. {l.price_per_kg}</span></div>
              <div><span className="text-on-surface-variant">Hours:</span> <span className="font-medium text-on-surface">{l.timing_open} - {l.timing_close}</span></div>
              <div><span className="text-on-surface-variant">Phone:</span> <span className="data-tabular font-medium text-on-surface">{l.vendor_phone}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
