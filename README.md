# Title-Link Copy: AP-style Title Casing option 

A privacy-focused Firefox extension for Desktop and Android that creates perfect citations. Easily copy page titles and URLs with advanced formatting options, including AP-Style smart capitalization and selected text citation.

## Features

### 🖱️ Context Menus (Desktop)
Right-click on the page background or specific links to access a dedicated submenu:

* **Page Actions** (Right-click anywhere on page):
    * 📄 Title + Page URL
    * 📄 Page Title only
    * 🔗 Page URL only
* **Link Actions** (Right-click on a link):
    * 🔗 Link Text + URL
    * 🔗 Link Text only
    * 🔗 Link URL only

### 📱 Responsive Popup (Desktop & Android)
A clean, button-based interface available via the browser toolbar:
* Quick-copy buttons for Title+Link, Title Only, or Link Only.
* **Embedded Settings:** Configure AP-Style casing and text placement directly inside the popup without opening a separate tab.
* **Auto-Save:** Settings changes are saved instantly.

### ⌨️ Keyboard Shortcuts
Streamline your workflow with global shortcuts (customizable in Firefox Add-on settings)

### 🧠 Advanced Formatting
* **AP-Style Title Casing:** Features a smart algorithm that formats titles according to AP Stylebook guidelines.
    * *Smart Logic:* Handles minor words (a, an, the, of), internal capitals (e.g., "iPhone", "YouTube"), and possessives correctly.
* **Selected Text Support:** If you highlight text before copying, it can be automatically included.
    * Options: Place text **Above** the link, **Below** the link, or **Ignore** it.

### 🔒 Privacy Focused
* **Zero Data Collection:** This extension does not track you, collect analytics, or transmit data.
* **Minimal Permissions:** Requires only `activeTab`, `contextMenus`, and `clipboardWrite`. It uses local storage for settings, meaning it does **not** require the broad `storage` permission.

## Usage Guide

### The Output Format
When copying a Title and Link (with optional selected text), the extension formats the clipboard content on separate lines for easy pasting into emails, documents, or chats:

```text
The Page Title (AP Styled if enabled)
[https://www.example.com/article](https://www.example.com/article)
"This is the specific text you selected on the page."