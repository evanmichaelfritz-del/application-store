import { useCallback, useSyncExternalStore, type Dispatch, type SetStateAction } from 'react';

/**
 * User-set Skia card controls, keyed by card id.
 *
 * The canvas unmounts offscreen, and Suspense can remount the lazy demo with
 * it. This map lives on globalThis so a second copy of the module inside the
 * Skia chunk still sees the same values. The shell imports it, so the store
 * is created before that chunk loads. The first read during render returns
 * the stored value, which is what avoids a flash of the defaults.
 */

type Bag = Record<string, unknown>;

type Root = {
  bags: Map<string, Bag>;
  listeners: Map<string, Set<() => void>>;
};

const GLOBAL_KEY = '__applicationStoreCardState';

function root(): Root {
  const host = globalThis as typeof globalThis & { [GLOBAL_KEY]?: Root };
  if (!host[GLOBAL_KEY]) {
    host[GLOBAL_KEY] = { bags: new Map(), listeners: new Map() };
  }
  return host[GLOBAL_KEY];
}

function bag(cardId: string): Bag {
  const state = root();
  let value = state.bags.get(cardId);
  if (!value) {
    value = {};
    state.bags.set(cardId, value);
  }
  return value;
}

function emit(cardId: string) {
  root().listeners.get(cardId)?.forEach((listener) => listener());
}

export function readCardField<T>(cardId: string, field: string, initial: T): T {
  const value = bag(cardId);
  if (!Object.prototype.hasOwnProperty.call(value, field)) value[field] = initial;
  return value[field] as T;
}

export function writeCardField<T>(cardId: string, field: string, next: SetStateAction<T>) {
  const value = bag(cardId);
  const prev = value[field] as T;
  const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
  if (Object.is(prev, resolved)) return;
  value[field] = resolved;
  emit(cardId);
}

export function subscribeCard(cardId: string, listener: () => void) {
  const state = root();
  let set = state.listeners.get(cardId);
  if (!set) {
    set = new Set();
    state.listeners.set(cardId, set);
  }
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

export function useCardField<T>(cardId: string, field: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const subscribe = useCallback((listener: () => void) => subscribeCard(cardId, listener), [cardId]);
  const get = useCallback(() => readCardField(cardId, field, initial), [cardId, field, initial]);
  const value = useSyncExternalStore(subscribe, get, get);
  const set = useCallback((next: SetStateAction<T>) => writeCardField(cardId, field, next), [cardId, field]);
  return [value, set];
}

/** Touch the store from the shell so this module is not only inside the Skia chunk. */
export function retainCardState() {
  return root();
}
