"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/auth-utils";
import { Calendar, Clock, Loader2, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface FacilityOption {
  facility_id: string;
  facility_name: string;
  hostel?: { hostel_name: string };
}

export default function FacilityBookingPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<FacilityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    facility_id: '',
    booking_date: '',
    slot_start: '',
    slot_end: '',
    purpose: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadFacilities() {
      setLoading(true);
      try {
        const data = await fetchApi<FacilityOption[]>('/facilities');
        setFacilities(data || []);
      } catch (err) {
        console.error('Error loading facilities:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFacilities();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/facility-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dormflow_access_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          booking_date: formData.booking_date ? new Date(formData.booking_date).toISOString().split('T')[0] : undefined,
        }),
      });

      if (response.ok) {
        router.push('/dashboard/facilities');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Book a Facility</h1>
        <p className="text-muted-foreground mt-1">
          Select a facility and book your time slot
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Facility Selection Form */}
        <Card>
          <CardHeader>
            <CardTitle>Facility Details</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : facilities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No facilities available</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="facility_id" className="text-sm font-medium">Select Facility</label>
                  <select
                    id="facility_id"
                    value={formData.facility_id}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, facility_id: e.target.value })}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select a facility...</option>
                    {facilities.map((facility) => (
                      <option key={facility.facility_id} value={facility.facility_id}>
                        {facility.facility_name} ({facility.hostel?.hostel_name || ''})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="booking_date" className="text-sm font-medium">Date</label>
                    <Input
                      id="booking_date"
                      type="date"
                      value={formData.booking_date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, booking_date: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="flex h-10 w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="slot_start" className="text-sm font-medium">Start Time</label>
                    <Input
                      id="slot_start"
                      type="time"
                      value={formData.slot_start}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, slot_start: e.target.value })}
                      required
                      className="flex h-10 w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="slot_end" className="text-sm font-medium">End Time</label>
                    <Input
                      id="slot_end"
                      type="time"
                      value={formData.slot_end}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, slot_end: e.target.value })}
                      required
                      className="flex h-10 w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="purpose" className="text-sm font-medium">Purpose</label>
                  <textarea
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="What will you use the facility for?"
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={submitting || !formData.facility_id || !formData.booking_date}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Facility
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

        {/* Booking Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm">Book in advance to ensure availability</p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">Slots are typically 1-2 hours</p>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">Bring valid student ID when booking</p>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm">Cancellations must be made 24 hours in advance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
