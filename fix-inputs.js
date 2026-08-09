const fs = require('fs');
const path = require('path');
const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
};
const files = walk('c:/prex/propify-crm/apps/web/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // A simpler approach: replace font-semibold and font-bold in all input/select/textarea
  // Note: we might have self-closing inputs <input ... /> or with closing tags <select ... >
  content = content.replace(/<(input|select|textarea)([\s\S]*?)>/g, (match, p1, p2) => {
    return `<${p1}${p2.replace(/\bfont-bold\b/g, '').replace(/\bfont-semibold\b/g, '').replace(/\s{2,}/g, ' ')}>`;
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('done fixing bold inputs');
