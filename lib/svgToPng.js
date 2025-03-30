// lib/svgToPng.js - Updated version

import puppeteer from 'puppeteer';

/**
 * Convert an SVG string to PNG using Puppeteer with improved padding handling
 * @param {string} svgString - The SVG content to convert
 * @param {object} options - Conversion options
 * @returns {Promise<Buffer>} - PNG image buffer
 */
export async function convertSvgToPng(svgString, options = {}) {
  const { width = 800, height = 600, trim = true } = options;
  
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Create HTML with embedded SVG and a wrapper to ensure proper sizing
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: transparent;
            }
            .svg-wrapper {
              display: inline-block; /* Important for proper sizing */
              line-height: 0; /* Remove any line-height that might add space */
            }
            svg {
              display: block; /* Prevents inline element spacing issues */
              width: auto;
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="svg-wrapper">${svgString}</div>
        </body>
      </html>
    `;
    
    // Set content to our HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Get the actual dimensions of the SVG content
    const dimensions = await page.evaluate(() => {
      const svgElement = document.querySelector('svg');
      const wrapper = document.querySelector('.svg-wrapper');
      return {
        width: wrapper.offsetWidth,
        height: wrapper.offsetHeight
      };
    });
    
    // Use content dimensions or the provided dimensions, whichever is smaller
    const screenshotWidth = Math.min(width, dimensions.width);
    const screenshotHeight = Math.min(height, dimensions.height);
    
    // Take a screenshot with the proper dimensions
    const screenshot = await page.screenshot({
      type: 'png',
      omitBackground: true,
      clip: {
        x: 0,
        y: 0,
        width: screenshotWidth,
        height: screenshotHeight
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