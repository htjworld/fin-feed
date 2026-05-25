'use client';
import React from 'react';

interface State { hasError: boolean }

export default class ThumbnailErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="thumb thumb-text"
          style={{ background: 'linear-gradient(135deg,hsl(210,40%,12%),hsl(210,35%,20%))' }}
        />
      );
    }
    return this.props.children;
  }
}
