const fs = require('fs');
const path = require('path');

// Configure which directories and files to ignore
const ignoreDirs = [
  'node_modules',
  '.next',
  '.git',
  'out',
  'build',
  'dist'
];

// Configure which file extensions to ignore
const ignoreExtensions = [
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ttf',
  '.woff',
  '.woff2',
  '.eot',
  '.lock'
];

// Configure specific files to ignore
const ignoreFiles = [
  'package-lock.json',
  'project_code.json',
  'export-code.js',
  'project_files_structure.md',
  'README.md',
  'package-lock.json',
  'orekabe_data.json',
  'zelhajou_data.json',
  'fetch-student-data.js',

];

// Result object
const result = {
  files: []
};

/**
 * Check if a path should be ignored
 */
function shouldIgnore(filePath) {
  const basename = path.basename(filePath);

  // Check if file is in ignore list
  if (ignoreFiles.includes(basename)) {
    return true;
  }

  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  if (ignoreExtensions.includes(ext)) {
    return true;
  }

  // Check if path contains ignored directory
  return ignoreDirs.some(dir => filePath.includes(`/${dir}/`));
}

/**
 * Recursively read directory
 */
function readDir(dirPath, basePath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      // Skip ignored directories
      if (ignoreDirs.includes(entry.name)) {
        continue;
      }
      readDir(fullPath, basePath);
    } else if (entry.isFile()) {
      // Skip ignored files
      if (shouldIgnore(fullPath)) {
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        result.files.push({
          path: relativePath,
          content
        });
      } catch (error) {
        console.error(`Error reading file ${fullPath}:`, error.message);
      }
    }
  }
}

// Start recursively reading the current directory
const baseDir = process.cwd();
readDir(baseDir, baseDir);

// Write the result to a JSON file
fs.writeFileSync('project_code.json', JSON.stringify(result, null, 2));

console.log(`Done! Exported ${result.files.length} files to project_code.json`);