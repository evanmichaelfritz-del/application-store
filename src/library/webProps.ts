import type { PressableProps, TextInputProps, TextProps, ViewProps } from 'react-native';

type WebExtra = {
  dataSet?: Record<string, string | undefined>;
  'aria-current'?: 'page' | undefined;
};

/** Web-only attributes RN's types don't list. react-native-web reads `dataSet`. */
export function viewWeb(extra: WebExtra): Partial<ViewProps> {
  return extra as unknown as Partial<ViewProps>;
}

export function pressableWeb(extra: WebExtra): Partial<PressableProps> {
  return extra as unknown as Partial<PressableProps>;
}

export function textWeb(extra: WebExtra): Partial<TextProps> {
  return extra as unknown as Partial<TextProps>;
}

export function textInputWeb(extra: WebExtra): Partial<TextInputProps> {
  return extra as unknown as Partial<TextInputProps>;
}
