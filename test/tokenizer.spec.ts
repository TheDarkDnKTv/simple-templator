import { describe, it, expect } from 'vitest';
import { Tokenizer } from '../lib/tokenizer.js';
import { Token, TokenInfo } from '../lib/types.js';

describe('template/tokenizer', () => {
  it('should tokenize simple text', () => {
    const tokenizer = Tokenizer.tokenize('Hello World');
    expect(tokenizer.result).to.deep.equal([ {
      type: Token.TEXT,
      line: 0,
      column: 0,
      position: 0,
      fragment: 'Hello World'
    } ] satisfies TokenInfo[]);
  });

  it('should tokenize interpolation', () => {
    const tokenizer = Tokenizer.tokenize('{{variable}}');
    expect(tokenizer.result).to.deep.equal([
      {
        type: Token.INTERPOLATION_START,
        line: 0,
        column: 0,
        position: 0,
        fragment: '{{'
      },
      {
        type: Token.TEXT,
        line: 0,
        column: 2,
        position: 2,
        fragment: 'variable'
      },
      {
        type: Token.INTERPOLATION_END,
        line: 0,
        column: 10,
        position: 10,
        fragment: '}}'
      }
    ] satisfies TokenInfo[]);
  });

  it('should tokenize mixed content', () => {
    const tokenizer = Tokenizer.tokenize('Hello {{name}}!');
    expect(tokenizer.result).to.deep.equal([
      {
        type: Token.TEXT,
        line: 0,
        column: 0,
        position: 0,
        fragment: 'Hello '
      },
      {
        type: Token.INTERPOLATION_START,
        line: 0,
        column: 6,
        position: 6,
        fragment: '{{'
      },
      {
        type: Token.TEXT,
        line: 0,
        column: 8,
        position: 8,
        fragment: 'name'
      },
      {
        type: Token.INTERPOLATION_END,
        line: 0,
        column: 12,
        position: 12,
        fragment: '}}'
      },
      {
        type: Token.TEXT,
        line: 0,
        column: 14,
        position: 14,
        fragment: '!'
      }
    ] satisfies TokenInfo[]);
  });

  it('should tokenize with correct when other partial token present', () => {
    const tokenizer = Tokenizer.tokenize('Hello {{ t{es}t }}!');
    expect(tokenizer.result).to.deep.equal([
      {
        type: Token.TEXT,
        line: 0,
        column: 0,
        position: 0,
        fragment: 'Hello '
      },
      {
        type: Token.INTERPOLATION_START,
        line: 0,
        column: 6,
        position: 6,
        fragment: '{{'
      },
      {
        type: Token.TEXT,
        line: 0,
        column: 8,
        position: 8,
        fragment: ' t{es}t '
      },
      {
        type: Token.INTERPOLATION_END,
        line: 0,
        column: 16,
        position: 16,
        fragment: '}}'
      },
      {
        type: Token.TEXT,
        line: 0,
        column: 18,
        position: 18,
        fragment: '!'
      }
    ] satisfies TokenInfo[]);
  });

  it('should handle multiline content', () => {
    const tokenizer = Tokenizer.tokenize('Line 1\nLine {{2}}\nLine 3');
    expect(tokenizer.result).to.deep.equal([
      {
        type: Token.TEXT,
        line: 0,
        column: 0,
        position: 0,
        fragment: 'Line 1\nLine '
      },
      {
        type: Token.INTERPOLATION_START,
        line: 1,
        column: 5,
        position: 12,
        fragment: '{{'
      },
      {
        type: Token.TEXT,
        line: 1,
        column: 7,
        position: 14,
        fragment: '2'
      },
      {
        type: Token.INTERPOLATION_END,
        line: 1,
        column: 8,
        position: 15,
        fragment: '}}'
      },
      {
        type: Token.TEXT,
        line: 1,
        column: 10,
        position: 17,
        fragment: '\nLine 3'
      }
    ] satisfies TokenInfo[]);
  });

  it('should handle empty', () => {
    const tokenizer = Tokenizer.tokenize('');
    expect(tokenizer.result).to.deep.equal([]);
  });
});