import type { TokenSymbol } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useId } from "react";

export interface TokenIconProps {
  symbol: TokenSymbol;
  size?: number;
  className?: string;
  colors?: string | [string, string];
}

function parseColors(colors?: string | [string, string]): [string, string] | null {
  if (!colors) return null;
  if (Array.isArray(colors)) {
    return [colors[0] || "#ffffff", colors[1] || colors[0] || "#ffffff"];
  }
  if (typeof colors === "string") {
    const parts = colors.split("-");
    if (parts.length >= 2) {
      return [parts[0].trim(), parts[1].trim()];
    }
    return [colors.trim(), colors.trim()];
  }
  return null;
}

const TOKEN_ICON_PATHS: Record<TokenSymbol, string> = {
  SOL: "/tokens/sol.svg",
  USDC: "/tokens/usdc.svg",
  tDNS: "/tokens/tdns.svg",
};

export function TokenIcon({
  symbol,
  size = 24,
  className,
  colors,
}: TokenIconProps) {
  const gradientId = useId();
  const parsedColors = parseColors(colors);

  if (symbol === "tDNS") {
    const [leftColor, rightColor] = parsedColors ?? ["#ffffff", "#ffffff"];
    const isDual = parsedColors !== null;

    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
          className
        )}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full rounded-full"
        >
          <circle cx="48" cy="48" r="48" fill="#000000" />
          <circle cx="48" cy="48" r="47" stroke="#262626" strokeWidth="1.5" />
          <svg
            x="24"
            y="25"
            width="48"
            height="39.15"
            viewBox="835.7 886.2 870.4 709.8"
            fill={isDual ? `url(#${gradientId})` : "#ffffff"}
          >
            {isDual && (
              <defs>
                <linearGradient
                  id={gradientId}
                  x1="835.7"
                  y1="0"
                  x2="1706.1"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="50%" stopColor={leftColor} />
                  <stop offset="50%" stopColor={rightColor} />
                </linearGradient>
              </defs>
            )}
            <path d="M1237.4 901.7c-57.6 69.5-75.5 92.7-97.4 126.3-6.2 9.6-14.1 21.8-17.5 27-7.1 10.9-46.4 72.8-60.3 94.8-5.1 8.1-12.5 19.9-16.6 26.2-19.1 29.8-36.9 58.6-36.9 59.7 0 .7-.3 1-.7.8-.3-.2-2.4 2.6-4.6 6.3-2.3 3.7-8.9 14.3-14.9 23.7-5.9 9.3-13.7 21.7-17.3 27.5-3.5 5.8-7.9 12.7-9.7 15.5-1.8 2.7-8.8 13.8-15.5 24.5s-14.4 22.9-17 27-12 19.1-20.9 33.4c-13.3 21.4-15.9 26.1-15 27.7.9 1.8 3.6 1.9 85 1.9 55.7 0 84.7-.3 86-1 1-.6 2.6-2.5 3.5-4.2 1.4-2.7 27.4-44.1 37.9-60.3 3.1-4.8 17.7-27.8 35.3-55.5 8.6-13.6 25.6-40.1 60.7-94.5 10.5-16.2 27-41.6 36.8-56.5l17.7-27-.2-119.3-.3-119.2-2.5-.3c-2.1-.2-4.4 2.1-15.6 15.5m49.7-13.9c-.7 1.3-1 40.3-1.1 119.3v117.4l12.8 19.7c31.7 49.2 64.2 100.6 117.6 186.3 23 36.8 44 70.4 46.6 74.5s6 9.7 7.5 12.3c1.5 2.7 3.9 5.3 5.2 5.8 1.4.5 36.9.9 84.2.9 67.3 0 82.1-.3 83.6-1.4 2.1-1.5 2.8 0-19.8-36.6-9.4-15.2-20-32.3-30.9-50-3.6-5.8-9.4-15.2-13-21s-11.6-18.8-17.8-29c-6.3-10.2-15.4-25-20.3-33-28.1-45.4-40.3-65-43.2-69.5-1.8-2.8-7.5-11.8-12.6-20-18-29.2-21.8-35.4-26.2-42.2-3.8-5.9-13.5-21.6-23.3-37.5-32.2-52.6-57.5-90.3-77.8-116.1-5.6-7.1-12.1-15.5-14.6-18.6-10.8-13.8-25.3-31.7-37.8-46.6-13.8-16.5-16.9-18.8-19.1-14.7m-409.8 582.8c-4.1 2-3.4 1.3-22.3 26.9-8.9 12.1-17.6 24.8-19.3 28.3-6 12.8-5.7 28 .9 41.8 3.9 8.1 14.1 18.2 22.4 22.2 13.1 6.4 5.9 6.2 166.6 6.2 115.3 0 146.3-.3 147.6-1.3.8-.6 8.7-12 17.5-25.2s27.1-40.6 40.7-60.9c19.4-29.1 24.4-37.2 23.5-38.2-1-1.2-31-1.4-187.8-1.4-167.3 0-186.9.2-189.8 1.6m407.4-.9c-.4.3-.7 1.5-.7 2.5 0 1.9 19.2 32.1 70.2 110.5l7.9 12.1 5.2.5c2.9.2 70.9.4 151.2.3l146-.1 7.1-2.6c18.9-6.9 31.7-21.8 34.5-40.1 2.3-14.6-.4-24.1-11.4-39.8-19.5-28-28.5-39.6-32.3-41.7l-3.9-2.3h-186.6c-102.6 0-186.9.3-187.2.7" />
            <path d="M1365.8 1595.7c1.2.2 3 .2 4 0 .9-.3-.1-.5-2.3-.4-2.2 0-3 .2-1.7.4" />
          </svg>
        </svg>
      </span>
    );
  }

  const src = TOKEN_ICON_PATHS[symbol];
  if (!src) return null;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`${symbol} token`}
        width={size}
        height={size}
        className="size-full object-contain rounded-full"
        priority
        unoptimized
      />
    </span>
  );
}
