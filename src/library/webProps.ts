import type { PressableProps, TextInputProps, TextProps, ViewProps } from 'react-native';

type WebExtra = {
  dataSet?: Record<string, string>;
  'aria-current'?: 'page' | undefined;
};

type WebViewProps = ViewProps & WebExtra;
type WebPressableProps = PressableProps & WebExtra;
type WebTextProps = TextProps & WebExtra;
type WebTextInputProps = TextInputProps & WebExtra;

/** Web-only attributes RN's types don't list. react-native-web reads `dataSet`. */
export function viewWeb(extra: WebExtra): WebViewProps {
  return { ...extra };
}

export function pressableWeb(extra: WebExtra): WebPressableProps {
  return { ...extra };
}

export function textWeb(extra: WebExtra): WebTextProps {
  return { ...extra };
}

export function textInputWeb(extra: WebExtra): WebTextInputProps {
  return { ...extra };
}
