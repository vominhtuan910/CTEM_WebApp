const DashboardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        <div className="h-8 bg-gray-300 rounded w-64"></div>
      </div>

      {/* Health Score Section Skeleton */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-16 bg-gray-300 rounded"></div>
            <div className="w-32 h-4 bg-gray-300 rounded"></div>
            <div className="w-24 h-3 bg-gray-300 rounded"></div>
            <div className="w-40 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-48 h-5 bg-gray-300 rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="w-40 h-4 bg-gray-300 rounded"></div>
                <div className="w-16 h-3 bg-gray-300 rounded"></div>
                <div className="w-8 h-3 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Threats Summary Skeleton */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="w-48 h-5 bg-gray-300 rounded"></div>
            </div>
            <div className="mb-4 w-16 h-8 bg-gray-300 rounded"></div>
            <div className="mb-3 w-24 h-4 bg-gray-300 rounded"></div>
            <div className="space-y-2">
              {[1, 2].map((j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="w-32 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-3 bg-gray-300 rounded"></div>
                  <div className="w-8 h-3 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section Skeleton */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
              <div className="w-40 h-5 bg-gray-300 rounded"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  <div className="w-8 h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default DashboardSkeleton;