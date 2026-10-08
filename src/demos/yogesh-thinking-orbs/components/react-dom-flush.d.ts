import "react-dom";

declare module "react-dom" {
  export function flushSync(fn: () => void): void;
}
