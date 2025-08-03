import { useEffect, useState } from "react";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    //Set a timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    //Clean up timer if value change before delay is over
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
