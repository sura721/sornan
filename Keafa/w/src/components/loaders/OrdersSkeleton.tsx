import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCheck, Users } from 'lucide-react';

// A reusable card for the skeleton layout.
// Typed as a React Functional Component.
const SkeletonCard: React.FC = () => (
  <Card>
    <CardContent className="p-4 flex justify-between items-center">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </CardContent>
  </Card>
);

// The main skeleton component for the Orders page.
// Also typed as a React Functional Component.
const OrdersSkeleton: React.FC = () => {
  return (
    <div className="p-6 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <Skeleton className="h-10 w-48 mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Individual Orders Skeleton Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
              <UserCheck className="w-6 h-6" />
              <span>Individual Orders</span>
            </h2>
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>

          {/* Family Orders Skeleton Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
              <Users className="w-6 h-6" />
              <span>Family Orders</span>
            </h2>
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersSkeleton;