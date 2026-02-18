import { Token } from './types.js';

enum MatcherResult {
  SKIP = 'SKIP',
  CONTINUE = 'CONTINUE',
  MATCH = 'MATCH',
}

interface TokenMatcher {
  get token(): Token;
  get priority(): number;
  match(val: string): MatcherResult;
}

class SimpleTokenMatcher implements TokenMatcher {

  constructor(
    public readonly token: Token,
    public readonly priority: number,
    private readonly tokenRepresentation: string,
  ) {}

  /**
   * @param val Can be a single character, or multiple, but should include {@link tokenRepresentation} from start till end
   */
  public match(val: string): MatcherResult {
    if (val.length === this.tokenRepresentation.length) {
      return val === this.tokenRepresentation ?
        MatcherResult.MATCH : MatcherResult.SKIP;
    } else if (val.length < this.tokenRepresentation.length) {
      return this.tokenRepresentation.startsWith(val) ?
        MatcherResult.CONTINUE : MatcherResult.SKIP;
    }

    return MatcherResult.SKIP;
  }
}

class TextTokenMatcher implements TokenMatcher {

  constructor(
    public readonly token: Token,
    public readonly priority: number,
  ) {}

  public match(_val: string): MatcherResult {
    return MatcherResult.MATCH;
  }
}

export {
  MatcherResult,
  TokenMatcher,
  SimpleTokenMatcher,
  TextTokenMatcher
}