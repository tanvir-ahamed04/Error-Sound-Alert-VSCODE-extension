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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
function activate(context) {
    console.log('=================================');
    console.log('✅ Cross-Platform Error Sound Extension');
    console.log('=================================');
    let lastPlayTime = 0;
    let errorCount = 0;
    function getConfig() {
        const config = vscode.workspace.getConfiguration('errorSoundPlayer');
        return {
            enabled: config.get('enabled', true),
            soundFile: config.get('soundFile', 'faaa.wav'),
            volume: config.get('volume', 70),
            cooldownPeriod: config.get('cooldownPeriod', 2),
            playOnlyOnError: config.get('playOnlyOnError', true),
            customSoundPaths: config.get('customSoundPaths', [])
        };
    }
    const testCommand = vscode.commands.registerCommand('error-sound-player.test', () => {
        vscode.window.showInformationMessage('🔊 Playing test sound...');
        playFailSound(context);
    });
    const enableCommand = vscode.commands.registerCommand('error-sound-player.enable', async () => {
        const config = vscode.workspace.getConfiguration('errorSoundPlayer');
        await config.update('enabled', true, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('✅ Error sound player enabled');
    });
    const disableCommand = vscode.commands.registerCommand('error-sound-player.disable', async () => {
        const config = vscode.workspace.getConfiguration('errorSoundPlayer');
        await config.update('enabled', false, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('🔇 Error sound player disabled');
    });
    const selectSoundCommand = vscode.commands.registerCommand('error-sound-player.selectSound', async () => {
        const options = {
            canSelectMany: false,
            openLabel: 'Select Sound File',
            filters: {
                'Audio files': ['wav', 'mp3', 'm4a', 'aiff']
            }
        };
        const fileUri = await vscode.window.showOpenDialog(options);
        if (fileUri && fileUri[0]) {
            const config = vscode.workspace.getConfiguration('errorSoundPlayer');
            await config.update('soundFile', fileUri[0].fsPath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`✅ Sound file set to: ${path.basename(fileUri[0].fsPath)}`);
        }
    });
    const terminalListener = vscode.window.onDidEndTerminalShellExecution(async (e) => {
        const config = getConfig();
        if (!config.enabled) {
            return;
        }
        const now = Date.now();
        const cooldownMs = config.cooldownPeriod * 1000;
        if (e.exitCode !== undefined && e.exitCode !== 0) {
            console.log(`❌ Command failed in "${e.terminal.name}" with code: ${e.exitCode}`);
            if (now - lastPlayTime > cooldownMs) {
                lastPlayTime = now;
                errorCount++;
                playFailSound(context);
            }
            else {
                console.log(`⏱️ Cooldown active (${config.cooldownPeriod}s), skipping`);
            }
        }
    });
    const taskListener = vscode.tasks.onDidEndTaskProcess((e) => {
        const config = getConfig();
        if (!config.enabled || !config.playOnlyOnError) {
            return;
        }
        if (e.exitCode !== undefined && e.exitCode !== 0) {
            console.log(`❌ Task failed: ${e.execution.task.name}`);
            const now = Date.now();
            const cooldownMs = config.cooldownPeriod * 1000;
            if (now - lastPlayTime > cooldownMs) {
                lastPlayTime = now;
                playFailSound(context);
            }
        }
    });
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(bell) Error Sound";
    statusBarItem.tooltip = "Error Sound Player - Click to configure";
    statusBarItem.command = "error-sound-player.test";
    statusBarItem.show();
    context.subscriptions.push(testCommand, enableCommand, disableCommand, selectSoundCommand, terminalListener, taskListener, statusBarItem);
    const platform = process.platform;
    if (platform === 'darwin') {
        console.log('🍎 Running on macOS');
    }
    else if (platform === 'win32') {
        console.log('🪟 Running on Windows');
    }
    else {
        console.log('🐧 Running on Linux');
    }
    console.log('👂 Listening for command failures...');
    console.log('💡 Use "Test Error Sound" from command palette to test');
}
function playFailSound(context) {
    try {
        const config = vscode.workspace.getConfiguration('errorSoundPlayer');
        const soundFileName = config.get('soundFile', 'faaa.wav');
        const customPaths = config.get('customSoundPaths', []);
        const volume = config.get('volume', 70);
        console.log(`🔊 Attempting to play sound: ${soundFileName}`);
        const possiblePaths = [
            path.join(context.extensionPath, 'media', soundFileName),
            path.join(context.extensionPath, 'media', 'faaa.wav'),
            path.join(context.extensionPath, 'media', 'error.wav'),
            path.join(context.extensionPath, 'sounds', soundFileName),
            path.join(__dirname, '..', 'media', soundFileName),
            path.join(__dirname, 'media', soundFileName),
            path.join(context.extensionPath, soundFileName),
            ...customPaths.map(p => path.join(p, soundFileName)),
            ...customPaths
        ];
        let soundPath = '';
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                soundPath = testPath;
                console.log('✅ Found sound at:', testPath);
                break;
            }
        }
        if (!soundPath) {
            console.error('❌ No sound file found. Checked:', possiblePaths);
            beep();
            return;
        }
        playSoundForPlatform(soundPath, volume);
    }
    catch (error) {
        console.error('❌ Error playing sound:', error);
        beep();
    }
}
function playSoundForPlatform(soundPath, volume) {
    const platform = process.platform;
    const volumeArg = volume / 100;
    if (platform === 'win32') {
        playSoundWindows(soundPath);
    }
    else if (platform === 'darwin') {
        playSoundMacOS(soundPath, volumeArg);
    }
    else {
        playSoundLinux(soundPath, volumeArg);
    }
}
function playSoundWindows(soundPath) {
    const psCommand = `powershell -c (New-Object Media.SoundPlayer '${soundPath}').PlaySync();`;
    cp.exec(psCommand, { windowsHide: true }, (error) => {
        if (error) {
            console.log('⚠️ PowerShell failed, trying WMPlayer...');
            const wmpCommand = `powershell -c "$wm = New-Object Media.MediaPlayer; $wm.URL = '${soundPath}'; $wm.controls.play(); start-sleep -seconds 2"`;
            cp.exec(wmpCommand, { windowsHide: true }, (err2) => {
                if (err2) {
                    console.log('⚠️ WMPlayer failed, trying system beep');
                    beep();
                }
            });
        }
    });
}
function playSoundMacOS(soundPath, volume) {
    const ext = path.extname(soundPath).toLowerCase();
    const afplayCmd = `afplay "${soundPath}" -v ${volume}`;
    cp.exec(afplayCmd, (error) => {
        if (error) {
            console.log('⚠️ afplay failed, trying osascript...');
            const osaCmd = `osascript -e 'beep'`;
            cp.exec(osaCmd);
            if (error.message.includes('format')) {
                const sayCmd = `say "error"`;
                cp.exec(sayCmd);
            }
        }
    });
}
function playSoundLinux(soundPath, volume) {
    const commands = [
        `aplay "${soundPath}" 2>/dev/null`,
        `play -q "${soundPath}" vol ${volume} 2>/dev/null`,
        `paplay "${soundPath}" 2>/dev/null`,
        `ffplay -nodisp -autoexit -loglevel quiet "${soundPath}" 2>/dev/null`,
        `mpg123 -q "${soundPath}" 2>/dev/null`
    ];
    let executed = false;
    for (const cmd of commands) {
        if (!executed) {
            cp.exec(cmd, (error) => {
                if (error) {
                    console.log(`⚠️ ${cmd.split(' ')[0]} failed`);
                }
            });
            executed = true;
            break;
        }
    }
    if (!executed) {
        beep();
    }
}
function beep() {
    const platform = process.platform;
    if (platform === 'win32') {
        cp.exec('rundll32 user32.dll,MessageBeep');
    }
    else if (platform === 'darwin') {
        cp.exec('osascript -e \'beep\'');
    }
    else {
        process.stdout.write('\x07');
    }
}
function deactivate() {
    console.log('👋 Error Sound Extension deactivated');
}
//# sourceMappingURL=extension.js.map