import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ManagementPageSkeletonProps {
  type?: 'tutors' | 'courses' | 'classes';
  itemCount?: number;
}

export function ManagementPageSkeleton({ type = 'tutors', itemCount = 6 }: ManagementPageSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: itemCount }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {type === 'tutors' ? (
                      <Skeleton className="h-16 w-16 rounded-full" />
                    ) : (
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    )}
                    {type === 'tutors' && (
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    )}
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>

                {type === 'tutors' && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center space-x-4 text-xs">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                )}

                {type === 'courses' && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-18" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-18" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                )}

                {type === 'classes' && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Skeleton className="h-3 w-3 mr-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-3 w-3 mr-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-3 w-3 mr-2" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-3 w-3 mr-2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Skeleton className="h-4 w-20" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                )}

                {(type === 'tutors' || type === 'courses') && (
                  <div className="flex space-x-2 justify-end">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ManagementPageSkeleton; 