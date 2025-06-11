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
 * features:
 *  - find all the links in the current web page
 *  - highlight the links with a light yellow background color
 *  - add a superscript icon to the links if they are external links
 *  - when the shortcut key is pressed again, toggle between highlighting and removing the highlighting
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
    const links = document.querySelectorAll('a[href]:not([href=""]):not([href="/"])');

    console.debug('found %d links', links.length);

    const currentDomain = window.location.hostname;

    for (const link of links) {
        // Add highlight background
        link.style.backgroundColor = '#ffeb3b50';
        link.style.transition = 'background-color 0.3s';

        // Check if it's an external link
        const linkDomain = new URL(link.href).hostname;
        if (linkDomain && linkDomain !== currentDomain) {
            // Create container for external link indicators
            const container = document.createElement('sup');
            container.style.display = 'inline-flex';
            container.style.alignItems = 'center';
            container.style.marginLeft = '4px';
            container.classList.add('external-link-icon');

            // Add favicon image
            const favicon = document.createElement('img');
            favicon.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(linkDomain)}`;
            favicon.style.width = '16px';
            favicon.style.height = '16px';
            favicon.style.marginRight = '2px';

            // Add arrow icon
            const arrow = document.createElement('span');
            arrow.innerHTML = '↗';
            arrow.style.color = '#666';

            // Combine elements
            container.appendChild(favicon);
            container.appendChild(arrow);

            // Only add container if it doesn't already exist
            if (!link.querySelector('.external-link-icon')) {
                link.appendChild(container);
            }
        }
    }
}

function removeHighlights() {
    const links = document.querySelectorAll('a[href]:not([href=""]):not([href="/"])');
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
