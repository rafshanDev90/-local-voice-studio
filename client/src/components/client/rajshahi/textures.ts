// Rajshahi brand colors
export const Brand = {
  maroon: "#6b1a1a",
  emerald: "#2e6b3e",
  mustard: "#c4943a",
  cream: "#fdf8f3",
  brownGray: "#6b5c4c",
};

// CSS texture patterns
export const Textures = {
  // Varendra Museum — red-brick masonry
  brick: [
    "repeating-linear-gradient(90deg,transparent,transparent 58px,rgba(180,70,50,0.07) 58px,rgba(180,70,50,0.07) 60px)",
    "repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(180,70,50,0.07) 28px,rgba(180,70,50,0.07) 30px)",
    "repeating-linear-gradient(90deg,transparent,transparent 29px,rgba(180,70,50,0.035) 29px,rgba(180,70,50,0.035) 30px)",
  ].join(","),

  // Rajshahi Silk — diamond weave pattern (SVG data URI)
  silk: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 5 L35 15 L30 25 L25 15 Z' fill='%236b1a1a' opacity='0.07'/%3E%3Cpath d='M0 35 L5 45 L0 55 L-5 45 Z' fill='%236b1a1a' opacity='0.05'/%3E%3Cpath d='M60 35 L65 45 L60 55 L55 45 Z' fill='%236b1a1a' opacity='0.05'/%3E%3C/svg%3E")`,

  // Boro Kuthi — geometric arch pattern
  geoArch:
    "repeating-conic-gradient(rgba(200,150,100,0.05) 0% 25%,transparent 0% 50%)",

  // Shahid Minar — vertical column stripe
  column:
    "repeating-linear-gradient(90deg,rgba(200,190,180,0.07) 0px,rgba(200,190,180,0.07) 2px,transparent 2px,transparent 40px)",

  // Padma River — horizontal ripple
  ripple:
    "repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(21,99,184,0.035) 8px,rgba(21,99,184,0.035) 10px)",
};
