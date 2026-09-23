export type ExtensionMessage =
  | { type: "OPEN_DICT"; word: string }
  | { type: "CLOSE_DICT" }
  | { type: "CLOSE_SELF" };

export interface ExtensionOptions {
  width: number;
  height: number;
  left: number | null;
  top: number | null;
  reuse: boolean;
}

export const BASE = "https://www.collinsdictionary.com/dictionary/english/";

export const DEFAULTS: ExtensionOptions = {
  width: 420,
  height: 600,
  left: null,
  top: null,
  reuse: true,
};
