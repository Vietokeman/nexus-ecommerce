import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src');
const endpointsFile = path.join(srcDir, 'lib', 'endpoints.ts');

const endpointSource = fs.readFileSync(endpointsFile, 'utf8');
const lines = endpointSource.split(/\r?\n/);

const endpointKeys = [];
let currentGroup = null;
let groupIndent = 0;

for (const line of lines) {
  const groupMatch = line.match(/^(\s{2})([A-Z_]+):\s*\{\s*$/);
  if (groupMatch) {
    currentGroup = groupMatch[2];
    groupIndent = groupMatch[1].length;
    continue;
  }

  if (currentGroup) {
    const trimmed = line.trim();
    const closeGroup = trimmed === '},' || trimmed === '}';
    const indent = line.length - line.trimStart().length;
    if (closeGroup && indent === groupIndent) {
      currentGroup = null;
      continue;
    }

    const keyMatch = line.match(/^\s{4}([A-Z_]+):\s*/);
    if (keyMatch) {
      endpointKeys.push(`${currentGroup}.${keyMatch[1]}`);
    }
  }
}

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
};

const sourceFiles = walk(srcDir).filter((file) => !file.endsWith(path.join('lib', 'endpoints.ts')));

const usageRegex = /API_ENDPOINTS\.([A-Z_]+)\.([A-Z_]+)/g;
const usageMap = new Map();

for (const filePath of sourceFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = usageRegex.exec(content)) !== null) {
    const key = `${match[1]}.${match[2]}`;
    usageMap.set(key, (usageMap.get(key) || 0) + 1);
  }
}

const reportRows = endpointKeys.map((key) => {
  const count = usageMap.get(key) || 0;
  return {
    key,
    count,
    used: count > 0,
  };
});

const usedCount = reportRows.filter((row) => row.used).length;
const unusedRows = reportRows.filter((row) => !row.used);
const unusedCount = unusedRows.length;
const totalCount = reportRows.length;
const coverage = totalCount === 0 ? 100 : ((usedCount / totalCount) * 100).toFixed(2);

console.log('React API endpoint key coverage audit');
console.log(`Total keys: ${totalCount}`);
console.log(`Used keys: ${usedCount}`);
console.log(`Unused keys: ${unusedCount}`);
console.log(`Coverage: ${coverage}%`);

if (unusedCount > 0) {
  console.log('\nUnused endpoint keys:');
  for (const row of unusedRows) {
    console.log(`- ${row.key}`);
  }
}

process.exitCode = unusedCount > 0 ? 1 : 0;
