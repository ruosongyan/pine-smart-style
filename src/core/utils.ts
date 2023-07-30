import * as vscode from 'vscode';

export function getActiveSelectionText() {
  const editor = vscode.window.activeTextEditor;
  const selection = editor?.selection;
  const selectedText = editor?.document.getText(selection);
  return selectedText || '';
}

export function getActiveDirPath() {
  const editor = vscode.window.activeTextEditor;
  if(editor) {
    const fileUri = editor.document.uri;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
    return workspaceFolder?.uri.fsPath;
  }
}
