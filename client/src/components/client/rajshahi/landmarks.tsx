export const Landmarks = {
  // ── Varendra Museum (বরেন্দ্র জাদুঘর) ──
  // Iconic red-brick building with central dome, arched windows, stepped facade
  VarendraMuseum: ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base platform */}
      <rect x="20" y="260" width="360" height="20" rx="2" />
      <rect x="30" y="250" width="340" height="14" rx="1" />

      {/* Main building body */}
      <rect x="50" y="120" width="300" height="132" rx="2" />

      {/* Left wing */}
      <rect x="50" y="150" width="60" height="102" />
      {/* Right wing */}
      <rect x="290" y="150" width="60" height="102" />

      {/* Central entrance arched doorway */}
      <rect x="170" y="180" width="60" height="72" />
      <path d="M170 180 Q200 140 230 180" />

      {/* Ground floor windows - arched */}
      <path d="M70 170 Q80 155 90 170 L90 200 L70 200 Z" />
      <path d="M110 170 Q120 155 130 170 L130 200 L110 200 Z" />
      <path d="M270 170 Q280 155 290 170 L290 200 L270 200 Z" />
      <path d="M310 170 Q320 155 330 170 L330 200 L310 200 Z" />

      {/* Upper floor windows */}
      <rect x="72" y="162" width="16" height="28" rx="8" />
      <rect x="112" y="162" width="16" height="28" rx="8" />
      <rect x="272" y="162" width="16" height="28" rx="8" />
      <rect x="312" y="162" width="16" height="28" rx="8" />

      {/* Stepped roofline / battlement */}
      <rect x="50" y="114" width="20" height="8" />
      <rect x="80" y="108" width="20" height="14" />
      <rect x="110" y="114" width="20" height="8" />
      <rect x="140" y="108" width="20" height="14" />

      <rect x="240" y="108" width="20" height="14" />
      <rect x="270" y="114" width="20" height="8" />
      <rect x="300" y="108" width="20" height="14" />
      <rect x="330" y="114" width="20" height="8" />

      {/* Central stepped dome */}
      <rect x="150" y="80" width="100" height="42" />
      <rect x="160" y="70" width="80" height="14" />
      <rect x="170" y="60" width="60" height="14" />
      <rect x="180" y="52" width="40" height="12" />
      <path d="M180 52 Q200 30 220 52" />
      <circle cx="200" cy="36" r="6" />

      {/* Corner minarets/towers */}
      <rect x="46" y="100" width="10" height="22" rx="3" />
      <circle cx="51" cy="96" r="6" />
      <rect x="344" y="100" width="10" height="22" rx="3" />
      <circle cx="349" cy="96" r="6" />

      {/* Second-level small minarets */}
      <rect x="155" y="66" width="6" height="16" rx="2" />
      <circle cx="158" cy="62" r="4" />
      <rect x="239" y="66" width="6" height="16" rx="2" />
      <circle cx="242" cy="62" r="4" />
    </svg>
  ),

  // ── Shahid Minar (শহীদ মিনার) ──
  // Tall central pillar with curved arch, flanked by smaller pillars
  ShahidMinar: ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 200 300"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base platform */}
      <rect x="10" y="260" width="180" height="20" rx="2" />
      <rect x="20" y="252" width="160" height="12" rx="1" />

      {/* Steps leading up */}
      <rect x="60" y="272" width="80" height="8" />
      <rect x="70" y="278" width="60" height="6" />

      {/* Left small pillar */}
      <rect x="40" y="170" width="12" height="84" rx="2" />
      <rect x="36" y="180" width="20" height="6" />
      <rect x="38" y="165" width="16" height="8" rx="2" />

      {/* Right small pillar */}
      <rect x="148" y="170" width="12" height="84" rx="2" />
      <rect x="144" y="180" width="20" height="6" />
      <rect x="146" y="165" width="16" height="8" rx="2" />

      {/* Main central pillar */}
      <rect x="85" y="80" width="30" height="174" rx="3" />

      {/* Curved arch top of central pillar */}
      <path d="M85 80 Q100 40 115 80" />
      <rect x="90" y="60" width="20" height="24" rx="2" />

      {/* Top ornament on central pillar */}
      <circle cx="100" cy="42" r="8" />
      <line x1="100" y1="34" x2="100" y2="20" strokeWidth="3" />
      <circle cx="100" cy="16" r="4" />

      {/* Connecting arches between pillars */}
      <path d="M52 170 Q70 140 85 160" fill="none" strokeWidth="2" />
      <path d="M115 160 Q130 140 148 170" fill="none" strokeWidth="2" />

      {/* Decorative horizontal bands */}
      <rect x="40" y="200" width="120" height="3" rx="1" />
      <rect x="40" y="220" width="120" height="3" rx="1" />

      {/* Base decorations */}
      <rect x="80" y="240" width="40" height="6" rx="1" />
    </svg>
  ),

  // ── Puthia Temple Complex (পুঠিয়া মন্দির) ──
  // Ornate terracotta temple with tall curved shikhara spire, multi-pinnacle top
  PuthiaTemple: ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 240 340"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base platform */}
      <rect x="20" y="300" width="200" height="20" rx="2" />
      <rect x="30" y="290" width="180" height="14" rx="1" />
      <rect x="40" y="282" width="160" height="12" rx="1" />

      {/* Main temple body */}
      <rect x="50" y="160" width="140" height="124" rx="2" />

      {/* Central arched entrance */}
      <rect x="95" y="210" width="50" height="74" />
      <path d="M95 210 Q120 185 145 210" />

      {/* Side arched niches */}
      <path d="M58 200 Q68 188 78 200 L78 220 L58 220 Z" />
      <path d="M162 200 Q172 188 182 200 L182 220 L162 220 Z" />

      {/* Terracotta decorative bands */}
      <rect x="50" y="210" width="140" height="3" />
      <rect x="50" y="240" width="140" height="3" />
      <rect x="50" y="265" width="140" height="3" />

      {/* Stepped tower base */}
      <rect x="65" y="140" width="110" height="24" />
      <rect x="75" y="120" width="90" height="24" />

      {/* Main shikhara (curved spire) */}
      <path d="M75 120 Q120 20 120 10 Q120 20 165 120" />

      {/* Spire pinnacle / amalaka */}
      <rect x="114" y="6" width="12" height="10" rx="1" />
      <circle cx="120" cy="4" r="5" />

      {/* Side mini spires (small shikharas) */}
      <path d="M65 140 Q60 120 55 115 Q62 120 67 138" />
      <path d="M175 140 Q180 120 185 115 Q178 120 173 138" />

      {/* Mini pinnacle tops */}
      <rect x="53" y="112" width="4" height="6" />
      <rect x="183" y="112" width="4" height="6" />

      {/* Upper band below spire */}
      <rect x="70" y="140" width="100" height="4" />

      {/* Window / grill details on upper tower */}
      <rect x="110" y="155" width="20" height="14" rx="3" />
      <line x1="120" y1="155" x2="120" y2="169" />
    </svg>
  ),

  // ── Boro Kuthi (বড় কুঠি) ──
  // Historic Dutch trading post gateway — grand arch, geometric pattern
  BoroKuthi: ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 300 280"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base */}
      <rect x="20" y="242" width="260" height="18" rx="2" />
      <rect x="30" y="234" width="240" height="10" rx="1" />

      {/* Left thick pillar */}
      <rect x="35" y="70" width="30" height="166" rx="3" />
      {/* Right thick pillar */}
      <rect x="235" y="70" width="30" height="166" rx="3" />

      {/* Top beam / entablature */}
      <rect x="30" y="60" width="240" height="20" rx="2" />
      <rect x="35" y="52" width="230" height="12" rx="1" />

      {/* Central grand arch */}
      <path d="M65 140 Q150 30 235 140" />
      <rect x="65" y="140" width="170" height="96" />

      {/* Inner arch detail */}
      <path d="M80 140 Q150 50 220 140" fill="none" strokeWidth="2" />

      {/* Arch keystone */}
      <rect x="145" y="55" width="10" height="14" rx="1" />

      {/* Side pillars' capital decorations */}
      <rect x="33" y="55" width="34" height="8" rx="1" />
      <rect x="233" y="55" width="34" height="8" rx="1" />

      {/* Decorative geometric patterns on pillars */}
      {/* Diamond shapes on left pillar */}
      <polygon points="50,100 58,110 50,120 42,110" />
      <polygon points="50,130 58,140 50,150 42,140" />
      <polygon points="50,160 58,170 50,180 42,170" />
      {/* Diamond shapes on right pillar */}
      <polygon points="250,100 258,110 250,120 242,110" />
      <polygon points="250,130 258,140 250,150 242,140" />
      <polygon points="250,160 258,170 250,180 242,170" />

      {/* Horizontal bands on pillars */}
      <rect x="35" y="110" width="30" height="3" />
      <rect x="35" y="150" width="30" height="3" />
      <rect x="35" y="190" width="30" height="3" />
      <rect x="235" y="110" width="30" height="3" />
      <rect x="235" y="150" width="30" height="3" />
      <rect x="235" y="190" width="30" height="3" />

      {/* Top decorative merlon/large triangles */}
      <polygon points="40,52 50,30 60,52" />
      <polygon points="80,52 90,30 100,52" />
      <polygon points="120,52 130,30 140,52" />
      <polygon points="160,52 170,30 180,52" />
      <polygon points="200,52 210,30 220,52" />
      <polygon points="240,52 250,30 260,52" />

      {/* Ground-level small arched door */}
      <path d="M130 210 Q140 195 150 210 L150 238 L130 238 Z" />
      <rect x="135" y="215" width="10" height="23" rx="1" />
    </svg>
  ),

  // ── Padma River (পদ্মা নদী) ──
  // Flowing water, waves, river bank
  PadmaRiver: ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Far wave */}
      <path d="M0 40 Q80 25 160 35 Q240 45 320 30 Q400 15 480 28 Q560 42 640 32 Q720 22 800 36 Q880 50 960 38 Q1040 26 1120 40 Q1200 54 1280 42 Q1360 30 1440 44 L1440 120 L0 120 Z" />
      {/* Mid wave */}
      <path d="M0 55 Q100 40 200 50 Q300 60 400 45 Q500 30 600 48 Q700 66 800 52 Q900 38 1000 55 Q1100 72 1200 58 Q1300 44 1400 60 L1440 64 L1440 120 L0 120 Z" opacity="0.7" />
      {/* Near wave */}
      <path d="M0 72 Q60 62 120 68 Q180 74 240 64 Q300 54 360 66 Q420 78 480 70 Q540 62 600 74 Q660 86 720 76 Q780 66 840 78 Q900 90 960 80 Q1020 70 1080 82 Q1140 94 1200 84 Q1260 74 1320 86 Q1380 98 1440 88 L1440 120 L0 120 Z" opacity="0.5" />
      {/* Shore/bank line */}
      <path d="M0 120 L0 110 Q200 105 400 108 Q600 111 800 106 Q1000 101 1200 107 Q1320 110 1440 108 L1440 120 Z" opacity="0.3" />
    </svg>
  ),

  // ── Traditional Boat (নৌকা) ──
  // Long wooden boat with curved prow, common on Padma
  Boat: ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 100 30"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hull */}
      <path d="M2 12 C5 6 12 3 20 3 L80 3 C88 3 95 6 98 12 L94 18 L88 21 L80 22 L20 22 L12 21 L6 18 Z" />
      {/* Bow ornament */}
      <path d="M2 12 C-1 10 0 8 3 7 L6 10 Z" />
      {/* Stern ornament */}
      <path d="M98 12 C101 10 100 8 97 7 L94 10 Z" />
      {/* Deck */}
      <rect x="15" y="6" width="70" height="3" rx="1" />
      {/* Mast */}
      <line x1="50" y1="3" x2="50" y2="-12" strokeWidth="1.5" />
      {/* Sail */}
      <path d="M50 -10 Q70 -5 50 0" />
      {/* Oars */}
      <line x1="25" y1="6" x2="18" y2="14" strokeWidth="0.8" />
      <line x1="35" y1="6" x2="28" y2="14" strokeWidth="0.8" />
      <line x1="65" y1="6" x2="72" y2="14" strokeWidth="0.8" />
      <line x1="75" y1="6" x2="82" y2="14" strokeWidth="0.8" />
      {/* Water ripple under boat */}
      <ellipse cx="50" cy="24" rx="48" ry="3" opacity="0.4" />
    </svg>
  ),
};
