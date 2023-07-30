// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { generateStyle } from './core/core';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "pine-smart-style" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('pine-smart-style.ssGenerateStyle', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        const styleStr = generateStyle();
        // 复制到剪切板
        vscode.env.clipboard.writeText(styleStr).then(() => {
            // 复制成功后的处理逻辑
            vscode.window.showWarningMessage('生成内容已复制到剪切板');
        }, (err) => {
            // 复制失败后的处理逻辑
            vscode.window.showWarningMessage('生成内容失败, err: ', err.message);
        });
    });
    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
export function deactivate() { }
//# sourceMappingURL=extension.js.map