
export type VariablesValue = Record<string, string>;

export enum Token {
  TEXT = 'TEXT',

  INTERPOLATION_START = 'INTERPOLATION_START',
  INTERPOLATION_END = 'INTERPOLATION_END',
}

export enum SemanticTokenType {
  TEXT = 'TEXT',
  VARIABLE = 'VARIABLE',
}

type BaseToken = {
  position: number;
  line: number;
  column: number;
}

export type TokenInfo = BaseToken & {
  fragment: string;
  type: Token;
}

export type SemanticToken = BaseToken & {
  type: SemanticTokenType;
  value: string; // e.g variable name
}
