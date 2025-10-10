import type React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function YouTubeIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M23.5 6.2a4 4 0 0 0-2.8-2.8C18.9 3 12 3 12 3s-6.9 0-8.7.4A4 4 0 0 0 .5 6.2 41 41 0 0 0 0 12a41 41 0 0 0 .5 5.8 4 4 0 0 0 2.8 2.8C5.1 21 12 21 12 21s6.9 0 8.7-.4a4 4 0 0 0 2.8-2.8A41 41 0 0 0 24 12a41 41 0 0 0-.5-5.8ZM9.75 15.5v-7l6 3.5-6 3.5Z"
      />
    </svg>
  );
}

export function TikTokIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M39.7 15.4a13.6 13.6 0 0 1-7.9-4.6v16.5c0 6-4.8 10.8-10.8 10.8S10.2 33.3 10.2 27.3s4.8-10.8 10.8-10.8c.8 0 1.5.1 2.3.3v5.8a6.2 6.2 0 0 0-2.3-.4 5.1 5.1 0 0 0-5.1 5.1 5.1 5.1 0 0 0 10.2 0V4h5.3c1.1 2 2.8 3.6 4.9 4.6 1.6.8 3.4 1.2 5.2 1.2v5.6c-3 0-6-.9-8.7-2.6Z"
      />
    </svg>
  );
}

export function HomeIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

export function ExternalLinkIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
      />
    </svg>
  );
}
