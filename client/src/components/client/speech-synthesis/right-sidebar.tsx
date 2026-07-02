"use client";

import { useUIStore } from "~/stores/ui-store";
import { ServiceType } from "~/types/services";
import { VoiceSelector } from "../voice-selector";
import { HistoryPanel } from "./history-panel";
import { AudioSlider } from "../audio-slider";
import { useAudioConfig } from "~/stores/audio-config";
import { useState } from "react";
import { IoClose, IoSettingsOutline, IoTimeOutline } from "react-icons/io5";

export function SpeechSidebar({
  service,
}: {
  service: ServiceType;
}) {
  const {
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    toggleMobileMenu,
    isMobileScreen,
  } = useUIStore();

  const { speed, stability, styleExaggeration, setSpeed, setStability, setStyleExaggeration, reset } =
    useAudioConfig();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "settings" as const, label: "Settings", icon: <IoSettingsOutline className="h-3.5 w-3.5" /> },
    { id: "history" as const, label: "History", icon: <IoTimeOutline className="h-3.5 w-3.5" /> },
  ];

  return (
    <>
      <aside className="hidden h-full w-80 flex-col border-l border-border bg-surface md:flex">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border px-4 pt-3 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-neutral-100 text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {activeTab === "settings" ? (
            <div className="space-y-6">
              <section>
                <h2 className="mb-2 text-xs font-medium text-text-secondary">
                  Voice
                </h2>
                <VoiceSelector service={service} />
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-medium text-text-secondary">
                    Audio Configuration
                  </h2>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-2xs text-text-tertiary underline transition hover:text-text-secondary"
                  >
                    Reset
                  </button>
                </div>
                <AudioSlider
                  label="Speed"
                  value={speed}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  leftLabel="Slower"
                  rightLabel="Faster"
                  onChange={setSpeed}
                />
                <AudioSlider
                  label="Stability"
                  value={stability}
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  leftLabel="More variable"
                  rightLabel="More stable"
                  onChange={setStability}
                />
                <AudioSlider
                  label="Style Exaggeration"
                  value={styleExaggeration}
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  leftLabel="None"
                  rightLabel="Exaggerated"
                  onChange={setStyleExaggeration}
                />
              </section>
            </div>
          ) : (
            <HistoryPanel
              service={service}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
            />
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileScreen && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transform rounded-t-xl bg-surface shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh" }}
      >
        <div className="overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-neutral-100 text-text-primary"
                      : "text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-secondary"
            >
              <IoClose className="h-4 w-4" />
            </button>
          </div>

          {activeTab === "settings" ? (
            <div className="space-y-6">
              <section>
                <h2 className="mb-2 text-xs font-medium text-text-secondary">
                  Voice
                </h2>
                <VoiceSelector service={service} />
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-medium text-text-secondary">
                    Audio Configuration
                  </h2>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-2xs text-text-tertiary underline transition hover:text-text-secondary"
                  >
                    Reset
                  </button>
                </div>
                <AudioSlider
                  label="Speed"
                  value={speed}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  leftLabel="Slower"
                  rightLabel="Faster"
                  onChange={setSpeed}
                />
                <AudioSlider
                  label="Stability"
                  value={stability}
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  leftLabel="More variable"
                  rightLabel="More stable"
                  onChange={setStability}
                />
                <AudioSlider
                  label="Style Exaggeration"
                  value={styleExaggeration}
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  leftLabel="None"
                  rightLabel="Exaggerated"
                  onChange={setStyleExaggeration}
                />
              </section>
            </div>
          ) : (
            <HistoryPanel
              service={service}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
            />
          )}
        </div>
      </div>
    </>
  );
}
