import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string,
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(f: StateCreator<T, [], []>, name?: string) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    const prev = get();
    (set as (...a: unknown[]) => void)(...args);
    const next = get();
    if (import.meta.env.DEV) {
      console.groupCollapsed(`%c[${name ?? 'store'}]`, 'color: #7B68EE; font-weight: bold');
      console.log('prev:', prev);
      console.log('next:', next);
      console.groupEnd();
    }
  };
  return f(loggedSet, get, store);
};

export const logger = loggerImpl as Logger;
