import { SemanticToken, SemanticTokenType, Token, TokenInfo } from './types.js';

export class SemanticAnalyzer {

  private tokens: SemanticToken[] = [];

  private target: SemanticTokenType | undefined;
  private expect: Token[] = [];
  private subsequence: TokenInfo[] = [];

  private constructor(
    private readonly sequence: readonly TokenInfo[]
  ) {}

  /**
   * @param sequence
   * @throws SemanticError
   */
  public static process(sequence: readonly TokenInfo[]) {
    const analyzer = new SemanticAnalyzer(sequence);

    for (const token of analyzer.sequence) {
      const [ consumed, error ] = analyzer.consume(token);
      if (!consumed) {
        throw error;
      }

      if (analyzer.isComplete()) {
        analyzer.tokens.push(
          analyzer.build()
        );
      }
    }

    if (analyzer.target) {
      throw new SemanticError(undefined, analyzer.expect);
    }

    return analyzer;
  }

  public get result(): SemanticToken[] {
    return this.tokens;
  }

  // state machine
  private consume(token: TokenInfo): [ true, null ] | [ false, SemanticError ] {
    if (this.target) {
      if (this.target === SemanticTokenType.TEXT) {
        throw new Error('Invalid state: previous sequence was not built');
      }

      if (this.expect.shift() !== token.type) {
        return [
          false,
          new SemanticError(token, this.expect)
        ]
      }
    } else {
      switch (token.type) {
        case Token.INTERPOLATION_START: {
          this.target = SemanticTokenType.VARIABLE;
          this.expect = [ Token.TEXT, Token.INTERPOLATION_END ];
          break;
        }
        case Token.TEXT: {
          this.target = SemanticTokenType.TEXT;
          break;
        }
        case Token.INTERPOLATION_END: {
          return [
            false,
            new SemanticError(token, [ Token.INTERPOLATION_START, Token.TEXT ])
          ]
        }
      }
    }

    this.subsequence.push(token);
    return [ true, null ];
  }

  private isComplete(): boolean {
    if (this.target === SemanticTokenType.TEXT && this.subsequence.length > 0) {
      return true;
    }

    if (this.target === SemanticTokenType.VARIABLE && this.subsequence.length === 3) {
      return true;
    }

    return false;
  }

  private build(): SemanticToken {
    if (this.target === SemanticTokenType.TEXT && this.subsequence.length === 1) {
      const txt = this.subsequence[0];
      this.reset();
      return {
        type: SemanticTokenType.TEXT,
        value: txt.fragment,
        position: txt.position,
        line: txt.line,
        column: txt.column,
      }
    }

    if (this.target === SemanticTokenType.VARIABLE && this.subsequence.length === 3) {
      // {{ TEXT }}
      const varOpen = this.subsequence[0];
      const txt = this.subsequence[1];
      this.reset();
      return {
        type: SemanticTokenType.VARIABLE,
        value: txt.fragment,
        position: varOpen.position,
        line: varOpen.line,
        column: varOpen.column,
      }
    }

    throw new Error('Invalid state: either no target or insufficient sequence length');
  }

  private reset() {
    this.target = undefined;
    this.expect = [];
    this.subsequence = [];
  }
}

export class SemanticError extends Error {

  constructor(
    private token: TokenInfo | undefined,
    private expect: Token[] = []
  ) {
    super()
  }

  public toString(): string {
    if (!this.token) {
      return `Unexpected end of sequence, expected ${this.expect.join(', ')}`;
    }

    const buf = new Array<string>();
    buf.push(`Unexpected token ${this.token.type}`);
    if (this.expect.length > 0) {
      buf.push(`, expected ${this.expect.join(', ')}`);
    }

    buf.push(`\n\t`);
    buf.push(`at ${this.token.line}:${this.token.column}`);
    buf.push(`\n\t`);
    buf.push(this.token.fragment.substring(0, 50));
    buf.push(`\n\t`);
    buf.push(`^^^^^^^^^^`);

    return buf.join('');
  }
}