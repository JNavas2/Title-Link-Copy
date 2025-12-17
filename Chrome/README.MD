# Title-Link Copy: AP-style Casing & Hyperlink
Privacy-focused Chrome extension for Desktop that creates perfect citations. Easily copy page Titles, Links, or **rich text Hyperlinks** with advanced formatting options, including AP-Style smart capitalization and selected text citation.

## Browser Compatibility

✅ **Fully Compatible with Chrome Desktop and Microsoft Edge Desktop (Chromium).**

## Features

### 🖱️ Smart Context Menu (Desktop)
Right-click anywhere to access a clean, context-aware submenu that adapts to what you clicked:

* **Smart Actions** (Works on Page Background OR Links):
    * 📝 **Title + Link** (Copies Page Title/Link or Link Text/Link)
    * 📋 **Title only**
    * 🔗 **Link only**
    * 🌐 **Hyperlink** (Copies as a clickable rich text link)

### ⌨️ Keyboard Shortcuts
Streamline your workflow with global shortcuts (customizable in your browser's extension settings):
* Commands available for all four copy modes, including `Copy Hyperlink`.

### 🧠 Advanced Formatting
* **AP-Style Title Casing:** Features a smart algorithm that formats titles according to AP Stylebook guidelines.
    * *Smart Logic:* Handles minor words (a, an, the, of), internal capitals (e.g., "iPhone", "YouTube"), and possessives correctly.
* **Selected Text Support:** If you highlight text before copying, it can be automatically included.
    * Options: Place text **Above** the link, **Below** the link, or **Ignore** it.

### 🔒 Privacy Focused
* **Zero Data Collection:** This extension does not track you, collect analytics, or transmit data.
* **Minimal Permissions:** Requires only the specific APIs needed to interact with the active tab and save your local preferences.
* **Local Storage:** Your settings are stored locally on your device and are never synced or transmitted.

## Permissions Explained
This extension requests the absolute minimum permissions required to function. Here is exactly what each permission allows:

* **`activeTab`**: Allows the extension to read the Title and Link of the current tab only when you explicitly interact with it (e.g., via the context menu or keyboard shortcut).
* **`contextMenus`**: Allows the extension to add the "Title-Link Copy" options to your right-click menu.
* **`scripting`**: Required in Manifest V3 to read the selected text on the page and execute the copy command to your clipboard.
* **`storage`**: Used to save your personal preferences (such as AP-style casing and selected text placement) so they are remembered across browser sessions.

## Usage Guide

### The Output Formats

#### 1. Standard Copy (Title + Link)
Formats the clipboard content on separate lines for easy pasting into plain text documents or chats:

```text
The Page Title (AP Styled if enabled)
[https://www.example.com/article](https://www.example.com/article)
This is the specific text you selected on the page.
```

#### 2. Hyperlink Copy (🌐)
Creates a dual-format clipboard entry suitable for any destination:

* **Rich Text Editors (Word, Google Docs, Email):** Pastes as a clickable, blue anchor link with the Title as the text.
    * *Example:* [The Page Title](https://example.com)
* **Plain Text Editors (Notepad, Code):** Falls back to the standard "Title \n Link" format automatically.

## Version History

* **v1.1.2**:
    * **Initial release**
