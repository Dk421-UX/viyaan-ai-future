import { redirect } from 'next/navigation'
import { getSession } from './src/lib/auth'
import { prisma } from './src/lib/prisma'
import DashboardClient from './src/components/DashboardClient'
import React from 'react'

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

  return <DashboardClient entries={serialized} email={session.email} />
}
