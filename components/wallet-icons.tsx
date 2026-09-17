import Image from "next/image";
import { cn } from "cn";

export function SquadsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-full text-foreground transition-colors", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.4213 23.3923C6.46994 23.4409 6.5207 23.4868 6.57358 23.5299C6.9447 23.8339 7.40963 24 7.88936 24H16.1106C16.5904 24 17.0553 23.8339 17.4264 23.5299C17.4791 23.4865 17.5297 23.4406 17.5787 23.3923L23.3919 17.579C23.5847 17.3862 23.7376 17.1573 23.842 16.9054C23.9463 16.6535 24 16.3835 24 16.1109V7.88948C24 7.61683 23.9463 7.34685 23.842 7.09496C23.7376 6.84306 23.5847 6.61419 23.3919 6.42139L17.5787 0.608087C17.53 0.559392 17.4791 0.51345 17.4264 0.470433C17.0554 0.166261 16.5904 2.38672e-05 16.1106 1.52538e-07H7.88936C7.40937 -0.000183792 6.94414 0.166001 6.57289 0.470261C6.51987 0.513578 6.46905 0.55952 6.42061 0.607915L0.608078 6.42139C0.415292 6.61419 0.262365 6.84306 0.158031 7.09496C0.0536968 7.34685 -2.24046e-06 7.61683 0 7.88948L0 16.1109C-2.24046e-06 16.3835 0.0536968 16.6535 0.158031 16.9054C0.262365 17.1573 0.415292 17.3862 0.608078 17.579L6.4213 23.3923ZM3.17133 12.0045V5.10353C3.17133 4.59109 3.3749 4.09964 3.73724 3.73729C4.09958 3.37494 4.59102 3.17138 5.10345 3.17138H18.8965C19.409 3.17143 19.9004 3.375 20.2627 3.73734C20.625 4.09968 20.8286 4.5911 20.8287 5.10353V18.8968C20.8286 19.4092 20.625 19.9007 20.2627 20.263C19.9004 20.6253 19.409 20.8289 18.8965 20.829H5.10345C4.59102 20.829 4.09958 20.6254 3.73724 20.2631C3.3749 19.9007 3.17133 19.4093 3.17133 18.8968V12.0045Z" />
    </svg>
  );
}

type WalletIconProps = {
  id: string;
  src?: string;
  alt?: string;
  className?: string;
  size?: number;
};

export function WalletIcon({
  id,
  src,
  alt,
  className,
  size = 36,
}: WalletIconProps) {
  // Squads changes as per theme: black in light mode, white in dark mode
  if (id.toLowerCase() === "squads") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0",
          className
        )}
      >
        <SquadsIcon className="size-full p-0.5" />
      </div>
    );
  }

  const iconSrc = src || `/wallets/${id.toLowerCase()}.svg`;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-transparent shrink-0",
        className
      )}
    >
      <Image
        src={iconSrc}
        alt={alt ?? `${id} logo`}
        width={size}
        height={size}
        className="size-full object-contain"
        unoptimized
      />
    </div>
  );
}
