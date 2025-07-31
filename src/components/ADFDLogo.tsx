import React from 'react';

interface ADFDLogoProps {
  className?: string;
  size?: number;
}

const ADFDLogo: React.FC<ADFDLogoProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Official ADFD Logo Design - Matching the provided image */}

      {/* Top Blue Arc */}
      <path
        d="M 20 35 A 30 30 0 0 1 80 35"
        stroke="#007CBA"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* ADFD Text */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="20"
        fontWeight="bold"
        fill="#004D71"
        fontFamily="Arial, sans-serif"
        letterSpacing="1px"
      >
        ADFD
      </text>

      {/* Bottom Green Arc */}
      <path
        d="M 20 65 A 30 30 0 0 0 80 65"
        stroke="#4A8B2C"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Small gaps in arcs to match the original design */}
      <rect x="48" y="29" width="4" height="12" fill="white" />
      <rect x="48" y="59" width="4" height="12" fill="white" />
    </svg>
  );
};

export default ADFDLogo;
