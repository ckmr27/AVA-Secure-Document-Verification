"use client";

import React from "react";

// SVG icons related to document verification / academia
const ICONS = [
    // Diploma/Scroll
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" stroke-width="2"/>
    <line x1="12" y1="18" x2="36" y2="18" stroke="currentColor" stroke-width="2"/>
    <line x1="12" y1="24" x2="30" y2="24" stroke="currentColor" stroke-width="2"/>
    <line x1="12" y1="30" x2="24" y2="30" stroke="currentColor" stroke-width="2"/>
    <circle cx="36" cy="34" r="5" stroke="currentColor" stroke-width="2"/>
  </svg>`,
    // Shield/Verify
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4L8 12V24C8 33.33 15.2 41.97 24 44C32.8 41.97 40 33.33 40 24V12L24 4Z" stroke="currentColor" stroke-width="2"/>
    <polyline points="16,24 21,29 32,18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
    // Graduation Cap
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="24,8 44,18 24,28 4,18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M12 22V34C12 34 18 40 24 40C30 40 36 34 36 34V22" stroke="currentColor" stroke-width="2"/>
    <line x1="44" y1="18" x2="44" y2="30" stroke="currentColor" stroke-width="2"/>
  </svg>`,
    // Lock/Padlock
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="22" width="28" height="20" rx="3" stroke="currentColor" stroke-width="2"/>
    <path d="M16 22V18C16 12.477 20.477 8 26 8C31.523 8 36 12.477 36 18V22" stroke="currentColor" stroke-width="2"/>
    <circle cx="24" cy="32" r="3" fill="currentColor"/>
    <line x1="24" y1="35" x2="24" y2="39" stroke="currentColor" stroke-width="2"/>
  </svg>`,
    // Blockchain/Chain
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="18" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
    <rect x="18" y="18" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
    <rect x="32" y="18" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
    <line x1="16" y1="24" x2="18" y2="24" stroke="currentColor" stroke-width="2"/>
    <line x1="30" y1="24" x2="32" y2="24" stroke="currentColor" stroke-width="2"/>
  </svg>`,
    // Certificate Seal
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2"/>
    <circle cx="24" cy="24" r="10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
    <polyline points="20,24 23,27 29,21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
    // QR Code
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="16" height="16" rx="1" stroke="currentColor" stroke-width="2"/>
    <rect x="26" y="6" width="16" height="16" rx="1" stroke="currentColor" stroke-width="2"/>
    <rect x="6" y="26" width="16" height="16" rx="1" stroke="currentColor" stroke-width="2"/>
    <rect x="10" y="10" width="8" height="8" fill="currentColor" rx="0.5"/>
    <rect x="30" y="10" width="8" height="8" fill="currentColor" rx="0.5"/>
    <rect x="10" y="30" width="8" height="8" fill="currentColor" rx="0.5"/>
    <rect x="26" y="26" width="4" height="4" fill="currentColor"/>
    <rect x="32" y="26" width="4" height="4" fill="currentColor"/>
    <rect x="38" y="26" width="4" height="4" fill="currentColor"/>
    <rect x="26" y="32" width="4" height="4" fill="currentColor"/>
    <rect x="38" y="32" width="4" height="4" fill="currentColor"/>
    <rect x="26" y="38" width="4" height="4" fill="currentColor"/>
    <rect x="32" y="38" width="4" height="4" fill="currentColor"/>
    <rect x="38" y="38" width="4" height="4" fill="currentColor"/>
  </svg>`,
    // Fingerprint
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 40C17 40 8 35.5 8 24C8 16.27 15.16 10 24 10C32.84 10 40 16.27 40 24C40 27 39 30 37 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M14 36C14 36 10 31 10 24C10 17.37 16.27 12 24 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M20 38C20 38 14 33 14 24C14 19.03 18.47 15 24 15C29.53 15 34 19.03 34 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M24 38C24 38 18 33 18 24C18 21.24 20.69 19 24 19C27.31 19 30 21.24 30 24C30 27 28 30 26 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M24 36C24 36 22 33 22 24C22 22.67 22.9 22 24 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
];

// Two rows, 12 items each for seamless looping
const ROW_SIZE = 12;

function buildRow(offset: number) {
    return Array.from({ length: ROW_SIZE }, (_, i) => ICONS[(i + offset) % ICONS.length]);
}

interface IconProps {
    svg: string;
    size?: number;
}

function Icon({ svg, size = 40 }: IconProps) {
    return (
        <span
            style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "currentColor" }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

interface MarqueeRowProps {
    icons: string[];
    direction?: "left" | "right";
    duration?: number;
    iconSize?: number;
    gap?: number;
}

function MarqueeRow({ icons, direction = "left", duration = 40, iconSize = 36, gap = 48 }: MarqueeRowProps) {
    // Duplicate for seamless loop
    const doubled = [...icons, ...icons];
    const animClass = direction === "right" ? "marquee-row-right" : "marquee-row-left";

    return (
        <div className="marquee-wrapper" style={{ overflow: "hidden", width: "100%", display: "flex" }}>
            <div
                className={animClass}
                style={{
                    display: "flex",
                    gap: gap,
                    animationDuration: `${duration}s`,
                    willChange: "transform",
                    flexShrink: 0,
                }}
            >
                {doubled.map((svg, i) => (
                    <Icon key={i} svg={svg} size={iconSize} />
                ))}
            </div>
        </div>
    );
}

export default function MarqueeBackground() {
    return (
        <div
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
                overflow: "hidden",
                opacity: 0.2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                gap: "0px",
                color: "var(--foreground, #6366f1)",
            }}
        >
            {/* Row 1 — leftward, slow */}
            <MarqueeRow icons={buildRow(0)} direction="left" duration={55} iconSize={40} gap={52} />
            {/* Row 2 — rightward, slightly faster */}
            <MarqueeRow icons={buildRow(3)} direction="right" duration={45} iconSize={36} gap={60} />
            {/* Row 3 — leftward */}
            <MarqueeRow icons={buildRow(1)} direction="left" duration={65} iconSize={44} gap={48} />
            {/* Row 4 — rightward */}
            <MarqueeRow icons={buildRow(5)} direction="right" duration={50} iconSize={38} gap={56} />
            {/* Row 5 — leftward, faster */}
            <MarqueeRow icons={buildRow(2)} direction="left" duration={40} iconSize={36} gap={64} />
            {/* Row 6 — rightward, slow */}
            {/* Row 7 — leftward, medium speed */}
            <MarqueeRow icons={buildRow(4)} direction="left" duration={55} iconSize={38} gap={60} />
            {/* Row 8 — rightward, medium speed */}
            <MarqueeRow icons={buildRow(7)} direction="right" duration={55} iconSize={38} gap={60} />
            {/* Row 6 — rightward, slow */}
            <MarqueeRow icons={buildRow(6)} direction="right" duration={70} iconSize={42} gap={52} />
        </div>
    );
}
