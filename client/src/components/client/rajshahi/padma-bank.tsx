import { Landmarks } from "./landmarks";
import { Textures } from "./textures";

type Variant = "full" | "subtle" | "minimal";

export function PadmaBank({
  children,
  variant = "subtle",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <div className="relative">
      {/* ── Layer 1: Silk weave pattern (faint, full-page) ── */}
      <div
        className="pointer-events-none fixed inset-0 select-none"
        style={{ backgroundImage: Textures.silk }}
      />

      {/* ── Layer 2: Landmark SVG silhouettes ── */}
      {variant !== "minimal" && (
        <>
          {/* Varendra Museum — large, right side */}
          <div className="pointer-events-none fixed right-0 top-[15%] h-[50vh] w-[40vw] select-none opacity-[0.09]">
            <Landmarks.VarendraMuseum className="h-full w-full" />
          </div>

          {/* Shahid Minar — tall, far left */}
          <div className="pointer-events-none fixed left-[1%] top-[20%] h-[45vh] w-[15vw] select-none opacity-[0.07]">
            <Landmarks.ShahidMinar className="h-full w-full" />
          </div>

          {/* Puthia Temple — mid-left */}
          <div className="pointer-events-none fixed left-[5%] top-[30%] h-[38vh] w-[14vw] select-none opacity-[0.07]">
            <Landmarks.PuthiaTemple className="h-full w-full" />
          </div>

          {/* Boro Kuthi — bottom right */}
          <div className="pointer-events-none fixed right-[5%] bottom-[16%] h-[20vh] w-[18vw] select-none opacity-[0.06]">
            <Landmarks.BoroKuthi className="h-full w-full" />
          </div>
        </>
      )}

      {/* ── Layer 4: Padma River animated waves ── */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 select-none overflow-hidden">
        <div className={`relative w-[200%] ${variant === "minimal" ? "h-20" : "h-32"} animate-wave`}>
          <Landmarks.PadmaRiver
            className={`absolute bottom-0 left-0 w-1/2 ${
              variant === "minimal" ? "h-full opacity-[0.08]" : "h-full opacity-[0.12]"
            }`}
          />
          <Landmarks.PadmaRiver
            className={`absolute bottom-0 right-0 w-1/2 ${
              variant === "minimal" ? "h-full opacity-[0.08]" : "h-full opacity-[0.12]"
            }`}
          />
          {variant !== "minimal" && (
            <>
              <Landmarks.PadmaRiver className="absolute -bottom-2 left-0 w-1/2 h-3/4 opacity-[0.06]" />
              <Landmarks.PadmaRiver className="absolute -bottom-2 right-0 w-1/2 h-3/4 opacity-[0.06]" />
            </>
          )}
        </div>
      </div>

      {/* Boat on the river */}
      {variant === "full" && (
        <div className="pointer-events-none fixed bottom-[10%] right-[18%] select-none">
          <div className="w-[140px] opacity-[0.08]">
            <Landmarks.Boat />
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
