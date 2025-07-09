const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
        {/* Enhanced Header Skeleton */}
        <header className="mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl"></div>
              <div>
                <div className="h-10 bg-slate-300 rounded-lg w-80 mb-2"></div>
                <div className="h-5 bg-slate-200 rounded w-64"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 bg-white/60 rounded-xl w-20"></div>
              <div className="h-10 bg-white rounded-xl w-24"></div>
            </div>
          </div>
        </header>

        {/* Health Score Section Skeleton */}
        <section className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-200 rounded-lg"></div>
            <div>
              <div className="h-7 bg-slate-300 rounded w-64 mb-1"></div>
              <div className="h-4 bg-slate-200 rounded w-80"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Health Score Card Skeleton */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-slate-200 p-8 shadow-lg">
              <div className="w-full h-1 bg-slate-300 rounded-full mb-6"></div>
              <div className="text-center mb-6">
                <div className="w-32 h-20 bg-slate-300 rounded-lg mx-auto mb-3"></div>
                <div className="w-48 h-6 bg-slate-300 rounded mx-auto"></div>
              </div>
              <div className="space-y-4">
                <div className="h-16 bg-white/60 rounded-xl"></div>
                <div className="h-16 bg-white/60 rounded-xl"></div>
              </div>
              <div className="mt-6">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-300 rounded-full"></div>
              </div>
            </div>
            
            {/* Errors Watch List Skeleton */}
            <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200 p-8 shadow-lg">
              <div className="w-full h-1 bg-amber-400 rounded-full mb-6"></div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-200 rounded-xl"></div>
                  <div>
                    <div className="h-7 bg-slate-300 rounded w-32 mb-1"></div>
                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-red-100 rounded-xl border-2 border-red-200"></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Threats Summary Skeleton */}
        <section className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-200 rounded-lg"></div>
            <div>
              <div className="h-7 bg-slate-300 rounded w-48 mb-1"></div>
              <div className="h-4 bg-slate-200 rounded w-72"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-gradient-to-br from-rose-100 to-red-100 border-2 border-rose-200 p-8 shadow-lg">
                <div className="w-full h-1 bg-rose-400 rounded-full mb-6"></div>
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-rose-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-7 bg-slate-300 rounded w-40 mb-1"></div>
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-24 bg-white/60 rounded-xl border border-white/20"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-16 bg-white/80 rounded-xl border border-white/30"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Analytics Charts Skeleton */}
        <section className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-200 rounded-lg"></div>
            <div>
              <div className="h-7 bg-slate-300 rounded w-44 mb-1"></div>
              <div className="h-4 bg-slate-200 rounded w-80"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-200 p-6 shadow-lg">
                <div className="w-full h-1 bg-indigo-400 rounded-full mb-6"></div>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-indigo-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-slate-300 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-white/60 rounded-lg"></div>
                    <div className="h-16 bg-white/60 rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-14 bg-white/60 rounded-xl border border-white/20"></div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-8 bg-white/40 rounded"></div>
                    <div className="h-8 bg-white/40 rounded"></div>
                    <div className="h-8 bg-white/40 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Footer Skeleton */}
        <footer className="mt-16 pt-8 border-t border-slate-200">
          <div className="bg-white/60 rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-10 bg-slate-300 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-24 mx-auto"></div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <div className="h-4 bg-slate-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardSkeleton;