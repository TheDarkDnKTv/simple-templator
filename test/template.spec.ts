import { describe, it, expect, assert } from 'vitest';
import { Template } from '../lib/template.js';

describe('template/Template', () => {
  it('should handle empty template', () => {
    const template = Template.parse('');
    expect(template.process({})).to.equal('');
  });

  it('should keep output same if nothing beside text is in template', () => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec rutrum ut magna at pretium. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ante augue, egestas sit amet interdum eu, congue nec nulla. Sed velit massa, posuere at vestibulum vitae, porta sed nisl. In commodo eleifend congue. Integer viverra viverra sapien ut eleifend. Quisque sit amet massa vitae tortor ultrices dignissim. Pellentesque lectus lectus, congue ut iaculis id, auctor et ante. Donec id mollis nisi. Praesent condimentum sem a massa feugiat congue. Curabitur id orci ipsum. Suspendisse potenti. '
    const template = Template.parse(text);
    expect(template.process({})).to.equal(text);
  });

  it('should process template with single variable', () => {
    const template = Template.parse('Hello, {{name}}!');
    expect(template.process({ name: 'World' })).to.equal('Hello, World!');
  });

  it('should process template with multiple variables', () => {
    const template = Template.parse('{{greeting}}, {{name}}!');
    expect(template.process({ greeting: 'Hello', name: 'World' })).to.equal('Hello, World!');
  });

  it('should process template with multiple variables with same name', () => {
    const template = Template.parse('{{ aa }}!{{ bb }}{{ bb }}');
    expect(template.process({ aa: 'test', bb: 'this' })).to.equal('test!thisthis');
  });

  it('should throw error for undefined variables', () => {
    const template = Template.parse('Hello, {{name}}!');
    expect(() => template.process({})).to.throw('Variable "name" is not defined');
  });

  it('should handle case-sensitive variables', () => {
    const template = Template.parse('{{Name}}', { caseSensitive: true });
    expect(() => template.process({ name: 'World' })).to.throw('Variable "Name" is not defined');
  });

  it('should handle case-insensitive variables', () => {
    const template = Template.parse('{{Name}}', { caseSensitive: false });
    expect(() => template.process({ NAME: 'World' })).to.not.throw('Variable "Name" is not defined');
  });

  it('should handle variable content trimming skip', () => {
    const template = Template.parse('{{ name }}', { skipVariableContentTrimming: true });
    expect(() => template.process({ name: 'World' })).to.throw('Variable " name " is not defined');
  });

  it('should handle variable content trimming', () => {
    const template = Template.parse('{{ name }}', { skipVariableContentTrimming: false });
    expect(() => template.process({ name: 'World' })).to.not.throw();
  });

  it('should ignore undefined variables when option is set', () => {
    const template = Template.parse('Hello, {{name}}!', { ignoreUndefinedVariables: true });
    expect(template.process({})).to.equal('Hello, !');
  });

  it('should correctly check variable existence', () => {
    const template = Template.parse('{{var1}} {{var2}}');
    assert.isTrue(template.hasVariable('var1'));
    assert.isFalse(template.hasVariable('var3'));
  });

  it('should handle empty variable name', () => {
    const template = Template.parse('{{ }}');
    expect(() => template.process({ '': 'test' })).not.to.throw().eq('test');
  });
});