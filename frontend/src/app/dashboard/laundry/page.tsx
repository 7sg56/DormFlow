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

  if (loading) return <div className="text-muted-foreground py-10 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laundry Services</h2>
        <p className="text-muted-foreground mt-1">{laundries.length} laundry services</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {laundries.map((l) => (
          <Card key={l.laundry_id}>
            <CardHeader>
              <CardTitle>{l.laundry_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{l.hostel_name}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Vendor:</span> {l.vendor_name}</div>
              <div><span className="text-muted-foreground">Per Piece:</span> Rs. {l.price_per_piece}</div>
              <div><span className="text-muted-foreground">Per Kg:</span> Rs. {l.price_per_kg}</div>
              <div><span className="text-muted-foreground">Hours:</span> {l.timing_open} - {l.timing_close}</div>
              <div><span className="text-muted-foreground">Phone:</span> {l.vendor_phone}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
