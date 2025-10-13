import * as React from 'react';

declare global {
  namespace JSX {
    // Allow JSX with React Native types
    interface Element extends React.ReactNode {}
    interface IntrinsicElements {
      [name: string]: any;
    }
  }
}

export {};
