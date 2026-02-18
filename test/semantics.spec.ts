import { describe, it, expect } from 'vitest';
import { SemanticAnalyzer, SemanticError } from '../lib/semantics.js';
import { SemanticTokenType, Token, TokenInfo } from '../lib/types.js';

describe('template/semantics', () => {
  it('should process single text token', () => {
    const tokens: TokenInfo[] = [ {
      type: Token.TEXT,
      fragment: 'hello',
      position: 0,
      line: 1,
      column: 1
    } ];

    const result = SemanticAnalyzer.process(tokens).result;
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.deep.equal({
      type: SemanticTokenType.TEXT,
      value: 'hello',
      position: 0,
      line: 1,
      column: 1
    });
  });

  it('should process variable token', () => {
    const tokens: TokenInfo[] = [
      {
        type: Token.INTERPOLATION_START,
        fragment: '{{',
        position: 0,
        line: 1,
        column: 1
      },
      {
        type: Token.TEXT,
        fragment: 'var',
        position: 2,
        line: 1,
        column: 3
      },
      {
        type: Token.INTERPOLATION_END,
        fragment: '}}',
        position: 5,
        line: 1,
        column: 6
      }
    ];

    const result = SemanticAnalyzer.process(tokens).result;
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.deep.equal({
      type: SemanticTokenType.VARIABLE,
      value: 'var',
      position: 0,
      line: 1,
      column: 1
    });
  });

  it('should throw error on unexpected token', () => {
    const tokens: TokenInfo[] = [
      {
        type: Token.INTERPOLATION_END,
        fragment: '}}',
        position: 0,
        line: 1,
        column: 1
      }
    ];

    expect(() => SemanticAnalyzer.process(tokens)).to.throw().and.satisfy((err: any) => {
      expect(err).to.be.instanceOf(SemanticError);
      expect(err.expect).deep.equal([ Token.INTERPOLATION_START, Token.TEXT ]);
      return true;
    });
  })

  it('should throw error on invalid variable syntax', () => {
    const tokens: TokenInfo[] = [
      {
        type: Token.INTERPOLATION_START,
        fragment: '{{',
        position: 0,
        line: 1,
        column: 1
      },
      {
        type: Token.INTERPOLATION_END,
        fragment: '}}',
        position: 2,
        line: 1,
        column: 3
      }
    ];

    expect(() => SemanticAnalyzer.process(tokens)).to.throw().and.satisfy((err: any) => {
      expect(err).to.be.instanceOf(SemanticError);
      expect(err.expect).deep.equal([ Token.INTERPOLATION_END ]);
      return true;
    });
  });

  it('should throw error on incomplete sequence', () => {
    const tokens: TokenInfo[] = [
      {
        type: Token.INTERPOLATION_START,
        fragment: '{{',
        position: 0,
        line: 1,
        column: 1
      },
      {
        type: Token.TEXT,
        fragment: 'varname',
        position: 2,
        line: 1,
        column: 3
      }
    ];

    expect(() => SemanticAnalyzer.process(tokens)).to.throw().and.satisfy((err: any) => {
      expect(err).to.be.instanceOf(SemanticError);
      expect(err.expect).deep.equal([ Token.INTERPOLATION_END ]);
      return true;
    });
  });
});