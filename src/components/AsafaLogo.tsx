import React from 'react';

interface AsafaLogoProps {
  className?: string;
  size?: number;
}

export const AsafaLogo: React.FC<AsafaLogoProps> = ({ className = 'w-24 h-24', size = 96 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Golden Glow & Border Ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 p-[2.5px] shadow-lg shadow-blue-950/40">
        <div className="w-full h-full rounded-full bg-[#0D3877] p-[1.5px] border border-amber-300/60 flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle with subtle radial gradient */}
            <defs>
              <radialGradient id="asafaGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1E529E" />
                <stop offset="80%" stopColor="#0B306B" />
                <stop offset="100%" stopColor="#07224F" />
              </radialGradient>
              <path
                id="textPathTop"
                d="M 22,60 A 38,38 0 0,1 98,60"
              />
              <path
                id="textPathBottom"
                d="M 98,60 A 38,38 0 0,1 22,60"
              />
            </defs>

            <circle cx="60" cy="60" r="56" fill="url(#asafaGlow)" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#FFFFFF" strokeWidth="0.75" strokeDasharray="2,2" opacity="0.6" />

            {/* Circular arc text: FIANGONANA ARA-PILAZANTSARA */}
            <text fill="#FFFFFF" fontSize="6" fontWeight="bold" letterSpacing="0.6">
              <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
                FIANGONANA ARA-PILAZANTSARA
              </textPath>
            </text>

            {/* Church / Cross / Choir Graphic in Center */}
            <g transform="translate(60, 52)">
              {/* Church roof & cross */}
              <path d="M -16,6 L 0,-10 L 16,6 Z" fill="#F8FAFC" opacity="0.9" />
              <rect x="-1.5" y="-18" width="3" height="9" fill="#F59E0B" />
              <rect x="-5" y="-15" width="10" height="2.5" fill="#F59E0B" />

              {/* Open Bible */}
              <path
                d="M -14,6 C -7,4 0,6 0,6 C 0,6 7,4 14,6 L 14,14 C 7,12 0,14 0,14 C 0,14 -7,12 -14,14 Z"
                fill="#FFFFFF"
                stroke="#0B306B"
                strokeWidth="1"
              />
              {/* Bible spine */}
              <line x1="0" y1="6" x2="0" y2="14" stroke="#D97706" strokeWidth="1.2" />

              {/* Choir Silhouettes standing behind */}
              <circle cx="-9" cy="-1" r="2.2" fill="#E2E8F0" />
              <circle cx="-4" cy="-2.5" r="2.4" fill="#E2E8F0" />
              <circle cx="0" cy="-3.5" r="2.6" fill="#FDE68A" />
              <circle cx="4" cy="-2.5" r="2.4" fill="#E2E8F0" />
              <circle cx="9" cy="-1" r="2.2" fill="#E2E8F0" />
            </g>

            {/* Red & Blue Center Banner */}
            <g transform="translate(60, 77)">
              <rect x="-34" y="-5" width="68" height="10" rx="3" fill="#FFFFFF" stroke="#EF4444" strokeWidth="0.8" />
              <text
                x="0"
                y="2.5"
                fill="#DC2626"
                fontSize="5.2"
                fontWeight="900"
                textAnchor="middle"
                letterSpacing="0.4"
              >
                TOAMINA – ASAFA
              </text>
            </g>

            {/* Bottom arc text: TOLIARA - MADAGASIKARA */}
            <text fill="#E0F2FE" fontSize="5.5" fontWeight="bold" letterSpacing="0.5">
              <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
                TOLIARA – MADAGASIKARA
              </textPath>
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
