import { useRef } from 'react';

export const useThrottle = (fn: Function, delay: number) => {
  const timer = useRef<NodeJS.Timer | null>(null);
  return function () {
    if (!timer.current) {
      fn.apply(this, arguments);
      timer.current = setTimeout(() => {
        timer.current = null;
      }, delay);
    }
  };
};
