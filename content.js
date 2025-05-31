/*
  content.js

  injected inside google search tab, help the extension to pass instructions to google tab,
  it implements features like:

  - auto select the search text when user jump to google tab

*/

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (sender.tab) {
      console.debug('get message from content script: %s, ignore it', sender.tab.url);
      sendResponse({success: true});
    } else {
      console.debug('get message from extension', message);
      if (!message.type) {
        console.warn('no message type found in message');
        sendResponse({success: false});
        return;
      }
      switch (message.type) {
      case 'JUMP_TO_SEARCH':
        highlightAndSelectSearchText();
        sendResponse({success: true});
        break;

      default:
        sendResponse({success: false});
      }
    }
  }
);

function highlightAndSelectSearchText() {
  var inputBox = document.querySelector('input[title="Search"]');
  inputBox.focus();
  inputBox.select();
}

/**
 *
 *
 */
let isHighlighted = false;

function toggleHighlightLinks() {
    isHighlighted = !isHighlighted;
    if (isHighlighted) {
        highlightLinks();
    } else {
        removeHighlights();
    }
}

function highlightLinks() {
    const links = document.getElementsByTagName('a');
    const currentDomain = window.location.hostname;

    for (const link of links) {
        // Add highlight background
        link.style.backgroundColor = '#ffeb3b50';
        link.style.transition = 'background-color 0.3s';

        // Check if it's an external link
        const linkDomain = new URL(link.href).hostname;
        if (linkDomain && linkDomain !== currentDomain) {
            // Add superscript icon for external links
            const icon = document.createElement('sup');
            icon.innerHTML = ' ↗';
            icon.style.color = '#666';
            icon.classList.add('external-link-icon');

            // Only add icon if it doesn't already exist
            if (!link.querySelector('.external-link-icon')) {
                link.appendChild(icon);
            }
        }
    }
}

function removeHighlights() {
    const links = document.getElementsByTagName('a');
    for (const link of links) {
        link.style.backgroundColor = '';

        // Remove external link icons
        const icons = link.getElementsByClassName('external-link-icon');
        while (icons.length > 0) {
            icons[0].remove();
        }
    }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'HIGHLIGHT_LINKS') {
        toggleHighlightLinks();
        sendResponse({ success: true });
    }
});
