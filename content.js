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

/**
 * Extract title and link from Confluence page and copy to clipboard
 * Looks for the same format as in public.html:
 * - Title heading with id="title-text" 
 * - Anchor tag with href pointing to the Confluence page
 */
function handleConfluenceExtract() {
    console.debug('Handling confluence extract');
    
    try {
        // Look for the title element - try multiple selectors for robustness
        const titleElement = document.querySelector('#title-text a') || 
                           document.querySelector('.pagetitle a') ||
                           document.querySelector('h1 a[href*="viewpage.action"]') ||
                           document.querySelector('a[href*="viewpage.action"]');
        
        if (!titleElement) {
            console.warn('Could not find confluence page title element');
            showNotification('Could not find Confluence page title', 'error');
            return;
        }
        
        const title = titleElement.textContent.trim();
        const link = titleElement.href;
        
        if (!title || !link) {
            console.warn('Could not extract title or link', {title, link});
            showNotification('Could not extract page information', 'error');
            return;
        }
        
        // Escape HTML entities for safety
        const escapedTitle = escapeHtml(title);
        const escapedLink = escapeHtml(link);
        
        // Format the data as HTML link
        const htmlData = `<a href="${escapedLink}">${escapedTitle}</a>`;
        
        // Copy to clipboard as HTML
        copyHtmlToClipboard(htmlData, `${title}\n${link}`).then(() => {
            console.debug('Successfully copied HTML to clipboard:', {title, link, htmlData});
            showNotification(`Copied: ${title}`, 'success');
        }).catch((error) => {
            console.error('Failed to copy to clipboard:', error);
            showNotification('Failed to copy to clipboard', 'error');
        });
        
    } catch (error) {
        console.error('Error in handleConfluenceExtract:', error);
        showNotification('Error extracting page information', 'error');
    }
}

/**
 * Escape HTML special characters to prevent XSS and HTML injection
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Copy HTML content to clipboard using modern Clipboard API
 * Falls back to plain text if HTML is not supported
 */
async function copyHtmlToClipboard(htmlContent, plainTextFallback) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            // Try to write both HTML and plain text formats
            const clipboardItem = new ClipboardItem({
                'text/html': new Blob([htmlContent], { type: 'text/html' }),
                'text/plain': new Blob([plainTextFallback], { type: 'text/plain' })
            });
            
            return navigator.clipboard.write([clipboardItem]);
        } catch (error) {
            console.warn('HTML clipboard write failed, falling back to plain text:', error);
            // Fallback to plain text if HTML write fails
            return navigator.clipboard.writeText(plainTextFallback);
        }
    } else {
        // Fallback for older browsers or non-secure contexts
        return copyToClipboardLegacy(plainTextFallback);
    }
}

/**
 * Legacy clipboard copy for older browsers
 */
function copyToClipboardLegacy(text) {
    return new Promise((resolve, reject) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                resolve();
            } else {
                reject(new Error('Copy command failed'));
            }
        } catch (err) {
            document.body.removeChild(textArea);
            reject(err);
        }
    });
}

/**
 * Show a temporary notification to the user
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'HIGHLIGHT_LINKS') {
        toggleHighlightLinks();
        sendResponse({ success: true });
    } else if (request.action === 'CONFLUENCE_EXTRACT') {
        handleConfluenceExtract();
        sendResponse({ success: true });
    }
});
