"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/auth-utils";
import { Phone, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface Pharmacy {
  pharmacy_id: string;
  pharmacy_name: string;
  is_24hr?: boolean;
  pharmacist_phone?: string;
  timing_open?: string;
  timing_close?: string;
  emergency_available?: boolean;
}

export default function PharmacyPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPharmacies() {
      setLoading(true);
      try {
        const data = await fetchApi<Pharmacy[]>('/pharmacies');
        setPharmacies(data || []);
      } catch (err) {
        console.error('Error loading pharmacies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPharmacies();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacy</h1>
          <p className="text-muted-foreground mt-1">
            Campus pharmacy services and medication management
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={2} cols={4} />
      ) : pharmacies.length === 0 ? (
        <NoDataFound entity="pharmacies" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pharmacies.map((pharmacy) => (
            <Card key={pharmacy.pharmacy_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{pharmacy.pharmacy_name}</CardTitle>
                  {pharmacy.is_24hr && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-xs font-medium text-green-600">24/7</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{pharmacy.pharmacist_phone || 'Contact front desk'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Open Hours</p>
                    <p className="font-medium">
                      {pharmacy.timing_open?.split('T')[0] || 'N/A'} - {pharmacy.timing_close?.split('T')[0] || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Emergency</p>
                    <div className="flex items-center gap-1">
                      {pharmacy.emergency_available ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Available</span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-600">Unavailable</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm pt-4 border-t border-border">
                  <Link href={`/dashboard/pharmacy/${pharmacy.pharmacy_id}`}>
                    <Button variant="outline" className="w-full">View Pharmacy</Button>
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
