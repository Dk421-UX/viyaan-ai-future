import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncate(text: string, maxLen = 90): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

function getNameFromEmail(email: string): string {
  const local = email.split('@')[0]
  // capitalise first letter, replace dots/underscores/hyphens with spaces
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function WelcomePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { userId, email } = session
  const displayName = getNameFromEmail(email)

  const recentEntries = await prisma.entry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, inputText: true, createdAt: true },
  })

  const isNewUser = recentEntries.length === 0

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#080808] text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute w-[700px] h-[700px] bg-purple-600/8 blur-3xl rounded-full top-[-200px] left-1/2 -translate-x-1/2" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/8 blur-3xl rounded-full bottom-[-100px] right-[-80px]" />
      <div className="absolute w-[300px] h-[300px] bg-violet-600/6 blur-3xl rounded-full bottom-[-50px] left-[-60px]" />

      <div className="w-full max-w-md relative z-10 animate-fadeUp">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/viyaan-logo.png"
            alt="Viyaan Future"
            width={52}
            height={52}
            className="rounded-xl shadow-lg shadow-purple-500/25"
          />
        </div>

        {/* Greeting */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-white mb-2 tracking-tight">
            {isNewUser ? `Welcome, ${displayName}.` : `Welcome back, ${displayName}.`}
          </h1>
          <p className="text-white/45 text-sm">
            {isNewUser
              ? 'This is the beginning of your reflection journey.'
              : 'Your future self has been waiting.'}
          </p>
        </div>

        {/* Memory Panel */}
        {isNewUser ? (
          /* New User State */
          <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm px-6 py-8 text-center mb-8">
            <div className="text-3xl mb-4">✦</div>
            <p className="text-white/60 text-sm leading-relaxed">
              No reflections yet. Your first conversation with your future self
              starts now.
            </p>
          </div>
        ) : (
          /* Returning User — Memory Highlights */
          <div className="mb-8">
            <p className="text-white/35 text-xs uppercase tracking-widest mb-4 text-center">
              Last time you reflected on
            </p>
            <div className="space-y-3">
              {recentEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="group rounded-xl border border-white/7 bg-white/3 hover:bg-white/5 hover:border-purple-500/20 backdrop-blur-sm px-5 py-4 transition-all duration-200 cursor-default"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">
                    {formatDate(entry.createdAt)}
                  </p>
                  <p className="text-white/75 text-sm leading-relaxed">
                    {truncate(entry.inputText)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/dashboard"
          className="block w-full py-3.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-purple-100 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 shadow-lg shadow-white/5 text-center"
        >
          {isNewUser ? 'Begin Reflection' : 'Continue Reflection'}
        </Link>

        {/* Footer */}
        <p className="text-center text-white/25 text-[10px] mt-8 leading-relaxed">
          Private by design. Your reflections remain yours.
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeUp {
          animation: fadeUp 0.9s ease both;
        }
      `}</style>
    </div>
  )
}
