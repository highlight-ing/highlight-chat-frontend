import React from 'react';
import styles from '../Messages/message.module.scss';

// HammerIcon component used for tool activation visualization
interface HammerIconProps {
  isActive?: boolean;
  className?: string;
}

const HammerIcon: React.FC<HammerIconProps> = ({ isActive = false, className = '' }) => {
  return (
    <svg
      className={`${isActive ? styles.metadataToolHammer : ''} ${className}`}
      width="16"
      height="16"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <g>
        <path
          fill="currentColor"
          d="M423.29 90.281C398.149 53.719 351.306 0 280.071 0h-86.875c-3.578 0-6.484 2.906-6.484 6.469v3.063c0 3.563-2.891 6.469-6.469 6.469h-20.563c-3.578 0-6.469-2.906-6.469-6.469V6.469c0-3.563-2.906-6.469-6.484-6.469H96.431C89.29 0 83.478 5.813 83.478 12.969v64.344c0 7.172 5.813 12.969 12.953 12.969h50.297c3.578 0 6.484-2.906 6.484-6.469v-3.047c0-3.578 2.891-6.484 6.469-6.484h20.563c3.578 0 6.469 2.906 6.469 6.484v62.094h91.438v-26.656c0-14.313 11.609-25.922 25.906-25.922h7.234c48 0 73.156 10.281 97.156 20.563 15.281 6.562 27.421-6.844 14.843-20.563z"
        />
        <path
          fill="currentColor"
          d="M266.056 512c5.234 0 10.234-2.109 13.906-5.844 3.656-3.75 5.641-8.813 5.531-14.031l-7.344-321.844h-91.438l-7.328 321.844c-.125 5.219 1.875 10.281 5.531 14.031 3.656 3.734 8.672 5.844 13.891 5.844h67.251z"
        />
      </g>
    </svg>
  );
};

export default HammerIcon;
