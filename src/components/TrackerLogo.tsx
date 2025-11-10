interface TrackerLogoProps {
  className?: string;
}

export const TrackerLogo = ({ className = "h-6 w-6" }: TrackerLogoProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer tracking circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 3"
        opacity="0.3"
      />
      
      {/* Middle tracking circle */}
      <circle
        cx="12"
        cy="12"
        r="7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="1 2"
        opacity="0.5"
      />
      
      {/* Inner solid circle */}
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        opacity="0.2"
      />
      
      {/* Location pin in center */}
      <path
        d="M12 8C10.9 8 10 8.9 10 10C10 11.1 10.9 12 12 12C13.1 12 14 11.1 14 10C14 8.9 13.1 8 12 8Z"
        fill="currentColor"
      />
      <path
        d="M12 6C9.79 6 8 7.79 8 10C8 11.88 9.81 14.54 12 16.5C14.19 14.54 16 11.88 16 10C16 7.79 14.21 6 12 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Crosshair lines */}
      <line
        x1="12"
        y1="1"
        x2="12"
        y2="4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="20"
        x2="12"
        y2="23"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="1"
        y1="12"
        x2="4"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="12"
        x2="23"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
