'use client'

import { useState, useEffect } from 'react';

export default function AnimatedText() {
  // Initialize state but don't use it during server-side rendering
  const [mounted, setMounted] = useState(false);
  const [animatingLetters, setAnimatingLetters] = useState<Set<number>>(new Set());

  // Only run client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  const startAnimation = (index: number) => {
    setAnimatingLetters(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      setTimeout(() => {
        setAnimatingLetters(current => {
          const updated = new Set(current);
          updated.delete(index);
          return updated;
        });
      }, 500);
      return newSet;
    });
  };

  // Return a simpler version during server-side rendering
  if (!mounted) {
    return (
      <h1 className="text-4xl font-bold flex">
        {"Hello World".split("").map((letter, index) => (
          <span key={index} className="jiggle-animation cursor-pointer">
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </h1>
    );
  }

  // Full interactive version for client-side
  return (
    <h1 className="text-4xl font-bold flex">
      {"Hello World".split("").map((letter, index) => (
        <span 
          key={index} 
          className={`jiggle-animation cursor-pointer ${
            animatingLetters.has(index) ? 'wave-animation' : ''
          }`}
          onMouseEnter={() => startAnimation(index)}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </h1>
  );
} 