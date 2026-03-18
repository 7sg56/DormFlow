"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { UtensilsCrossed, Star, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/loading-state";
import { NoDataFound } from "@/components/ui/empty-state";

interface Restaurant {
  restaurant_id: string;
  restaurant_name: string;
  is_operational: boolean;
  location?: string;
  rating?: number;
  cuisine_type?: string;
  avg_cost_per_meal?: number;
  capacity?: number;
  timing_open?: string;
  timing_close?: string;
}

export default function RestaurantPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRestaurants() {
      setLoading(true);
      try {
        const data = await fetchApi<Restaurant[]>('/restaurants');
        setRestaurants(data || []);
      } catch (err) {
        console.error('Error loading restaurants:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRestaurants();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Restaurants</h1>
          <p className="text-muted-foreground mt-1">
            Browse dining options and menus available on campus
          </p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={2} cols={4} />
      ) : restaurants.length === 0 ? (
        <NoDataFound entity="restaurants" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.restaurant_id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{restaurant.restaurant_name}</CardTitle>
                  {restaurant.is_operational ? (
                    <StatusBadge status="active" />
                  ) : (
                    <StatusBadge status="inactive" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{restaurant.location || 'Campus'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">
                    {restaurant.rating ? restaurant.rating.toString() : 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cuisine</p>
                    <p className="font-medium">{restaurant.cuisine_type || 'Variety'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Cost</p>
                    <p className="font-medium">${restaurant.avg_cost_per_meal || 'N/A'}/meal</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-medium">{restaurant.capacity || 'N/A'} people</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hours</p>
                    <p className="font-medium">
                      {restaurant.timing_open?.split('T')[0] || 'N/A'} - {restaurant.timing_close?.split('T')[0] || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="w-full">
                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                    View Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
