import fs from 'node:fs/promises';
import path from 'node:path';

// Define the root directory of your project (where package.json lives)
const rootDir = process.cwd();

// Define file extensions to include (customize as needed)
const includeExtensions = [
  '.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.html', '.md'
];

// Define directories/files to exclude
const excludeDirs = [
  'node_modules',
  'dist',
  '.git',
  'build',
  'public'
];
const excludeFiles = [
  'pnpm-lock.yaml', // Common pnpm lockfile
  '.gitignore',
  'README.md',
  'bundle-files.js'
];

// Output file where everything will be written
const outputFile = path.join(rootDir, 'bundled-project.txt');

// Function to check if a file should be included
function shouldIncludeFile(filePath) {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath);
  return (
    includeExtensions.includes(ext) &&
    !excludeFiles.includes(baseName)
  );
}

// Function to check if a directory should be traversed
function shouldIncludeDir(dirPath) {
  const baseName = path.basename(dirPath);
  return !excludeDirs.includes(baseName);
}

// Recursive function to read files and collect content
async function collectFiles(dir) {
  let results = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (shouldIncludeDir(fullPath)) {
          const subFiles = await collectFiles(fullPath);
          results = results.concat(subFiles);
        }
      } else if (entry.isFile() && shouldIncludeFile(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        results.push({
          filePath: path.relative(rootDir, fullPath),
          content
        });
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }

  return results;
}

// Main function to bundle files
async function bundleProject() {
  try {
    console.log('Collecting files...');
    const files = await collectFiles(rootDir);

    if (files.length === 0) {
      console.log('No files found to bundle.');
      return;
    }

    console.log(`Found ${files.length} files. Bundling into ${outputFile}...`);

    let bundledContent = "Debian 12, NodeJS 22.13.1\n"

    // Prepare the bundled content
    bundledContent += files
      .map(file => `### ${file.filePath} ###\n${file.content.trimEnd()}\n`)
      .join('\n');

    // Write to the output file
    await fs.writeFile(outputFile, bundledContent, 'utf8');
    console.log(`Successfully bundled project into ${outputFile}`);
  } catch (err) {
    console.error('Error bundling project:', err);
  }
}

// Run the script
bundleProject();