import React from 'react';
import { ArrowDown2 } from 'iconsax-react';
import styles from './message.module.scss';

interface ThinkingDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ThinkingDrawer: React.FC<ThinkingDrawerProps> = ({ isOpen, onToggle }) => {
  return (
    <>
      <button 
        className={`${styles.drawerToggle} ${isOpen ? styles.open : ''}`}
        onClick={onToggle}
        aria-label="Toggle details"
      >
        <ArrowDown2 size={16} />
      </button>
      {isOpen && (
        <div className={styles.drawer}>
          <div className={styles.drawerContent}>
            <h3>Thinking Process</h3>
            <p>Watch the AI's thought process in real-time...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ThinkingDrawer;
