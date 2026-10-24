import {createHash} from 'node:crypto';

// Keep first paint compatible with style-src 'self'. React applies later
// interactive styles through CSSOM; server-rendered declarations use classes.
export function extractServerStyles(html, rules = new Map()) {
  const output = html.replace(/<[a-z][^>]*\sstyle="([^"]*)"[^>]*>/gi, (tag, declaration) => {
    const style = declaration.replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&amp;', '&');
    const name = 'ssr-style-' + createHash('sha256').update(style).digest('hex').slice(0, 16);
    rules.set(name, style);
    let replacement = tag.replace(/\sstyle="[^"]*"/, '');
    if (/\sclass="/.test(replacement)) return replacement.replace(/\sclass="([^"]*)"/, (_, value) => ` class="${value} ${name}"`);
    return replacement.replace(/^<([a-z][\w-]*)/i, `<$1 class="${name}"`);
  });
  return {html: output, rules};
}

export function serverStyleSheet(rules) {
  // The root selector keeps these declarations above ordinary component rules,
  // matching the original inline styles without defeating existing !important.
  return [...rules].map(([name, declaration]) => `#root .${name}{${declaration}}`).join('\n');
}
