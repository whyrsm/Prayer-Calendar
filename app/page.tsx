'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-primary/5 blur-3xl opacity-60 animate-fade-in"></div>
        <div className="absolute top-[40%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-secondary/5 blur-3xl opacity-60 animate-fade-in delay-75"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">

          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6 ring-1 ring-primary/20 shadow-sm">
              <span className="text-4xl">🕌</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
              Prayer <span className="text-gradient">Calendar</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              Harmonize your schedule with your faith. <br />
              <span className="text-primary font-medium">Seamlessly sync</span> prayer times to your Google Calendar.
            </p>
          </div>

          {/* Login Button */}
          <div className="pt-8">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-200 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-primary/30"
            >
              <div className="absolute inset-0 w-full h-full rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 pt-16 text-left">
            <FeatureCard
              icon="🔄"
              title="Auto-Sync Daily"
              description="Your calendar stays up-to-date automatically, every single day."
            />
            <FeatureCard
              icon="🔔"
              title="Smart Reminders"
              description="Get notified 10 minutes before Adzan so you're always prepared."
            />
            <FeatureCard
              icon="🇮🇩"
              title="Indonesia Wide"
              description="Accurate calculation methods from Kemenag RI for all cities."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="glass-panel p-8 rounded-2xl hover:bg-white/40 transition-all duration-300 hover:-translate-y-1">
      <div className="text-4xl mb-4 bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
