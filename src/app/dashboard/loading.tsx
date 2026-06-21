export default function DashboardLoading() {
  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto space-y-8 bg-[#080808] text-white relative overflow-hidden">
      {/* Background glow matching the real layout */}
      <div className="absolute w-[600px] height-[600px] bg-gradient-to-b from-purple-500/5 to-transparent top-[-150px] left-1/2 -translate-x-1/2 filter blur-[60px]" />
      
      {/* 🔮 Glassmorphic Navbar Skeleton */}
      <div className="flex justify-between items-center bg-card/40 border border-border/60 rounded-2xl p-5 backdrop-blur animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-2 w-20 bg-white/15 rounded" />
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-20 h-9 rounded-xl bg-white/15" />
          <div className="w-16 h-9 rounded-xl bg-white/10" />
        </div>
      </div>

      {/* 🚀 SaaS KPIs Matrix Dashboard Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="h-2.5 w-16 bg-white/10 rounded" />
            <div className="flex items-baseline gap-2">
              <div className="h-6 w-12 bg-white/15 rounded" />
              <div className="h-2.5 w-10 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 🧠 Memory Highlights Banner Skeleton */}
      <div className="bg-white/[0.02] border border-border/40 rounded-2xl p-6 space-y-3 animate-pulse">
        <div className="h-3 w-36 bg-accent/20 rounded" />
        <div className="space-y-2">
          <div className="h-2.5 w-full bg-white/10 rounded" />
          <div className="h-2.5 w-11/12 bg-white/5 rounded" />
        </div>
      </div>

      {/* Tabs Selector Skeleton */}
      <div className="flex border-b border-border/60 gap-6 pb-3">
        <div className="h-4 w-16 bg-white/15 rounded" />
        <div className="h-4 w-32 bg-white/10 rounded" />
      </div>

      {/* Timeline entries Skeleton */}
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 flex justify-between items-center">
            <div className="space-y-3 flex-1 mr-4">
              <div className="flex gap-2">
                <div className="h-3 w-16 bg-white/15 rounded" />
                <div className="h-3 w-20 bg-white/10 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-white/10 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <div className="h-4 w-8 bg-white/15 rounded text-right" />
                <div className="h-2 w-12 bg-white/5 rounded" />
              </div>
              <div className="w-4 h-4 bg-white/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
