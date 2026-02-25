# VS Code Error Sound Alert 🔔

[![Version](https://img.shields.io/badge/version-0.0.2-blue.svg)](https://marketplace.visualstudio.com/items?itemName=error-sound-alert.error-sound-player)
[![Platform](https://img.shields.io/badge/platform-windows%20%7C%20macos%20%7C%20linux-lightgrey.svg)](https://marketplace.visualstudio.com/items?itemName=error-sound-alert.error-sound-player)
[![Downloads](https://img.shields.io/badge/downloads-1K%2B-brightgreen.svg)](https://marketplace.visualstudio.com/items?itemName=error-sound-alert.error-sound-player)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Never miss an error again!** 🔔 Plays an audible alert whenever your terminal commands fail or errors occur in VS Code.


---

## ✨ Features

- **Hear Your Errors**: Instant audio feedback for terminal failures.
- **Stay Focused**: No need to constantly monitor the terminal.
- **Boost Productivity**: Immediate notifications for faster debugging.
- **Versatile**: Perfect for developers, students, and presentations.

---

## 🚀 Quick Start

### Installation

1. Open VS Code.
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac).
3. Search **"Error Sound Alert"**.
4. Click Install.

---

## 🎛️ Configuration

Access settings via `File → Preferences → Settings` (or `Ctrl+,` / `Cmd+,`).

### Basic Settings
```json
{
  "errorSoundPlayer.enabled": true,              // Enable/disable sounds
  "errorSoundPlayer.soundFile": "error.wav",     // Your sound file name
  "errorSoundPlayer.volume": 70,                  // Volume (0-100)
  "errorSoundPlayer.cooldownPeriod": 2            // Cooldown (seconds)
}
```

### Advanced Settings
```json
{
  "errorSoundPlayer.playOnlyOnError": true,       // Ignore warnings
  "errorSoundPlayer.customSoundPaths": [          // Extra sound locations
    "C:\\MySounds",
    "~/Music/Sounds"
  ]
}
```

---

## 🎮 Commands

| Command                          | Description                |
|----------------------------------|----------------------------|
| `Error Sound: Test Sound`        | Test if sound works        |
| `Error Sound: Enable`            | Turn on error sounds       |
| `Error Sound: Disable`           | Turn off error sounds      |
| `Error Sound: Select Custom Sound` | Pick your own sound file |

---

## 📊 System Requirements

| Platform | Minimum                | Recommended             |
|----------|------------------------|-------------------------|
| Windows  | Windows 10, VS Code 1.60 | Windows 11, latest VS Code |
| macOS    | macOS 11 (Big Sur)     | macOS 14 (Sonoma)       |
| Linux    | Ubuntu 20.04, VS Code 1.60 | Latest LTS, latest VS Code |

---

## 🤔 FAQ

- **Does it work with WSL?**
  Yes! Fully compatible with WSL terminals in VS Code.
- **Can I use MP3 files?**
  Yes, all major audio formats are supported (WAV, MP3, M4A, AIFF).
- **Will it play for every error?**
  Only for command failures (non-zero exit codes).
- **Can I use different sounds for different errors?**
  Currently, one sound is supported, but multi-sound support is planned.

---

## 📈 Roadmap

- [ ] Multiple sound profiles for different error types.
- [ ] Custom sounds per programming language.
- [ ] Visual notifications as a fallback.
- [ ] Built-in sound library.

---

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

---

## 📜 License

MIT License - Free for personal and commercial use.

---

## ⭐ Support

If you find this extension helpful:
- ⭐ Star it on [GitHub](https://github.com/tanvir-ahamed04/Error-Sound-Alert-VSCODE-extension.git).
- 🔗 Share it with your network.

---

**Made with ❤️ for developers who want to hear their errors.**
