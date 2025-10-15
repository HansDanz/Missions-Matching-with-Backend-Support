import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 2 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    // Extract numeric part and suffix
    const numericMatch = value.match(/[\d.]+/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const targetNumber = parseFloat(numericMatch[0]);
    const suffix = value.replace(numericMatch[0], '');
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = targetNumber * easeOutQuart;
      
      setDisplayValue(current.toFixed(1) + suffix);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animate();
  }, [value, duration]);

  return <span>{displayValue}</span>;
}
