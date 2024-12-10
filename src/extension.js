"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
function activate(context) {
    console.log('Congratulations, your extension "pionoid-dev-environment-" is now active!');
    const disposable = vscode.commands.registerCommand('pionoid-dev-environment-.openWebview', async () => {
        const panel = vscode.window.createWebviewPanel('pionoidDevEnvironment', 'Pionoid Dev Environment', vscode.ViewColumn.One, {
            enableScripts: true
        });
        const content = await fetchPythonFile();
        const parsedContent = parsePythonFile(content);
        panel.webview.html = getWebviewContent(parsedContent);
    });
    context.subscriptions.push(disposable);
    // Automatically execute the command when the extension is activated
    vscode.commands.executeCommand('pionoid-dev-environment-.openWebview');
}
async function fetchPythonFile() {
    const url = 'https://raw.githubusercontent.com/CutshionFramework/Pionoid_developer_api/bce69574f9806cf124ec1d223884fbcb6b3dda3d/src/integrations/AIvision_integration.py';
    const response = await axios_1.default.get(url);
    return response.data;
}
function parsePythonFile(content) {
    const functionRegex = /^def\s+(\w+)\s*\(/gm;
    const classRegex = /^class\s+(\w+)\s*\(/gm;
    const functions = [];
    const classes = [];
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
        functions.push(match[1]);
    }
    while ((match = classRegex.exec(content)) !== null) {
        classes.push(match[1]);
    }
    return { functions, classes };
}
function getWebviewContent(parsedContent) {
    const functionsList = parsedContent.functions.map(func => `<li>${func}</li>`).join('');
    const classesList = parsedContent.classes.map(cls => `<li>${cls}</li>`).join('');
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pionoid Dev Environment</title>
        <style>
            body { font-family: Arial, sans-serif; }
            .rectangle {
                width: 100px;
                height: 100px;
                background-color: #4CAF50;
                margin: 10px;
            }
            .container {
                display: flex;
                flex-wrap: wrap;
            }
        </style>
    </head>
    <body>
        <h1>Pionoid Dev Environment</h1>
        <h2>Functions</h2>
        <ul>${functionsList}</ul>
        <h2>Classes</h2>
        <ul>${classesList}</ul>
    </body>
    </html>`;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map