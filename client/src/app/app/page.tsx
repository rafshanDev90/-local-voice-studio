"use client";

import Sidebar from "~/components/client/sidebar";
import { HeroSection } from "~/components/client/rajshahi/hero-section";
import { ProductShowcase } from "~/components/client/rajshahi/product-showcase";
import { FeaturesGrid } from "~/components/client/rajshahi/features-grid";
import { TechStack } from "~/components/client/rajshahi/tech-stack";

export default function AppHomePage() {
  return (
    <div className="flex h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border/70 bg-white/70 backdrop-blur-sm px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-maroon text-[11px] font-bold text-white">
              RV
            </span>
            <span className="text-sm font-medium text-text-primary">
              Rajshahi Voice Studio
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-3 py-1 text-[11px] font-medium text-brand-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald" />
            All systems online
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <HeroSection />
          <ProductShowcase />
          <FeaturesGrid />
          <TechStack />
        </main>
      </div>
    </div>
  );
}
