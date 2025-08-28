import React from 'react';

interface RepeatIconProps {
  size?: number;
  color?: string;
  'data-testid'?: string;
}

export const RepeatIcon: React.FC<RepeatIconProps> = ({
  size = 16,
  color = 'currentColor',
  'data-testid': dataTestId,
}) => {
  return (
    <svg
      data-testid={dataTestId}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 4V10H7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 20V14H17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
