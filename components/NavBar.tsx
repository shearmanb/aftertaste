"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = { active: boolean };

function Icon({ active, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const CupIcon = ({ active }: IconProps) => (
  <Icon active={active}>
    <path d="M5 8h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
    <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
    <path d="M8 4c0 1 1 1.5 1 2.5M11 4c0 1 1 1.5 1 2.5M14 4c0 1 1 1.5 1 2.5" />
  </Icon>
);

const BeanIcon = ({ active }: IconProps) => (
  <Icon active={active}>
    <path d="M7 4c5 0 10 3 10 9s-5 7-10 7-4-5-4-8 0-8 4-8Z" />
    <path d="M9 6c2 2 2 10-2 12" />
  </Icon>
);

const HomeIcon = ({ active }: IconProps) => (
  <Icon active={active}>
    <path d="M4 11 12 4l8 7" />
    <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" />
  </Icon>
);

const SparkIcon = ({ active }: IconProps) => (
  <Icon active={active}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    <circle cx="12" cy="12" r="2.5" />
  </Icon>
);

const navItems = [
  { href: "/brews", label: "Brews", Icon: CupIcon },
  { href: "/beans", label: "Beans", Icon: BeanIcon },
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/insights", label: "Insights", Icon: SparkIcon },
];

export default function NavBar() {
  const path = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background:
          "linear-gradient(180deg, transparent, oklch(0.13 0.005 58) 38%)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div
        className="absolute top-0 left-[18px] right-[18px] h-px"
        style={{ background: "var(--hairline)" }}
      />
      <div className="flex justify-around items-center max-w-lg mx-auto px-4 pt-3 pb-[30px]">
        {navItems.map(({ href, label, Icon: I }) => {
          const active =
            path === href || (href !== "/" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 transition-colors"
              style={{
                color: active ? "var(--accent-bright)" : "var(--text-3)",
              }}
            >
              <I active={active} />
              <span
                className="font-mono-plex text-[10px]"
                style={{ letterSpacing: "0.06em" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
