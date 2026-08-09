const fs = require('fs');
const path = require('path');

const directory = 'c:/prex/propify-crm/apps/web/src';

const replacements = [
  {
    regex: /text-sm sm:text-xl font-bold text-slate-900/g,
    replacement: 'text-xl font-semibold text-slate-900 tracking-tight'
  },
  {
    regex: /text-2xl font-bold text-slate-900/g,
    replacement: 'text-xl font-semibold text-slate-900 tracking-tight'
  },
  {
    regex: /text-\[10px\] sm:text-xs text-slate-500 hidden sm:block mt-0\.5/g,
    replacement: 'text-xs text-slate-500 mt-0.5'
  },
  {
    regex: /text-slate-500 text-sm mt-1/g,
    replacement: 'text-xs text-slate-500 mt-0.5'
  },
  {
    regex: /className="p-6 space-y-4"/g,
    replacement: 'className="p-4 space-y-3.5"'
  },
  {
    regex: /className="p-6 space-y-6"/g,
    replacement: 'className="p-4 space-y-4"'
  },
  {
    regex: /className="p-6"/g,
    replacement: 'className="p-4"'
  },
  {
    regex: /block text-xs font-medium text-slate-700/g,
    replacement: 'block text-[10px] font-medium text-brand-green'
  },
  {
    regex: /block text-sm font-medium text-slate-700/g,
    replacement: 'block text-[10px] font-medium text-brand-green'
  },
  {
    regex: /block text-sm font-medium text-slate-800/g,
    replacement: 'block text-[10px] font-medium text-brand-green'
  },
  {
    regex: /px-3 py-2/g,
    replacement: 'px-3 py-1.5'
  },
  {
    regex: /px-4 py-2/g,
    replacement: 'px-3 py-1.5'
  },
  {
    regex: /space-y-4/g,
    replacement: 'space-y-3.5'
  }
];

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      if (fullPath.includes('Dashboard.tsx')) continue; // Skip dashboard
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const r of replacements) {
        if (content.match(r.regex)) {
          content = content.replace(r.regex, r.replacement);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(directory);
console.log('Done!');
