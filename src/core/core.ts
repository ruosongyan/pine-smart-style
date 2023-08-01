import * as vscode from 'vscode';
import * as Acorn from 'acorn';
import * as AcornJSX from 'acorn-jsx';
import { getActiveSelectionText, getActiveDirPath } from './utils';
import Styler from './styler';

function parseDom(source: string) {
  const parser = Acorn.Parser.extend(AcornJSX({}));
  const wrapperDom = `<root>${source}</root>`;
  const ast = parser.parse(wrapperDom, { ecmaVersion: 'latest' });
  return ast;
}

export function generateStyle(){
  const selectionText = getActiveSelectionText();
  const styler = new Styler();
  if(selectionText) {
    const ast = parseDom(selectionText);
    const str = styler.generateStyle(ast);
    
    return str;
  }
  return '';
}
