import React from 'react';

export type MonolineIconName =
  | 'cup'
  | 'leaf'
  | 'table'
  | 'clock'
  | 'bag'
  | 'qr'
  | 'pin'
  | 'spoon'
  | 'plant'
  | 'bell'
  | 'receipt'
  | 'star'
  | 'phone'
  | 'search'
  | 'filter'
  | 'check'
  | 'arrow-right'
  | 'sparkles';

interface MonolineIconProps {
  name: MonolineIconName;
  size?: number | string;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

/**
 * 2px even stroke, rounded caps, monoline icon set
 * Derived directly from The Leaf's visual language.
 */
export const MonolineIcon: React.FC<MonolineIconProps> = ({
  name,
  size = 22,
  strokeWidth = 2,
  className = '',
  color = 'currentColor',
}) => {
  const commonProps = {
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: `inline-block shrink-0 ${className}`,
    'aria-hidden': true,
  };

  switch (name) {
    case 'cup':
      return (
        <svg {...commonProps}>
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      );

    case 'leaf':
      return (
        <svg {...commonProps}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );

    case 'table':
      return (
        <svg {...commonProps}>
          <path d="M3 7h18v3H3z" />
          <path d="M6 10v10" />
          <path d="M18 10v10" />
          <path d="M4 14h16" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
      );

    case 'bag':
      return (
        <svg {...commonProps}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );

    case 'qr':
      return (
        <svg {...commonProps}>
          <rect width="6" height="6" x="3" y="3" rx="1" />
          <rect width="6" height="6" x="15" y="3" rx="1" />
          <rect width="6" height="6" x="3" y="15" rx="1" />
          <path d="M15 15h2v2h-2z" />
          <path d="M19 15v4h2" />
          <path d="M15 19v2h4" />
        </svg>
      );

    case 'pin':
      return (
        <svg {...commonProps}>
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );

    case 'spoon':
      return (
        <svg {...commonProps}>
          <path d="m12 12-8.5 8.5a2.12 2.12 0 1 0 3 3L15 15" />
          <path d="M18 11.5a4.5 4.5 0 1 0-4.5-4.5c0 1.25.5 2.4 1.3 3.2L18 11.5Z" />
        </svg>
      );

    case 'plant':
      return (
        <svg {...commonProps}>
          <path d="M12 22v-9" />
          <path d="M12 13c-3-2-6-1-7 2 2 1 5 1 7-2Z" />
          <path d="M12 9c3-2 6-1 7 2-2 1-5 1-7-2Z" />
          <path d="M12 9V3" />
          <path d="M12 4C10 2 8 3 8 5c1 1 3 1 4-1Z" />
        </svg>
      );

    case 'bell':
      return (
        <svg {...commonProps}>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      );

    case 'receipt':
      return (
        <svg {...commonProps}>
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
          <path d="M8 7h8" />
          <path d="M8 11h8" />
          <path d="M8 15h5" />
        </svg>
      );

    case 'star':
      return (
        <svg {...commonProps}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );

    case 'phone':
      return (
        <svg {...commonProps}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );

    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );

    case 'filter':
      return (
        <svg {...commonProps}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      );

    case 'check':
      return (
        <svg {...commonProps}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );

    case 'arrow-right':
      return (
        <svg {...commonProps}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );

    case 'sparkles':
      return (
        <svg {...commonProps}>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      );

    default:
      return null;
  }
};
