import { redirect } from 'next/navigation'
import { getSession } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import DashboardClient from '../../components/DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) redirect('/login')

  const entries = await prisma.entry.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = entries.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    intensityAfter: e.intensityAfter ?? null,
  }))

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 🔮 Background glow */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          filter: 'blur(60px)',
        }}
      />

      {/* 🔮 Secondary glow */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)',
          bottom: '-100px',
          right: '-100px',
          filter: 'blur(60px)',
        }}
      />

      {/* 🔥 Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <DashboardClient
          entries={serialized}
          email={session.email}
        />
      </div>
    </div>
  )
}