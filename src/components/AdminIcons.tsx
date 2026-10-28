import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconOverview(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="3.5" width="7" height="8" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
      <rect x="3.5" y="14.5" width="7" height="6" rx="1.5" />
    </BaseIcon>
  );
}

export function IconNews(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 5.5h13a1 1 0 011 1V18a1.5 1.5 0 001.5 1.5H6A2 2 0 014 17.5z" />
      <path d="M18 9h2.5V18a1.5 1.5 0 01-1.5 1.5" />
      <path d="M7.5 9h7M7.5 12.5h7M7.5 16h4" />
    </BaseIcon>
  );
}

export function IconBroadcast(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="9" y="3.5" width="6" height="10" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v2.5M8.5 20.5h7" />
    </BaseIcon>
  );
}

export function IconExternal(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 16L17 7M9 7h8v8" />
    </BaseIcon>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 4.5H7A1.5 1.5 0 005.5 6v12A1.5 1.5 0 007 19.5h7" />
      <path d="M11 12h9M17 8.5L20.5 12 17 15.5" />
    </BaseIcon>
  );
}
