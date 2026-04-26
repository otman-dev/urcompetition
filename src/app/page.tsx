'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuthenticated(false);
      router.push('/');
    }
  };

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setAuthenticated(data.authenticated);
      } catch {
        setAuthenticated(false);
      }
    };

    fetchAuth();
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 30,
        y: (e.clientY / window.innerHeight) * 30,
      });
    };
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / maxScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transform-gpu z-50"
        style={{ transform: `scaleX(${scrollProgress / 100})`, transformOrigin: 'left' }}
      />

      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),rgba(79,70,229,0))]"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.1)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-blue-400/20 to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-radial from-purple-400/20 to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-indigo-400/20 to-transparent rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Hero Content */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Text Content */}
              <div 
                className="flex-1 text-center lg:text-left"
                style={{
                  transform: isLoaded ? 'translateX(0)' : 'translateX(-2rem)',
                  opacity: isLoaded ? 1 : 0,
                  transition: 'all 1s ease-out',
                }}
              >
                <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-8">
                  <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                    <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:bg-gradient-to-l cursor-default">
                      URCompetition
                      <span className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </span>
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed">
                  Experience the future of robotics competitions with real-time scoring, precision timing, and live rankings.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
                  {authenticated === false ? (
                    <>
                      <Link href="/login" className="group perspective">
                        <button className="relative w-full sm:w-auto px-8 py-4 text-lg bg-indigo-600 text-white rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] overflow-hidden">
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7-7 7" />
                            </svg>
                            Login to access the app
                          </span>
                        </button>
                      </Link>
                      <div className="w-full sm:w-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                        Register and scoreboard access require signing in first.
                      </div>
                    </>
                  ) : authenticated === true ? (
                    <>
                      <Link href="/register" className="group perspective">
                        <button className="relative w-full sm:w-auto px-8 py-4 text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] overflow-hidden group-hover:animate-shine">
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Register a Team
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-180"/>
                        </button>
                      </Link>
                      <Link href="/scoreboard" className="group perspective">
                        <button className="relative w-full sm:w-auto px-8 py-4 text-lg bg-white text-indigo-600 border-2 border-indigo-600/20 rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-[0_8px_30px_rgba(79,70,229,0.2)] hover:border-indigo-600">
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                            View Scoreboard
                          </span>
                        </button>
                      </Link>
                      <Link href="/admin/users" className="group perspective">
                        <button className="relative w-full sm:w-auto px-8 py-4 text-lg bg-slate-900 text-white rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-[0_8px_30px_rgba(15,23,42,0.3)]">
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            Manage Users
                          </span>
                        </button>
                      </Link>
                      <Link href="/admin/config" className="group perspective">
                        <button className="relative w-full sm:w-auto px-8 py-4 text-lg bg-slate-700 text-white rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-[0_8px_30px_rgba(15,23,42,0.3)]">
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            Configure Challenges
                          </span>
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="relative w-full sm:w-auto px-8 py-4 text-lg bg-red-600 text-white rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-[0_8px_30px_rgba(220,38,38,0.3)]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
                          </svg>
                          Logout
                        </span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full sm:w-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      Loading authentication status...
                    </div>
                  )}
                </div>
              </div>

              {/* Hero Image */}
              <div 
                className="flex-1 relative"
                style={{
                  transform: isLoaded ? 'translateX(0)' : 'translateX(2rem)',
                  opacity: isLoaded ? 1 : 0,
                  transition: 'all 1s ease-out',
                  transitionDelay: '300ms',
                }}
              >
                <Image
                  src="/robot.svg"
                  alt="Robot illustration"
                  width={600}
                  height={600}
                  className="w-full h-auto max-w-lg mx-auto animate-float"
                  priority
                />
              </div>
            </div>

            {/* Feature Cards */}
            <div 
              className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
              style={{
                transform: isLoaded ? 'translateY(0)' : 'translateY(2rem)',
                opacity: isLoaded ? 1 : 0,
                transitionDelay: '600ms',
              }}
            >
              {[
                {
                  title: 'Fair Scoring',
                  description: 'Automated and transparent scoring system ensuring fairness across all challenges',
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="blue" fill="none" />
                  ),
                  color: 'blue'
                },
                {
                  title: 'Time Tracking',
                  description: 'High-precision timing system accurate to the millisecond for all team performances',
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="blue" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ),
                  color: 'blue'
                },
                {
                  title: 'Live Rankings',
                  description: 'Real-time leaderboard updates with instant scoring and rank calculations',
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="blue" fill="none" />
                  ),
                  color: 'indigo'
                }
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `perspective(1000px) rotateX(${mousePosition.y / 50}deg) rotateY(${mousePosition.x / 50}deg)`,
                  }}
                >
                  {/* Feature Card Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50" />
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500" />
                  
                  <div className="relative">
                    <div className={`w-16 h-16 mb-6 rounded-xl flex items-center justify-center transition-all duration-500 transform ${
                      activeFeature === index ? 'scale-110 rotate-6' : ''
                    } bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100/80 group-hover:shadow-lg`}>
                      <svg className="w-8 h-8" style={{ color: `var(--tw-text-${feature.color}-600)` }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {feature.icon}
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 transition-transform duration-300 group-hover:scale-105">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed transition-all duration-300 group-hover:text-gray-800">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div 
        className="relative py-24 bg-gradient-to-b from-transparent via-indigo-50/50 to-transparent"
        style={{
          transform: isLoaded ? 'translateY(0)' : 'translateY(2rem)',
          opacity: isLoaded ? 1 : 0,
          transition: 'all 1s ease-out',
          transitionDelay: '900ms',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100+', label: 'Teams' },
              { value: '50+', label: 'Challenges' },
              { value: '1000+', label: 'Participants' },
              { value: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={stat.label} className="group">
                <div className="text-4xl font-bold text-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="relative py-12 bg-gradient-to-t from-white/80 to-transparent"
        style={{
          transform: isLoaded ? 'translateY(0)' : 'translateY(2rem)',
          opacity: isLoaded ? 1 : 0,
          transition: 'all 1s ease-out',
          transitionDelay: '1200ms',
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Créé par{' '}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 cursor-default">
              MOUHIB Otman
            </span>
            <span className="mx-2">•</span>
            <span className="text-gray-500">{new Date().getFullYear()}</span>
          </p>
        </div>
      </footer>
    </main>
  );
}