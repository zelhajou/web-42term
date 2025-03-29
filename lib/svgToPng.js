// lib/svgToPng.js

import puppeteer from 'puppeteer';

/**
 * Convert an SVG string to PNG using Puppeteer
 * @param {string} svgString - The SVG content to convert
 * @param {object} options - Conversion options
 * @returns {Promise<Buffer>} - PNG image buffer
 */
export async function convertSvgToPng(svgString, options = {}) {
  const { width = 800, height = 600 } = options;
  
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport to match SVG dimensions
    await page.setViewport({ width, height });
    
    // Create HTML with embedded SVG
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background: transparent;
            }
            svg {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          ${svgString}
        </body>
      </html>
    `;
    
    // Set content to our HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Take a screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      omitBackground: true,
      clip: {
        x: 0,
        y: 0,
        width,
        height
      }
    });
    
    // Close the browser
    await browser.close();
    
    return screenshot;
  } catch (error) {
    // Make sure we close the browser on error
    if (browser) {
      await browser.close();
    }
    console.error('Error converting SVG to PNG:', error);
    throw error;
  }
}

export default convertSvgToPng;