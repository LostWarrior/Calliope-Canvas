import React from 'react';

export const PostgresIcon: React.FC = () => (
    <img src="../images/postgres-logo.png" alt="Postgres Icon" />
);

export const YugabyteIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 6.5l-4 4 1.41 1.41L11 10.33V17h2v-6.67l1.59 1.59L16 10.5l-4-4z"/>
  </svg>
);

export const AppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.5,2H2.5A2.5,2.5,0,0,0,0,4.5v11A2.5,2.5,0,0,0,2.5,18h15A2.5,2.5,0,0,0,20,15.5V4.5A2.5,2.5,0,0,0,17.5,2Zm-10,13H4V5H7.5ZM16,15H9.5V5H16Z"/>
    </svg>
);

export const ArrowIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 animate-pulse ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

export const CheckCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export const YugabyteFooterLogo: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352.32 72" className="h-8 text-slate-300" fill="currentColor">
        <path d="M110.16 71.52a9.66 9.66 0 0 1-9.36-7.2l-4.08-12.24h-21.6l-4.08 12.24a9.6 9.6 0 0 1-9.12 7.2 9.42 9.42 0 0 1-9.6-9.36L68.88 9.84a9.42 9.42 0 0 1 9.6-9.36 9.6 9.6 0 0 1 9.12 7.2l12.48 37.92 12.48-37.92a9.6 9.6 0 0 1 9.12-7.2 9.42 9.42 0 0 1 9.6 9.36l16.08 52.32a9.42 9.42 0 0 1-9.6 9.36zM86.16 34.8l-7.44-22.56-7.44 22.56zM218.28 62.16l16.08-52.32a9.42 9.42 0 0 1 9.6-9.36 9.66 9.66 0 0 1 9.36 7.2l4.08 12.24h21.6l4.08-12.24a9.6 9.6 0 0 1 9.12-7.2 9.42 9.42 0 0 1 9.6 9.36l16.08 52.32a9.42 9.42 0 0 1-9.6 9.36 9.66 9.66 0 0 1-9.36-7.2l-4.08-12.24h-21.6l-4.08 12.24a9.6 9.6 0 0 1-9.12 7.2 9.42 9.42 0 0 1-9.6-9.36L251.4 9.84a9.42 9.42 0 0 1 9.6-9.36 9.6 9.6 0 0 1 9.12 7.2l12.48 37.92 12.48-37.92a9.6 9.6 0 0 1 9.12-7.2h.24a9.42 9.42 0 0 1 9.36 9.36l-16.08 52.32a9.42 9.42 0 0 1-9.6 9.36zM263.4 34.8l-7.44-22.56-7.44 22.56zM157.32 71.52a9.6 9.6 0 0 1-9.12-7.2l-12.48-37.92-12.48 37.92a9.6 9.6 0 0 1-9.12 7.2 9.42 9.42 0 0 1-9.6-9.36L119.4.48h18.96l7.44 22.56 7.44-22.56h18.96l16.08 61.68a9.42 9.42 0 0 1-9.6 9.36zM200.28 71.52a9.54 9.54 0 0 1-9.6-9.6V9.84a9.54 9.54 0 0 1 9.6-9.6h16.08a9.54 9.54 0 0 1 9.6 9.6v52.08a9.54 9.54 0 0 1-9.6 9.6zm0-18.72h16.08V19.92h-16.08zM352.32 40.56a9.54 9.54 0 0 1-9.6-9.6V9.84a9.54 9.54 0 0 1 9.6-9.6h16.08a9.54 9.54 0 0 1 9.6 9.6v52.08a9.54 9.54 0 0 1-9.6 9.6h-16.08a9.54 9.54 0 0 1-9.6-9.6V49.92h25.68v-9.36zM352.32 19.92h16.08V10.8h-16.08zM41.88 71.52a9.6 9.6 0 0 1-9.12-7.2L20.28 26.4.48 71.52h-19.2l29.28-61.68a9.42 9.42 0 0 1 9.6-9.36h18.96l29.28 61.68a9.42 9.42 0 0 1-9.6 9.36zM29.88 44.4L20.28 22.8l-9.6 21.6z" transform="translate(19.2 -.48)"/>
    </svg>
);
