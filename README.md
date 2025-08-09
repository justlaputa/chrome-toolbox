# Small chrome tricks for my life

A handy Chrome extension that provides keyboard shortcuts for efficient tab management and Google search navigation.

## Features

### 🔍 Smart Google Tab Navigation
- **Ctrl+I**: Instantly jump to an existing Google search tab or create a new one
- Automatically focuses on the search box for immediate typing
- Closes duplicate Google tabs to keep your browser organized

### 📑 Advanced Tab Management
- **Ctrl+U**: Sort all tabs by URL (groups similar domains together)
- **Ctrl+J**: Move current tab to the beginning of the tab bar
- Smart handling of pinned tabs (they stay in place)

### 🔗 Link Highlighting
- **Ctrl+K**: Toggle highlighting of all links on the current page
- External links get special indicators with favicons and arrow icons
- Easy visual identification of clickable elements

## Installation

### From Source (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension will be installed and keyboard shortcuts will be active

## Usage

### Keyboard Shortcuts
| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+I` | Goto Google Tab | Jump to existing Google tab or create new one |
| `Ctrl+U` | Sort Tabs by URL | Organize tabs by domain name |
| `Ctrl+J` | Move Tab to Head | Move current tab to first position |
| `Ctrl+K` | Highlight Links | Toggle link highlighting on current page |

### Customizing Shortcuts
1. Go to `chrome://extensions/shortcuts`
2. Find "Goto Google" in the list
3. Click the pencil icon to modify any shortcut
4. Set your preferred key combinations

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: Minimal required permissions for tab management
- **Compatibility**: Chrome 88+ (Manifest V3 support)
- **Architecture**: Service worker background script with content script injection

## Privacy

This extension:
- ✅ Works entirely locally on your browser
- ✅ Does not collect or transmit any personal data
- ✅ Only accesses tab information for management purposes
- ✅ Uses minimal permissions required for functionality

## Development

### Project Structure
```
├── manifest.json          # Extension configuration
├── background.js          # Service worker (main logic)
├── content.js            # Content script for page interaction
├── LICENSE              # MIT License
└── README.md            # This file
```

### Recent Updates
- Upgraded from Manifest V2 to V3 for future compatibility
- Consolidated multiple background scripts into single service worker
- Improved security with updated permissions model
- Enhanced error handling and logging

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this extension.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for productivity enthusiasts**
