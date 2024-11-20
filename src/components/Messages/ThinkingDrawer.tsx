import React from 'react';
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
            <div className={styles.logContainer}>
              {logs.map((log, index) => (
                <div key={index} className={styles.logEntry}>
                  <span className={styles.logType}>{log.type}</span>
                  <span className={styles.logValue}>{log.value}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className={styles.emptyLog}>Waiting for process details...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThinkingDrawer;
