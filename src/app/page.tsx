import Link from "next/link";

export default function Home() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <Link href="/onboarding" className="block w-full h-full cursor-pointer group">
        <div className="w-full h-full flex items-center justify-center transition-all duration-500 group-hover:scale-105 bg-snackpack-hero">
          <div className="text-center text-white px-8 max-w-6xl">
            {/* Pluxee Logo Area */}
            <div className="mb-8">
              <div className="text-2xl font-semibold text-pluxee-green mb-2">PLUXEE</div>
              <div className="w-32 h-1 bg-pluxee-green mx-auto opacity-80"></div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 opacity-95 font-pluxee">
              SnackPack
            </h1>
            <p className="text-xl md:text-2xl opacity-80 mb-4">
              The SME Benefits Revolution
            </p>
            <p className="text-lg md:text-xl opacity-70 mb-8 max-w-4xl mx-auto">
              From 18-month banking delays to 60-day MVP launch.<br />
              Modern employee benefits for the SME market.
            </p>
            
            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm md:text-base opacity-75">
              <div className="flex items-center gap-2">
                <span className="text-meal">🍽️</span>
                <span>Meal Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-transport">🚗</span>
                <span>Transport Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-wellness">💪</span>
                <span>Wellness Wallet</span>
              </div>
            </div>
            
            <div className="text-lg opacity-60 animate-pulse">
              Click anywhere to start the SnackPack demo
            </div>
            
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm opacity-50">
              Powered by Stripe • Built for SMEs • Launching in 60 days
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
