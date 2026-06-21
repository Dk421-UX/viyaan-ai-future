'use client'

import Image from 'next/image'

export default function LoginPage() {
  function handleGoogleLogin() {
    window.location.href = '/api/auth/google/redirect'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#080808] text-white relative overflow-hidden">
      {/* 🔮 Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-purple-500/10 blur-3xl rounded-full top-[-150px] left-1/2 -translate-x-1/2 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      <div className="w-full max-w-sm relative z-10 text-center">
        {/* Header */}
        <div className="mb-12 animate-fadeUp">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <Image
              src="/viyaan-logo.png"
              alt="Viyaan AI"
              width={54}
              height={54}
              className="rounded-xl shadow-lg shadow-purple-500/30"
            />
          </div>

          <h1 className="text-3xl font-light mb-2">
            Welcome Back
          </h1>

          <p className="text-white/50 text-sm">
            Meet Your Future Self
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-4 animate-fadeUp">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-accent hover:text-black hover:scale-[1.01] transition shadow-lg shadow-white/5 flex items-center justify-center gap-3 active:scale-[0.99]"
          >
            {/* Google Icon Representation */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.887l-10.617-.322z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer Supporting Copy */}
        <p className="text-center text-white/30 text-[10px] mt-8 leading-relaxed">
          Private by design.<br />
          Your reflections stay connected to your account.
        </p>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeUp {
          animation: fadeUp 0.8s ease;
        }
      `}</style>
    </div>
  )
}