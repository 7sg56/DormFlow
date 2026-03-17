"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/auth-utils";
import { Loader2, Shirt } from "lucide-react";
import { useRouter } from "next/navigation";

interface LaundryOption {
  laundry_id: string;
  laundry_name: string;
  price_per_piece?: number | string;
}

export default function LaundryRequestPage() {
  const router = useRouter();
  const [laundries, setLaundries] = useState<LaundryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    laundry_id: '',
    pickup_date: '',
    items_description: '',
    service_type: 'wash',
    total_pieces: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadLaundries() {
      try {
        const data = await fetchApi<LaundryOption[]>('/laundries');
        setLaundries(data || []);
      } catch (err) {
        console.error('Error loading laundries:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLaundries();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/laundry-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dormflow_access_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          pickup_date: formData.pickup_date ? new Date(formData.pickup_date).toISOString().split('T')[0] : undefined,
          total_pieces: parseInt(formData.total_pieces) || 0,
        }),
      });

      if (response.ok) {
        router.push('/dashboard/laundry');
      }
    } catch (err) {
      console.error('Error creating laundry request:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Laundry Request</h1>
        <p className="text-muted-foreground mt-1">
          Submit a new laundry service request
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="laundry_id" className="text-sm font-medium">Select Laundry Service</label>
                <select
                  id="laundry_id"
                  value={formData.laundry_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, laundry_id: e.target.value })}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select a laundry service...</option>
                  {laundries.map((laundry) => (
                    <option key={laundry.laundry_id} value={laundry.laundry_id}>
                      {laundry.laundry_name} - ${laundry.price_per_piece || '0'}/piece
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="pickup_date" className="text-sm font-medium">Pickup Date</label>
                  <Input
                    id="pickup_date"
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pickup_date: e.target.value })}
                    required
                    className="flex h-10 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="service_type" className="text-sm font-medium">Service Type</label>
                  <select
                    id="service_type"
                    value={formData.service_type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, service_type: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="wash">Wash</option>
                    <option value="dry">Dry</option>
                    <option value="iron">Ironing</option>
                    <option value="wash_iron">Wash & Iron</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="total_pieces" className="text-sm font-medium">Total Pieces</label>
                  <Input
                    id="total_pieces"
                    type="number"
                    value={formData.total_pieces}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, total_pieces: e.target.value })}
                    required
                    min="1"
                    className="flex h-10 w-full"
                    placeholder="Enter number of items"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="items_description" className="text-sm font-medium">Items Description</label>
                  <textarea
                    id="items_description"
                    value={formData.items_description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, items_description: e.target.value })}
                    rows={3}
                    placeholder="Describe your items (e.g., 2 shirts, 1 pair of jeans)"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={submitting || !formData.laundry_id}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Shirt className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
