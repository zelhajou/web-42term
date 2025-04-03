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
  
  // Launch browser with appropriate flags for serverless environments
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport size to ensure proper rendering
    await page.setViewport({
      width: width,
      height: height,
      deviceScaleFactor: 2, // Increase for higher quality
    });
    
    // Create HTML with embedded SVG
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: transparent;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
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
    
    // Set content and wait for SVG to render
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      omitBackground: true,
      clip: {
        x: 0,
        y: 0,
        width: width,
        height: height
      }
    });
    
    return screenshot;
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
    throw error;
  } finally {
    // Always close browser to avoid memory leaks
    await browser.close();
  }
}

export default convertSvgToPng;