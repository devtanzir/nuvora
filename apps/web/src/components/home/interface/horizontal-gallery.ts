export interface CardMetrics {
  left: number;
  width: number;
}

export interface TextSetter {
  opacity: (v: number) => void;
  y: (v: number) => void;
  start: number;
}

export interface CardSetters {
  scale: (v: number) => void;
  opacity: (v: number) => void;
  imgX: (v: number) => void;
  imgScale: (v: number) => void;
  texts: TextSetter[];
}
