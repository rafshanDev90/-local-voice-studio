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
      {/* ── Background CSS textures ── */}
      <div
        className="pointer-events-none fixed inset-0 select-none"
        style={{ backgroundImage: Textures.brick }}
      />
      <div
        className="pointer-events-none fixed right-0 top-0 h-full w-1/3 select-none"
        style={{ backgroundImage: Textures.geoArch }}
      />
      {variant !== "minimal" && (
        <div
          className="pointer-events-none fixed left-0 top-0 h-full w-32 select-none"
          style={{ backgroundImage: Textures.column }}
        />
      )}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-64 select-none"
        style={{ backgroundImage: Textures.ripple }}
      />

      {/* ── Landmark SVG silhouettes ── */}
      {variant !== "minimal" && (
        <>
          {/* Varendra Museum — large, right side */}
          <div className="pointer-events-none fixed right-0 top-[15%] h-[50vh] w-[40vw] select-none opacity-10">
            <Landmarks.VarendraMuseum className="h-full w-full" />
          </div>

          {/* Shahid Minar — tall, left side */}
          <div className="pointer-events-none fixed left-[1%] top-[20%] h-[45vh] w-[15vw] select-none opacity-[0.08]">
            <Landmarks.ShahidMinar className="h-full w-full" />
          </div>

          {/* Boro Kuthi — bottom right */}
          <div className="pointer-events-none fixed right-[5%] bottom-[18%] h-[22vh] w-[20vw] select-none opacity-[0.08]">
            <Landmarks.BoroKuthi className="h-full w-full" />
          </div>
        </>
      )}

      {/* Padma River waves — bottom */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 select-none">
        <div className={`relative w-full ${variant === "minimal" ? "h-20" : "h-32"}`}>
          <Landmarks.PadmaRiver
            className={`absolute bottom-0 left-0 w-full ${
              variant === "minimal" ? "h-full opacity-[0.08]" : "h-full opacity-[0.12]"
            }`}
          />
          {variant !== "minimal" && (
            <Landmarks.PadmaRiver className="absolute -bottom-2 left-0 w-full h-3/4 opacity-[0.06]" />
          )}
        </div>
      </div>

      {/* Boat — on the river (full variant only) */}
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
