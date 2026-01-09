import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 18V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10" />
      <path d="M14 18V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10" />
      <path d="M2 22h20" />
      <path d="m14 13 4-4" />
      <path d="M6 13h.01" />
    </svg>
  ),
};
