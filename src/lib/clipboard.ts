/**
 * Clipboard utilities with fallback for environments where Clipboard API is not available
 * or blocked by permissions policies (like VS Code Simple Browser)
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API failed, trying fallback:', error);
      // Fall through to fallback
    }
  }

  // Fallback using execCommand (deprecated but works in more environments)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return true;
    }
  } catch (error) {
    console.warn('Fallback clipboard method failed:', error);
  }

  // If all methods fail, show a user-friendly message
  console.warn('Clipboard not available. Please copy manually:', text);
  return false;
}

export async function readFromClipboard(): Promise<string> {
  if (navigator.clipboard && navigator.clipboard.readText) {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.warn('Clipboard read failed:', error);
    }
  }
  
  console.warn('Clipboard read not available');
  return '';
}

/**
 * Show a fallback UI for copying text when clipboard API fails
 */
export function showCopyFallback(text: string, element?: HTMLElement) {
  const message = `Copy this text: ${text}`;
  
  if (element) {
    // Create a temporary tooltip or modal
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.cssText = `
      position: absolute;
      background: #333;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
      document.body.removeChild(tooltip);
    }, 3000);
  } else {
    // Fallback to alert
    alert(message);
  }
}
