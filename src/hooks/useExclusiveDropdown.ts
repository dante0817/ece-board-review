import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

// Menu instances in the header, sidebar, and topic screens share this registry.
const dropdownClosers = new Set<() => void>();

export function useExclusiveDropdown(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [open, setOpenState] = useState(false);
  const openRef = useRef(false);

  const close = useCallback(() => {
    openRef.current = false;
    setOpenState(false);
  }, []);

  useEffect(() => {
    dropdownClosers.add(close);
    return () => { dropdownClosers.delete(close); };
  }, [close]);

  const setOpen = useCallback<Dispatch<SetStateAction<boolean>>>((value) => {
    const nextOpen = typeof value === 'function' ? value(openRef.current) : value;
    if (nextOpen) {
      for (const closeOther of dropdownClosers) {
        if (closeOther !== close) closeOther();
      }
    }
    openRef.current = nextOpen;
    setOpenState(nextOpen);
  }, [close]);

  return [open, setOpen];
}
