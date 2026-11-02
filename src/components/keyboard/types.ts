export type KeyboardMotion = {
  rotation: [number, number, number];
  explode: number;
  showDescription: boolean;
  invalidate?: () => void;
};
