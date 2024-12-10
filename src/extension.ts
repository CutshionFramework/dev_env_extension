import * as vscode from 'vscode';
import axios from 'axios';
import * as child_process from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "pionoid-dev-environment-" is now active!');

    const disposable = vscode.commands.registerCommand('pionoid-dev-environment-.openWebview', async () => {
        const panel = vscode.window.createWebviewPanel(
            'pionoidDevEnvironment',
            'Pionoid Dev Environment Extension',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        try {
            const contents = await fetchPythonFiles();
            console.log('Fetched contents:', contents); // Debugging log

            const parsedContent = await parsePythonFiles(contents);
            console.log('Parsed content:', parsedContent); // Debugging log

            panel.webview.html = getWebviewContent(parsedContent);
        } catch (error) {
            console.error('Error fetching or parsing content:', error);
            panel.webview.html = `<h1>Error fetching or parsing content</h1>`;
        }
    });

    context.subscriptions.push(disposable);

    // Automatically execute the command when the extension is activated
    vscode.commands.executeCommand('pionoid-dev-environment-.openWebview');
}

async function fetchPythonFiles(): Promise<string[]> {
    const urls = [
        'https://raw.githubusercontent.com/CutshionFramework/Pionoid_developer_api/bce69574f9806cf124ec1d223884fbcb6b3dda3d/src/integrations/AIvision_integration.py',
        'https://raw.githubusercontent.com/CutshionFramework/Pionoid_developer_api/2f406f90815a5674235d9e31ccf7a9e92c5d277b/src/integrations/Openai_voice_control.py',
        'https://raw.githubusercontent.com/CutshionFramework/Pionoid_developer_api/0b8e425df7c4dfef9c2335845eba287ea06b133b/src/integrations/stripe_online_payment.py',
        'https://raw.githubusercontent.com/CutshionFramework/Pionoid_developer_api/1d4ba5e5c15d7c7890442f5a6338a5090ad260be/src/integrations/mongodb_storage.py'
    ];

    const responses = await Promise.all(urls.map(url => axios.get(url)));
    return responses.map(response => response.data);
}

async function parsePythonFiles(contents: string[]): Promise<{ [className: string]: { functions: string[] } }> {
    const parserPath = path.join(__dirname, '..', 'src', 'parser.py');

    const results = await Promise.all(contents.map(content => {
        return new Promise<{ [className: string]: { functions: string[] } }>((resolve, reject) => {
            const process = child_process.spawn('python', [parserPath]);

            let result = '';
            process.stdout.on('data', (data) => {
                result += data.toString();
            });

            process.stderr.on('data', (data) => {
                console.error('Error:', data.toString());
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(JSON.parse(result));
                } else {
                    reject(new Error('Failed to parse Python file'));
                }
            });

            process.stdin.write(content);
            process.stdin.end();
        });
    }));

    const combinedResults = results.reduce((acc, result) => {
        for (const className in result) {
            if (!acc[className]) {
                acc[className] = { functions: [] };
            }
            acc[className].functions.push(...result[className].functions);
        }
        return acc;
    }, {} as { [className: string]: { functions: string[] } });

    return combinedResults;
}

function getWebviewContent(parsedContent: { [className: string]: { functions: string[] } }): string {
    const classesList = Object.keys(parsedContent).map(className => {
        const functionsList = parsedContent[className].functions.map(func => `
            <tr>
                <td class="function-item" onclick="handleClick('${className}', '${func}')">${func}</td>
                <td class="parameters-item">Parameters</td>
                <td class="parameters-item">Parameters2</td>
                <td class="select-item"><input type="checkbox" id="select-${func}" class="modern-checkbox"></td>
            </tr>
        `).join('');
        return `
            <tr>
                <td class="class-name" colspan="4">${className}</td>
            </tr>
            <tr>
                <th class="column-title">Function</th>
                <th class="column-title">Parameters</th>
                <th class="column-title">Parameters2</th>
                <th class="column-title">Select</th>
            </tr>
            ${functionsList}
        `;
    }).join('');

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pionoid Dev Environment Extension</title>
        <style>
            body { font-family: Arial, sans-serif; }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, tr {
                border-bottom: 2px solid #021526;
            }
            .class-name {
                text-align: left;
                font-size: 1.2em;
                padding: 10px;
            }
            .column-title {
                text-align: center;
                font-size: 1em;
                padding: 10px;
            }
            .function-item {
                background-color: #021526;
                color: white;
                padding: 10px;
                margin: 5px;
                border-radius: 5px;
                cursor: pointer;
                text-align: center;
                font-size: 0.9em;
                display: inline-block;
                width: auto;
            }
            .function-item:hover {
                background-color: #03346E;
            }
            .parameters-item {
                text-align: center;
                font-size: 0.9em;
                padding: 10px;
            }
            .select-item {
                text-align: center;
                padding: 10px;
            }
            .modern-checkbox {
                appearance: none;
                background-color: #fff;
                border: 1px solid #ccc;
                padding: 9px;
                border-radius: 3px;
                display: inline-block;
                position: relative;
            }
            .modern-checkbox:checked {
                background-color: #007acc;
                border: 1px solid #007acc;
            }
            .modern-checkbox:checked:after {
                content: '\\2714';
                font-size: 14px;
                position: absolute;
                top: 0;
                left: 3px;
                color: white;
            }
            .collapsible {
                background-color: #021526;
                color: white;
                cursor: pointer;
                padding: 10px;
                width: 100%;
                border: none;
                text-align: left;
                outline: none;
                font-size: 1.2em;
            }
            .active, .collapsible:hover {
                background-color: transparent;
            }
            .content {
                padding: 0 18px;
                display: none;
                overflow: hidden;
                background-color: transparent;
            }
        </style>
    </head>
    <body>
        <h1>Pionoid Dev Environment</h1>
        <button type="button" class="collapsible">Integrations</button>
        <div class="content">
            <table>
                ${classesList}
            </table>
        </div>
        <script>
            function handleClick(className, functionName) {
                alert('Class: ' + className + '\\nFunction: ' + functionName);
            }

            document.addEventListener('DOMContentLoaded', function() {
                var coll = document.getElementsByClassName("collapsible");
                for (var i = 0; i < coll.length; i++) {
                    coll[i].addEventListener("click", function() {
                        this.classList.toggle("active");
                        var content = this.nextElementSibling;
                        if (content.style.display === "block") {
                            content.style.display = "none";
                        } else {
                            content.style.display = "block";
                        }
                    });
                }
            });
        </script>
    </body>
    </html>`;
}

export function deactivate() {}