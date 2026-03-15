'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AnimationType = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'zoom-in' 
  | 'blur-in' 
  | 'scale-up'
  | 'reveal-3d-up'
  | 'reveal-3d-down';

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  className?: string;
  viewport?: { once?: boolean; margin?: string; amount?: number | "some" | "all" };
  threshold?: number;
}

export default function ScrollAnimation({
  children,
  animation = 'fade-up',
  duration = 0.8,
  delay = 0,
  className,
  viewport = { once: true, margin: '-10% 0px -10% 0px', amount: 0.1 },
}: ScrollAnimationProps) {
  
  const getVariants = () => {
    switch (animation) {
      case 'fade-up':
        return {
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        };
      case 'fade-down':
        return {
          hidden: { opacity: 0, y: -30 },
          visible: { opacity: 1, y: 0 },
        };
      case 'fade-left':
        return {
          hidden: { opacity: 0, x: 30 },
          visible: { opacity: 1, x: 0 },
        };
      case 'fade-right':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0 },
        };
      case 'zoom-in':
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 },
        };
      case 'scale-up':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 },
        };
      case 'blur-in':
        return {
          hidden: { opacity: 0, filter: 'blur(12px)', y: 15 },
          visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
        };
      case 'reveal-3d-up':
        return {
          hidden: { opacity: 0, y: 60, rotateX: 15, scale: 0.95 },
          visible: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
        };
      case 'reveal-3d-down':
        return {
          hidden: { opacity: 0, y: -60, rotateX: -15, scale: 0.95 },
          visible: { opacity: 1, y: 0, rotateX: 0, scale: 1 },
        };
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={getVariants()}
      transition={{ 
        duration, 
        delay, 
        ease: [0.16, 1, 0.3, 1] // Super smooth expo-out bezier
      }}
      style={{ perspective: 1200 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
