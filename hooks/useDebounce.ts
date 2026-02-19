import { useEffect, useRef, useState } from "react";

export default function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const latestValueRef = useRef(value);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (delay <= 0) {
      setDebouncedValue((previous) =>
        Object.is(previous, latestValueRef.current) ? previous : latestValueRef.current,
      );
      return;
    }

    const timeoutId = setTimeout(() => {
      setDebouncedValue((previous) =>
        Object.is(previous, latestValueRef.current) ? previous : latestValueRef.current,
      );
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, value]);

  return debouncedValue;
}
