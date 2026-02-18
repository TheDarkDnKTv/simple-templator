import { Comparator } from 'comparator-framework';
import { Token, TokenInfo } from './types.js';
import { MatcherResult, SimpleTokenMatcher, TextTokenMatcher, TokenMatcher } from './token-matcher.js';

const MATCHERS: TokenMatcher[] = [
  new SimpleTokenMatcher(Token.INTERPOLATION_START, 10, '{{'),
  new SimpleTokenMatcher(Token.INTERPOLATION_END, 10, '}}'),
  new TextTokenMatcher(Token.TEXT, 0),
].sort(Comparator.comparing<TokenMatcher>('priority').reversed());

type MatchCandidate = {
  matcher: TokenMatcher;
  matchStart: string;
  startLine: number;
  startColumn: number;
  startPosition: number;
}

export class Tokenizer {

  private tokens: TokenInfo[];
  private candidates: MatchCandidate[];

  private constructor() {
    this.tokens = [];
    this.candidates = [];
  }

  public static tokenize(input: string): Tokenizer {
    const tokenizer = new Tokenizer();

    let i = 0;
    let line = 0;
    let column = 0;

    while (i < input.length) {
      const ch = input.charAt(i);

      const continueCandidates = new Array<MatchCandidate>();
      const matchedCandidates = new Array<MatchCandidate>();
      for (const candidate of tokenizer.candidates) {
        candidate.matchStart += ch;
        const result = candidate.matcher.match(candidate.matchStart);
        if (result === MatcherResult.CONTINUE) {
          continueCandidates.push(candidate);
        } else if (result === MatcherResult.MATCH) {
          matchedCandidates.push(candidate);
        }
      }

      // something beside TEXT is present
      if (matchedCandidates.length > 1) {
        const mostValuableMatch = matchedCandidates[0];
        const txt = matchedCandidates.find(mc => mc.matcher.token === Token.TEXT);
        if (txt && mostValuableMatch.startPosition > txt.startPosition) {
          tokenizer.tokens.push({
            type: Token.TEXT,
            line: txt.startLine,
            column: txt.startColumn,
            position: txt.startPosition,
            fragment: txt.matchStart.slice(0, mostValuableMatch.startPosition - txt.startPosition)
          });
        }

        tokenizer.tokens.push({
          type: mostValuableMatch.matcher.token,
          line: mostValuableMatch.startLine,
          column: mostValuableMatch.startColumn,
          position: mostValuableMatch.startPosition,
          fragment: mostValuableMatch.matchStart
        });

        tokenizer.candidates = [];
      }

      const newMatchers = MATCHERS
        .filter(m => !continueCandidates.concat(matchedCandidates).some(cc => cc.matcher.token === m.token))
        .filter(m => m.match(ch) !== MatcherResult.SKIP)
        .map(m => ({
          matcher: m,
          matchStart: ch,
          startPosition: i,
          startLine: line,
          startColumn: column,
        } satisfies MatchCandidate));

      tokenizer.candidates = tokenizer.candidates.concat(newMatchers).sort(
        Comparator.comparing(
          mc => mc.matcher.priority,
          Comparator.reverseOrder<number>()
        )
      )

      i++;
      column++;
      if (ch === '\n') {
        line++;
        column = 0;
      }
    }

    // Add last TXT node
    if (i > 0) {
      const lastToken = tokenizer.tokens[-1];
      const txt = tokenizer.candidates.find(mc => mc.matcher.token === Token.TEXT);
      if (txt && (!lastToken || lastToken.position < txt.startPosition)) {
        tokenizer.tokens.push({
          type: Token.TEXT,
          line: txt.startLine,
          column: txt.startColumn,
          position: txt.startPosition,
          fragment: txt.matchStart
        })
      }
    }

    return tokenizer;
  }

  get result(): readonly TokenInfo[] {
    return Object.freeze([...this.tokens])
  }
}

