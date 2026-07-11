"use client";

import { ReactNode, useEffect } from "react";
import { ServiceType } from "~/types/services";
import Sidebar from "./sidebar";
import { useUIStore } from "~/stores/ui-store";
import { IoClose, IoMenu } from "react-icons/io5";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SpeechSidebar } from "./speech-synthesis/right-sidebar";

import { MobileSettingsButton } from "./speech-synthesis/mobile-settings-button";
import { PadmaBank } from "./rajshahi/padma-bank";

interface TabItem {
  name: string;
  path: string;
}

export function PageLayout({
  title,
  children,
  service,
  tabs,
  showSidebar = true,
}: {
  title: string;
  children: ReactNode;
  service: ServiceType;
  tabs?: TabItem[];
  showSidebar: boolean;
}) {
  const pathname = usePathname();
  const {
    isMobileDrawerOpen,
    isMobileScreen,
    isMobileMenuOpen,
    toggleMobileDrawer,
    setMobileScreen,
    toggleMobileMenu,
  } = useUIStore();

  useEffect(() => {
    const checkScreenSize = () => {
      setMobileScreen(window.innerWidth < 1024);
    };
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [setMobileScreen]);

  return (
    <PadmaBank variant="subtle">
    <div className="flex h-screen bg-brand-cream/70">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {isMobileScreen && isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={toggleMobileDrawer}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-surface shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={toggleMobileDrawer}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary"
        >
          <IoClose className="h-5 w-5" />
        </button>
        <Sidebar isMobile />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-border bg-white/80 backdrop-blur-sm px-5">
          {isMobileScreen && (
            <button
              onClick={toggleMobileDrawer}
              className="-ml-1 rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-secondary"
            >
              <IoMenu className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-sm font-semibold text-text-primary">{title}</h1>

          {tabs && tabs.length > 0 && (
            <div className="ml-2 flex items-center gap-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    pathname === tab.path
                      ? "bg-neutral-100 text-text-primary"
                      : "text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="flex h-full flex-col p-5 md:p-6 lg:p-8">
              {children}
            </div>
          </main>

          {showSidebar && service && (
            <SpeechSidebar service={service} />
          )}
        </div>

        {isMobileScreen && !pathname.includes("/app/sound-effects") && (
          <MobileSettingsButton toggleMobileMenu={toggleMobileMenu} />
        )}


      </div>
    </div>
    </PadmaBank>
  );
}
