import { SemanticToken, SemanticTokenType, VariablesValue } from './types.js';
import { Tokenizer } from './tokenizer.js';
import { SemanticAnalyzer } from './semantics.js';

export type TemplateOptions = {
  caseSensitive?: boolean;
  skipVariableContentTrimming?: boolean;
  ignoreUndefinedVariables?: boolean;
}

export class TemplateError extends Error {
  constructor(public readonly token: SemanticToken, message: string) {
    super(message + `: token at position ${token.line}:${token.column} of type ${token.type}`);
  }
}

export class Template {

  // Original variable names => processed name
  private readonly variableMap: Record<string, SemanticToken> = {};


  private tokenizer!: Tokenizer;
  private semantics!: SemanticAnalyzer;

  private constructor(
    private readonly options: TemplateOptions,
  ) {}

  /**
   * @param input
   * @param options
   * @throws SemanticError
   */
  static parse(input: string, options: TemplateOptions = {}) {
    const template = new Template(options);

    // Tokenization step
    template.tokenizer = Tokenizer.tokenize(input);
    template.semantics = SemanticAnalyzer.process(template.tokenizer.result);

    for (const v of template.semantics.result) {
      if (v.type === SemanticTokenType.VARIABLE) {
        template.variableMap[template.processExpressionName(v.value)] = v;
      }
    }

    return template;
  }

  public hasVariable(name: string): boolean {
    return this.variableMap[name] !== undefined;
  }

  /**
   * @param values
   * @thorws TemplateError
   */
  public process(values: VariablesValue): string {
    const pValues: VariablesValue = {};
    for (const [key, value] of Object.entries(values)) {
      pValues[this.processExpressionName(key)] = value
    }

    const buffer = new Array<string>();
    for (const token of this.semantics.result) {
      if (token.type === SemanticTokenType.VARIABLE) {
        const name = this.processExpressionName(token.value); 
        if (!pValues[name]) { // TODO: what happens when name === ""
          if (this.options.ignoreUndefinedVariables) {
            continue;
          }

          throw new TemplateError(token, `Variable "${name}" is not defined`);
        }

        buffer.push(pValues[name]);
      } else {
        buffer.push(token.value);
      }
    }

    return buffer.join('');
  }

  private processExpressionName(name: string): string {
    if (!this.options.caseSensitive) {
      name = name.toLowerCase();
    }

    if (!this.options.skipVariableContentTrimming) {
      name = name.trim();
    }

    return name;
  }
}