import { describe, it, expect } from 'vitest';
import { Token } from '../lib/types.js';
import { MatcherResult, SimpleTokenMatcher, TextTokenMatcher } from '../lib/token-matcher.js';

describe('template/token-matcher/SimpleTokenMatcher', () => {
  const matcher = new SimpleTokenMatcher(Token.INTERPOLATION_START, 1, '${');

  it('should match exact token representation', () => {
    expect(matcher.match('${')).to.equal(MatcherResult.MATCH);
  });

  it('should continue on partial match', () => {
    expect(matcher.match('$')).to.equal(MatcherResult.CONTINUE);
  });

  it('should skip on non-matching input', () => {
    expect(matcher.match('abc')).to.equal(MatcherResult.SKIP);
  });

  it('should skip on longer input', () => {
    expect(matcher.match('${abc')).to.equal(MatcherResult.SKIP);
  });

  it('should have correct token type', () => {
    expect(matcher.token).to.equal(Token.INTERPOLATION_START);
  });

  it('should have correct priority', () => {
    expect(matcher.priority).to.equal(1);
  });
});

describe('template/token-matcher/TextTokenMatcher', () => {
  const matcher = new TextTokenMatcher(Token.TEXT, 0);

  it('should always match any input', () => {
    expect(matcher.match('any text')).to.equal(MatcherResult.MATCH);
    expect(matcher.match('')).to.equal(MatcherResult.MATCH);
    expect(matcher.match('123')).to.equal(MatcherResult.MATCH);
    expect(matcher.match('${')).to.equal(MatcherResult.MATCH);
  });

  it('should have correct token type', () => {
    expect(matcher.token).to.equal(Token.TEXT);
  });

  it('should have correct priority', () => {
    expect(matcher.priority).to.equal(0);
  });
});