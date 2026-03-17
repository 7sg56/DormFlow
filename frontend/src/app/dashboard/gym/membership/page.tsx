"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/lib/auth-utils";
import { Dumbbell, DollarSign, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GymOption {
  gym_id: string;
  gym_name: string;
  monthly_fee?: number | string;
  location?: string;
}

export default function GymMembershipPage() {
  const router = useRouter();
  const [gyms, setGyms] = useState<GymOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    gym_id: '',
    start_date: '',
    end_date: '',
    fee_paid: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadGyms() {
      try {
        const data = await fetchApi<GymOption[]>('/gyms');
        setGyms(data || []);
      } catch (err) {
        console.error('Error loading gyms:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGyms();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/gym-memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dormflow_access_token')}`,
        },
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : undefined,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : undefined,
          fee_paid: parseFloat(formData.fee_paid) || 0,
        }),
      });

      if (response.ok) {
        router.push('/dashboard/gym');
      }
    } catch (err) {
      console.error('Error creating membership:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Gym Membership</h1>
        <p className="text-muted-foreground mt-1">
          Register for a gym membership to access fitness facilities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membership Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="gym" className="text-sm font-medium">Select Gym</label>
                <select
                  id="gym"
                  value={formData.gym_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, gym_id: e.target.value })}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="">Select a gym...</option>
                  {gyms.map((gym) => (
                    <option key={gym.gym_id} value={gym.gym_id}>
                      {gym.gym_name} - {gym.monthly_fee || 'Free'} ({gym.location || 'Various locations'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="end_date" className="text-sm font-medium">End Date</label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="fee" className="text-sm font-medium">Fee Paid ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fee_paid}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fee_paid: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={submitting || !formData.gym_id}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Dumbbell className="mr-2 h-4 w-4" />
                      Create Membership
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
