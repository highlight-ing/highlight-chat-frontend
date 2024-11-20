import React, { useState, useCallback, useEffect } from 'react';
import { ArrowDown2 } from 'iconsax-react';
import styles from './message.module.scss';
import { MetadataEvent } from '@/types';

interface LogEntry {
  timestamp: number;
  type: string;
  value: string;
}

interface ThinkingDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  logs: LogEntry[];
}

const ThinkingDrawer: React.FC<ThinkingDrawerProps> = ({ isOpen, onToggle, logs }) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!hasInteracted && isOpen) {
      setHasInteracted(true);
    }
  }, [isOpen, hasInteracted]);

  const handleToggle = useCallback(() => {
    if (!isAnimating) {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400); // Match animation duration
      onToggle();
    }
  }, [hasInteracted, isAnimating, onToggle]);

  return (
    <>
      <button 
        className={`${styles.drawerToggle} ${hasInteracted ? styles.animated : ''} ${isOpen ? styles.open : ''}`}
        onClick={handleToggle}
        aria-label="Toggle details"
        disabled={isAnimating}
      >
        <ArrowDown2 size={16} />
      </button>
      <div className={`${styles.drawer} ${hasInteracted ? styles.animated : ''} ${isOpen ? styles.open : ''}`}>
        <div className={styles.drawerContent}>
          <div className={styles.verticalLine} />
          <div className={styles.logContainer}>
            {logs.map((log, index) => (
              <div key={index} className={styles.logEntry}>
                <span>{log.type}: {log.value}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className={styles.emptyLog}>Highlight is thinking...</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ThinkingDrawer;
