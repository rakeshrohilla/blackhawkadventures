import type { ArtVariant } from "@/lib/constants";

/**
 * Self-contained flat-vector landscapes used wherever a tour has no photograph
 * yet. No external image requests, no gradient ids to collide, scales cleanly.
 */

const HAWKS = (
  <g fill="#0a0f12" opacity="0.5">
    <path d="M250 52c4-3 7-4 10-1 3-3 6-2 10 1-4-1-7 0-10 2-3-3-6-3-10-2Z" />
    <path d="M286 38c3-2 5-3 7-1 2-2 4-1 7 1-3-1-5 0-7 1-2-2-4-2-7-1Z" />
  </g>
);

function Peaks() {
  return (
    <>
      <rect width="400" height="260" fill="#16324a" />
      <circle cx="302" cy="68" r="26" fill="#ffd9a0" opacity="0.95" />
      <path
        d="M0 152 45 112 82 137 122 94 168 132 208 100 252 142 296 104 340 139 400 110V260H0Z"
        fill="#2f5872"
      />
      <path d="M122 94 141 114h-7l-6-6-7 7h-8Z" fill="#dbe9f2" opacity="0.85" />
      <path d="M296 104 313 122h-6l-6-5-6 6h-7Z" fill="#dbe9f2" opacity="0.8" />
      <path d="M0 182 62 150 112 176 172 140 232 179 292 148 352 181 400 161V260H0Z" fill="#1f4055" />
      <path d="M0 216 70 196 142 213 212 192 282 215 352 197 400 211V260H0Z" fill="#14293a" />
      {HAWKS}
    </>
  );
}

function Valley() {
  return (
    <>
      <rect width="400" height="260" fill="#123b40" />
      <circle cx="200" cy="88" r="30" fill="#ffe3b0" opacity="0.92" />
      <path d="M0 76 158 202v58H0Z" fill="#27666a" />
      <path d="M400 66 242 202v58h158Z" fill="#1d535a" />
      <path d="M118 200h164l22 60H96Z" fill="#0a262b" />
      <path d="M190 204h20l20 56h-60Z" fill="#9fd8cf" opacity="0.35" />
      {HAWKS}
    </>
  );
}

function Forest() {
  const tree = (x: number, y: number, h: number, fill: string) => (
    <path key={`${x}-${y}`} d={`M${x} ${y} ${x + h * 0.42} ${y + h} h${-h * 0.84}Z`} fill={fill} />
  );
  return (
    <>
      <rect width="400" height="260" fill="#1b3a2e" />
      <circle cx="312" cy="62" r="26" fill="#ffe9b5" opacity="0.92" />
      <path
        d="M0 158c78-28 148 18 220-8s128 16 180-4v114H0Z"
        fill="#2f6b4f"
      />
      <g>
        {[18, 52, 86, 120, 154, 188, 222, 256, 290, 324, 358, 392].map((x, index) =>
          tree(x, 168 + (index % 3) * 6, 32, "#1f4e3a"),
        )}
      </g>
      <path d="M0 214c92-22 172 20 262-2 72-16 108 6 138-2v50H0Z" fill="#143528" />
      <g>
        {[0, 38, 76, 114, 152, 190, 228, 266, 304, 342, 380].map((x, index) =>
          tree(x, 218 + (index % 2) * 8, 40, "#0d2a1f"),
        )}
      </g>
      {HAWKS}
    </>
  );
}

function Coast() {
  return (
    <>
      <rect width="400" height="260" fill="#1d3b56" />
      <circle cx="88" cy="66" r="28" fill="#ffb878" opacity="0.95" />
      <path d="M0 142 72 118 142 146 206 130 252 148H0Z" fill="#27506b" />
      <rect y="148" width="400" height="112" fill="#2a6b84" />
      <g fill="#59a3ba" opacity="0.65">
        <path d="M28 172h78v4H28ZM142 186h96v4h-96ZM262 168h84v4h-84ZM58 202h72v4H58ZM214 210h104v4H214Z" />
      </g>
      <path d="M0 232c82-16 152 12 242 0 80-10 128 8 158 0v28H0Z" fill="#e6d3b3" />
      {HAWKS}
    </>
  );
}

function Dunes() {
  return (
    <>
      <rect width="400" height="260" fill="#46283c" />
      <circle cx="306" cy="78" r="30" fill="#ffc98a" opacity="0.95" />
      <path d="M0 168c72-30 152 2 232-18 70-18 128 8 168-4v114H0Z" fill="#c98a5e" />
      <path d="M0 204c82-26 162 6 252-14 70-16 118 10 148 2v68H0Z" fill="#a86a46" />
      <path d="M0 234c102-22 202 10 302-8 50-8 78 4 98 0v34H0Z" fill="#7d4830" />
      {HAWKS}
    </>
  );
}

function Canyon() {
  return (
    <>
      <rect width="400" height="260" fill="#2a2340" />
      <circle cx="202" cy="72" r="26" fill="#ffb07c" opacity="0.95" />
      <path
        d="M0 132h58v-20h74v26h68v-22h72v26h70v-20h58V260H0Z"
        fill="#a4543c"
      />
      <path
        d="M0 178h88v-22h92v26h82v-20h80v26h58V260H0Z"
        fill="#7e3e2e"
      />
      <path d="M0 218 400 206v54H0Z" fill="#4a2621" />
      <path d="M0 240c96-10 196 8 282-4 48-6 82 2 118-2v26H0Z" fill="#c9a98f" opacity="0.35" />
      {HAWKS}
    </>
  );
}

const VARIANTS: Record<string, () => React.JSX.Element> = {
  peaks: Peaks,
  valley: Valley,
  forest: Forest,
  coast: Coast,
  dunes: Dunes,
  canyon: Canyon,
};

export function SceneArt({
  variant = "peaks",
  className = "",
}: {
  variant?: ArtVariant | string;
  className?: string;
}) {
  const Scene = VARIANTS[variant] ?? Peaks;

  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <Scene />
    </svg>
  );
}
