'use client';

import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Settings() {
  const router = useRouter();
  
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Stripe Connect & Issuing Demo
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Live coding demonstration of Stripe Connect and Issuing capabilities
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
                              Demo Story: Olivia Dubois at Test London Ltd
          </h2>
          <p className="text-blue-800">
            Follow along as we build a complete corporate card platform, from company onboarding 
            to employee card creation with spending controls and real-time transaction monitoring.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            1. Connect Onboarding
          </h3>
          <p className="text-gray-600 mb-4">
                              Set up Test London Ltd as a connected account using Stripe's embedded onboarding
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Start Onboarding →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            2. Customer Dashboard
          </h3>
          <p className="text-gray-600 mb-4">
            View account balance, funding capabilities, and account management
          </p>
          <button
            onClick={() => router.push('/customer-dashboard')}
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            View Dashboard →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            3. Card Management
          </h3>
          <p className="text-gray-600 mb-4">
            Create cardholders and issue cards with spending controls
          </p>
          <button
            onClick={() => router.push('/manage-cards')}
            className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
          >
            Manage Cards →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            4. Webhook Monitoring
          </h3>
          <p className="text-gray-600 mb-4">
            Real-time event monitoring and transaction tracking
          </p>
          <a 
            href="/webhooks" 
            className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
          >
            View Events →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            5. Issuing Transactions Simulation
          </h3>
          <p className="text-gray-600 mb-4">
            Test MCC controls with different merchant scenarios
          </p>
          <a 
            href="/checkout" 
            className="inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Test Payments →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            Technical Stack
          </h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>• Next.js 15 with App Router</li>
            <li>• Stripe Connect & Issuing</li>
            <li>• TypeScript & Tailwind CSS</li>
            <li>• Real-time webhooks</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-3">
          🎯 Demo Objectives
        </h2>
        <ul className="text-green-800 space-y-2">
          <li>• Demonstrate the simplicity of Stripe's APIs</li>
          <li>• Show real-time transaction monitoring capabilities</li>
          <li>• Highlight granular spending controls and MCC filtering</li>
          <li>• Showcase embedded UI components for faster development</li>
        </ul>
      </div>
    </div>
  );
} 