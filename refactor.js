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

const srcDir = 'c:/prex/propify-crm/apps/web/src';
const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Remove font-bold / font-semibold from <input>, <select>, <textarea>
  content = content.replace(/(<(?:input|select|textarea)[^>]+className="[^"]*?)\bfont-semibold\b([^"]*?")/g, '$1$2');
  content = content.replace(/(<(?:input|select|textarea)[^>]+className="[^"]*?)\bfont-bold\b([^"]*?")/g, '$1$2');
  
  // Clean up extra spaces in className
  content = content.replace(/(<(?:input|select|textarea)[^>]+className="[^"]*?)  +([^"]*?")/g, '$1 $2');
  
  // For <label>, remove uppercase and font-bold
  content = content.replace(/(<label[^>]+className="[^"]*?)\buppercase\b([^"]*?")/g, '$1$2');
  content = content.replace(/(<label[^>]+className="[^"]*?)\bfont-bold\b([^"]*?")/g, '$1font-medium$2');
  content = content.replace(/(<label[^>]+className="[^"]*?)  +([^"]*?")/g, '$1 $2');

  // Sentence case for label inner text
  content = content.replace(/<label([^>]*)>([^<]+)<\/label>/g, (match, p1, p2) => {
    const trimmed = p2.trim();
    if (!trimmed || trimmed.includes('{') || trimmed.includes('}')) return match; // skip if empty or contains code
    
    // Convert to lowercase, then capitalize first letter, but preserve '*' if present
    let sentenceCase = trimmed.toLowerCase();
    
    // Find the first letter to capitalize
    const firstLetterMatch = sentenceCase.match(/[a-zñáéíóú]/i);
    if (firstLetterMatch) {
      const idx = sentenceCase.indexOf(firstLetterMatch[0]);
      sentenceCase = sentenceCase.substring(0, idx) + sentenceCase[idx].toUpperCase() + sentenceCase.substring(idx + 1);
    }
    
    return `<label${p1}>${p2.replace(trimmed, sentenceCase)}</label>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Processed all files.');
