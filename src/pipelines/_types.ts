export type ParamType = 'range' | 'color' | 'boolean' | 'select';

export interface ParamDef {
  label: string;
  type: ParamType;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface ParamSchema {
  [key: string]: ParamDef;
}

export type ParamValues = Record<string, number | string | boolean>;

export interface Pipeline {
  id: string;
  name: string;
  theme: string;
  description: string;
  tags: string[];
  params: ParamSchema;
  renderer?: 'P2D' | 'WEBGL';
  setup: (p: import('p5'), params: ParamValues, canvas: HTMLCanvasElement) => unknown;
  draw: (p: import('p5'), params: ParamValues, state: unknown, frame: number) => void;
  onParamChange?: (p: import('p5'), params: ParamValues, state: unknown) => void;
  destroy?: (state: unknown) => void;
}
