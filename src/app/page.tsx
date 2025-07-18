import Link from "next/link";

export default function Home() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <Link href="/onboarding" className="block w-full h-full cursor-pointer group">
        <div 
          className="w-full h-full flex items-center justify-center transition-all duration-500 group-hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="text-center text-white px-8 max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 opacity-90">
              Stripe Demo
            </h1>
            <p className="text-xl md:text-2xl opacity-75 mb-8">
              Complete card issuing and connect platform demonstration
            </p>
            <div className="text-lg opacity-60">
              Click anywhere to start the demo
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
