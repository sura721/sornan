import React from 'react';
import { UserCheck, Users } from 'lucide-react';
import SkeletonCard from '@/components/ui/SkeletonCard'; // Adjust path if needed
import { Skeleton } from '@/components/ui/skeleton';

const OrdersSkeleton = () => {
  return (
    <div className="p-6">
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