import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';
interface ExtensionConfig {
    enabled: boolean;
    soundFile: string;
    volume: number;
    cooldownPeriod: number;
    playOnlyOnError: boolean;
    customSoundPaths: string[];
}

export function activate(context: vscode.ExtensionContext) {
    console.log('=================================');
    console.log('✅ Cross-Platform Error Sound Extension');
    console.log('=================================');

    let lastPlayTime = 0;
    let errorCount = 0;
    function getConfig(): ExtensionConfig {
        const config = vscode.workspace.getConfiguration('errorSoundPlayer');
        return {
            enabled: config.get<boolean>('enabled', true),
            soundFile: config.get<string>('soundFile', 'faaa.wav'),
            volume: config.get<number>('volume', 70),
            cooldownPeriod: config.get<number>('cooldownPeriod', 2),
            playOnlyOnError: config.get<boolean>('playOnlyOnError', true),
            customSoundPaths: config.get<string[]>('customSoundPaths', [])
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
        const options: vscode.OpenDialogOptions = {
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
            } else {
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

    context.subscriptions.push(
        testCommand,
        enableCommand,
        disableCommand,
        selectSoundCommand,
        terminalListener,
        taskListener,
        statusBarItem
    );
    const platform = process.platform;
    if (platform === 'darwin') {
        console.log('🍎 Running on macOS');
    } else if (platform === 'win32') {
        console.log('🪟 Running on Windows');
    } else {
        console.log('🐧 Running on Linux');
    }

    console.log('👂 Listening for command failures...');
    console.log('💡 Use "Test Error Sound" from command palette to test');
}

function playFailSound(context: vscode.ExtensionContext) {
    try {
        const config = vscode.workspace.getConfiguration('errorSoundPlayer');
        const soundFileName = config.get<string>('soundFile', 'faaa.wav');
        const customPaths = config.get<string[]>('customSoundPaths', []);
        const volume = config.get<number>('volume', 70);

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

    } catch (error) {
        console.error('❌ Error playing sound:', error);
        beep();
    }
}

function playSoundForPlatform(soundPath: string, volume: number) {
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

function playSoundWindows(soundPath: string) {

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

function playSoundMacOS(soundPath: string, volume: number) {
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

function playSoundLinux(soundPath: string, volume: number) {
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
    } else if (platform === 'darwin') {
        cp.exec('osascript -e \'beep\'');
    } else {
        process.stdout.write('\x07');
    }
}

export function deactivate() {
    console.log('👋 Error Sound Extension deactivated');
}