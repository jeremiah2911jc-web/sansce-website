export function safeAssistantHref(value) {
  try {
    const url = new URL(value, 'https://www.sanzepm.com.tw');
    return url.protocol === 'https:' && (['www.sanzepm.com.tw', 'sanzepm.com.tw', 'lin.ee'].includes(url.hostname) || url.hostname.endsWith('.gov.tw') || url.hostname.endsWith('.gov.taipei')) ? url.href : null;
  } catch { return null; }
}
