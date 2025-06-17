import type { SVGProps } from 'react';

export function SproutLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 280 50"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sprout Updates Logo"
      {...props}
    >
      {/* Sprout Icon - stylized leaf/plant */}
      <path 
        d="M25 45C15 35 15 20 25 10Q30 0 35 10C45 20 45 35 35 45Z"
        fill="hsl(var(--accent))" 
      />
      <path 
        d="M30 43C25 35 25 25 30 15"
        stroke="hsl(var(--primary-foreground))" 
        strokeWidth="2.5" // Slightly thicker for better visibility
        fill="none"
      />
      
      <text
        x="55" 
        y="35" 
        fontFamily="Poppins, sans-serif"
        fontSize="30" 
        fontWeight="bold"
        fill="currentColor" 
      >
        Sprout
      </text>
      <text
        x="170"
        y="35"
        fontFamily="PT Sans, sans-serif"
        fontSize="28"
        fill="currentColor" 
        opacity="0.9" 
      >
        Updates
      </text>
    </svg>
  );
}
