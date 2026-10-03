type Palette = {
  sky: [string, string, string];
  sun: string;
  glow: string;
  far: string;
  mid: string;
  near: string;
  fore: string;
  snow: string;
};

/** One wide composition, recoloured per trip. Designed for a tall, full-bleed
 *  hero so it still reads when the browser crops the sides. */
const PALETTES: Record<string, Palette> = {
  peaks: {
    sky: ["#0a1824", "#13344a", "#1d4e5e"],
    sun: "#fff0d4",
    glow: "#f0824b",
    far: "#255c73",
    mid: "#174052",
    near: "#0d2a36",
    fore: "#071820",
    snow: "#dbe9f2",
  },
  valley: {
    sky: ["#06161a", "#103a40", "#1a5c62"],
    sun: "#fdf3e0",
    glow: "#3fb3a4",
    far: "#226a6e",
    mid: "#154c52",
    near: "#0b2f34",
    fore: "#051b1e",
    snow: "#d8f0ea",
  },
  forest: {
    sky: ["#08170f", "#133225", "#1d5038"],
    sun: "#fff6d8",
    glow: "#52a06a",
    far: "#2c7050",
    mid: "#1c5339",
    near: "#113728", // deep pine
    fore: "#082117",
    snow: "#dcf0dd",
  },
  coast: {
    sky: ["#0a1724", "#153c55", "#1f6078"],
    sun: "#ffe0b8",
    glow: "#e8793f",
    far: "#266e8a",
    mid: "#185166",
    near: "#0e3443",
    fore: "#071e28",
    snow: "#e6f2f6",
  },
  dunes: {
    sky: ["#1a0e1a", "#3c2133", "#6e4040"],
    sun: "#ffeccb",
    glow: "#e2764a",
    far: "#bc7d54",
    mid: "#986241",
    near: "#6f4531",
    fore: "#3f2821",
    snow: "#f2dcc2",
  },
  canyon: {
    sky: ["#140f22", "#2b2442", "#4d3b54"],
    sun: "#ffe0c0",
    glow: "#d2603a",
    far: "#a4543c",
    mid: "#7e3e2e",
    near: "#542820",
    fore: "#2e1714",
    snow: "#f0cdb4",
  },
};

export function HeroArt({
  variant = "peaks",
  className = "",
}: {
  variant?: string;
  className?: string;
}) {
  const colours = PALETTES[variant] ?? PALETTES.peaks;

  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      {/* sky, built from bands rather than a gradient so there are no ids to collide */}
      <rect width="1440" height="900" fill={colours.sky[0]} />
      <rect y="250" width="1440" height="360" fill={colours.sky[1]} opacity="0.9" />
      <rect y="430" width="1440" height="260" fill={colours.sky[2]} opacity="0.75" />

      {/* sun */}
      <circle cx="1080" cy="330" r="210" fill={colours.glow} opacity="0.14" />
      <circle cx="1080" cy="330" r="130" fill={colours.glow} opacity="0.26" />
      <circle cx="1080" cy="330" r="74" fill={colours.glow} opacity="0.55" />
      <circle cx="1080" cy="330" r="60" fill={colours.sun} />

      {/* far range */}
      <path
        d="M0 520 120 400 210 470 330 350 440 460 540 395 660 480 780 370 900 465 1010 405 1130 490 1250 390 1360 465 1440 420V900H0Z"
        fill={colours.far}
      />
      {/* haze between ranges */}
      <rect y="520" width="1440" height="90" fill={colours.snow} opacity="0.07" />

      {/* mid range */}
      <path
        d="M0 620 150 540 280 610 420 525 560 615 700 540 840 625 980 545 1120 620 1260 535 1400 615 1440 590V900H0Z"
        fill={colours.mid}
      />

      {/* near ridge */}
      <path
        d="M0 720 180 670 360 715 540 660 720 710 900 665 1080 715 1260 668 1440 710V900H0Z"
        fill={colours.near}
      />

      {/* foreground */}
      <path
        d="M0 812 200 782 400 816 600 780 800 814 1000 778 1200 814 1440 784V900H0Z"
        fill={colours.fore}
      />

      {/* hawks */}
      <g fill={colours.fore} opacity="0.65">
        <path d="M760 198c16-13 28-15 39-5 11-10 23-8 39 5-16-5-28-1-39 8-11-11-23-13-39-8Z" />
        <path d="M884 150c11-9 19-10 26-3 8-7 15-6 26 3-11-3-19-1-26 6-7-8-15-9-26-6Z" />
        <path d="M672 262c8-6 14-8 20-2 6-6 11-4 19 2-8-2-14 0-19 5-6-6-12-7-20-5Z" />
      </g>
    </svg>
  );
}
