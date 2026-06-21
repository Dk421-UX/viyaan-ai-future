import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) redirect('/login')

  const totalEntries = await prisma.entry.count({
    where: { userId: session.userId }
  })

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  })

  const joinDate = user ? new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'Recently'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#080808] text-white relative overflow-hidden">
      {/* 🔮 Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500/10 blur-3xl rounded-full top-[-150px] left-1/2 -translate-x-1/2" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <div className="w-full max-w-md relative z-10 py-12">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-muted text-xs hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Growth OS
          </Link>
        </div>

        {/* Client side profile details and change password form */}
        <ProfileClient 
          email={session.email} 
          totalEntries={totalEntries} 
          joinDate={joinDate} 
        />
      </div>
    </div>
  )
}
