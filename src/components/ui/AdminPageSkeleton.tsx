import { Skeleton } from '@/components/ui/skeleton';

export function AdminPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Page title skeleton */}
      <Skeleton className="h-8 w-64" />
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-9 w-24 mb-3" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      
      {/* Chart skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="h-64 flex items-end justify-between">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="w-12 rounded-t-md" style={{ height: `${40 + (i * 8)}%` }} />
          ))}
        </div>
      </div>
      
      {/* Table skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex space-x-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-48 ml-auto" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 