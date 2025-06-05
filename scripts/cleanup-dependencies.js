const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

// List of dependencies to remove (based on depcheck results)
const dependenciesToRemove = [
  '@genkit-ai/next',
  '@opentelemetry/exporter-jaeger',
  '@tanstack/react-query',
];

const devDependenciesToRemove = [
  '@testing-library/user-event',
  '@types/jest',
  'autoprefixer',
  'eslint',
  'eslint-config-next',
  'postcss',
  'typescript',
];

// Remove unused dependencies
dependenciesToRemove.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
  }
});

// Remove unused devDependencies
devDependenciesToRemove.forEach(dep => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    delete packageJson.devDependencies[dep];
  }
});

// Write updated package.json
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2) + '\n'
);

console.log('Removed unused dependencies from package.json.');

// Reinstall dependencies
console.log('Reinstalling dependencies...');
execSync('npm install', { stdio: 'inherit' });

console.log('Dependencies cleanup complete!'); 