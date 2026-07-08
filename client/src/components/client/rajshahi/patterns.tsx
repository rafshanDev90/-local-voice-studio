"use client";

const brickGradient = `repeating-linear-gradient(
  90deg,
  transparent,
  transparent 58px,
  rgba(180, 70, 50, 0.04) 58px,
  rgba(180, 70, 50, 0.04) 60px
),
repeating-linear-gradient(
  0deg,
  transparent,
  transparent 28px,
  rgba(180, 70, 50, 0.04) 28px,
  rgba(180, 70, 50, 0.04) 30px
),
repeating-linear-gradient(
  90deg,
  transparent,
  transparent 29px,
  rgba(180, 70, 50, 0.02) 29px,
  rgba(180, 70, 50, 0.02) 30px
)`;

export function RajshahiBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Varendra brick texture — top-left region */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: brickGradient }}
      />
      {/* Padma wave — bottom edge */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-48 opacity-[0.03]"
        style={{
          background: `repeat-x`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120'%3E%3Cpath fill='%231563b8' d='M0,64L60,74.7C120,85,240,107,360,101.3C480,96,600,64,720,58.7C840,53,960,75,1080,80C1200,85,1320,75,1380,69.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z'/%3E%3C/svg%3E")`,
          backgroundSize: "1440px 120px",
        }}
      />
      {/* Mango leaf motif — scattered */}
      <div
        className="pointer-events-none fixed right-0 top-1/4 h-96 w-96 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10 C55 10 65 25 65 40 C65 55 55 70 50 75 C45 70 35 55 35 40 C35 25 45 10 50 10Z' fill='%234a7c59'/%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
          backgroundRepeat: "repeat",
        }}
      />
      {children}
    </div>
  );
}
