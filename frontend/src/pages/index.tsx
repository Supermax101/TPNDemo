import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isFlying, setIsFlying] = useState(false);

  const handleRunDemo = () => {
    setIsFlying(true);
    // Wait for animation to complete before navigating
    setTimeout(() => {
      router.push("/app/mock");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-300 to-cyan-200 relative overflow-hidden">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-white rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Clouds */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cloud 1 */}
        <div className="absolute top-20 left-0 animate-float-slow">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white bg-opacity-40 rounded-full blur-sm"></div>
            <div className="w-20 h-20 bg-white bg-opacity-30 rounded-full blur-sm -ml-6"></div>
            <div className="w-14 h-14 bg-white bg-opacity-35 rounded-full blur-sm -ml-8"></div>
          </div>
        </div>

        {/* Cloud 2 */}
        <div className="absolute top-40 right-10 animate-float-medium">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full blur-sm"></div>
            <div className="w-16 h-16 bg-white bg-opacity-25 rounded-full blur-sm -ml-4"></div>
            <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full blur-sm -ml-6"></div>
          </div>
        </div>

        {/* Cloud 3 */}
        <div className="absolute bottom-60 left-1/4 animate-float-fast">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-white bg-opacity-35 rounded-full blur-sm"></div>
            <div className="w-18 h-18 bg-white bg-opacity-25 rounded-full blur-sm -ml-5"></div>
            <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full blur-sm -ml-7"></div>
          </div>
        </div>

        {/* Cloud 4 */}
        <div className="absolute bottom-32 right-1/3 animate-float-slow">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white bg-opacity-25 rounded-full blur-sm"></div>
            <div className="w-14 h-14 bg-white bg-opacity-30 rounded-full blur-sm -ml-3"></div>
            <div className="w-8 h-8 bg-white bg-opacity-25 rounded-full blur-sm -ml-5"></div>
          </div>
        </div>
      </div>

      {/* Bottom Clouds */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none">
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,80 C100,130 200,40 300,90 C400,140 500,50 600,100 C700,150 800,60 900,110 C1000,160 1100,70 1200,120 L1200,200 L0,200 Z"
                fill="rgba(255,255,255,0.25)" />
          <path d="M0,100 C150,150 300,50 450,100 C600,150 750,50 900,100 C1050,150 1200,50 1200,100 L1200,200 L0,200 Z"
                fill="rgba(255,255,255,0.35)" />
          <path d="M0,120 C200,170 400,70 600,120 C800,170 1000,70 1200,120 L1200,200 L0,200 Z"
                fill="rgba(255,255,255,0.45)" />
          <path d="M0,140 C300,190 600,90 900,140 C1050,180 1200,100 1200,140 L1200,200 L0,200 Z"
                fill="rgba(255,255,255,0.55)" />
          <path d="M0,160 C250,200 500,120 750,160 C900,190 1050,130 1200,170 L1200,200 L0,200 Z"
                fill="rgba(255,255,255,0.65)" />
        </svg>
      </div>

      {/* Header */}
      <nav className="flex justify-start items-center px-12 py-6 relative z-10">
        <img 
          src="/logo.png" 
          alt="TakeoffAI Logo" 
          className="h-12 w-auto object-contain ml-12"
        />
      </nav>

      {/* Hero Section - Clean and Minimal */}
      <main className="mx-auto px-12 py-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[75vh] max-w-7xl">
          <div className="flex flex-col justify-start pl-12">
            <h2 className="text-4xl lg:text-5xl font-medium text-white leading-tight animate-fade-in-up text-left mb-8">
              Health optimization begins at birth
            </h2>
            <p className="text-xl lg:text-2xl text-white text-opacity-95 font-normal leading-relaxed animate-fade-in-up delay-200 text-left mb-8">
              At Takeoff41, we leverage advanced AI to improve perinatal care.
            </p>
            <p className="text-base lg:text-lg text-white text-opacity-90 font-light leading-relaxed animate-fade-in-up delay-400 text-left mb-8">
              We are developing science-backed, data-driven treatments for perinatal care — empowering clinicians and improving outcomes for the most vulnerable population.
            </p>
            <div className="space-y-3 animate-fade-in-up delay-500 pt-6 text-left">
              <p className="text-sm lg:text-base text-white text-opacity-85 font-light">
                See Takeoff41's TPN2.0 in action
              </p>
              <div>
                <button 
                  onClick={handleRunDemo}
                  className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-3 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-base"
                >
                  Run the Demo
                </button>
              </div>
            </div>
          </div>

          {/* Flying Baby Character - Prominently positioned */}
          <div className="flex justify-center lg:justify-end items-center relative">
            <img
              src="/Group-46.png"
              alt="Flying baby character"
              className={`w-72 h-72 lg:w-[400px] lg:h-[400px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-20 lg:translate-x-40 ${
                isFlying ? 'animate-superman-fly' : 'animate-float-gentle'
              }`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
