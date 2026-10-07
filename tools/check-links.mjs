import fs from 'node:fs';
const sources = JSON.parse(fs.readFileSync(new URL('../data/sources.json', import.meta.url), 'utf8'));
const urls = [...new Set(Object.values(sources).map(x => x.url))];
let bad = 0;
async function check(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    let r = await fetch(url, {method:'HEAD', redirect:'follow', signal:controller.signal, headers:{'user-agent':'HowToLiveBetterTH-link-check/1.0'}});
    if (r.status === 405 || r.status === 403) r = await fetch(url, {method:'GET', redirect:'follow', signal:controller.signal, headers:{'user-agent':'HowToLiveBetterTH-link-check/1.0'}});
    const ok = r.status < 400 || [401,403,429].includes(r.status);
    console.log(`${ok ? 'OK ' : 'BAD'} ${r.status} ${url}`);
    if (!ok) bad++;
  } catch (e) {
    console.log(`WARN --- ${url} :: ${e.name || e.message}`);
  } finally { clearTimeout(t); }
}
for (let i=0;i<urls.length;i+=6) await Promise.all(urls.slice(i,i+6).map(check));
console.log(`Checked ${urls.length} unique sources; definite bad=${bad}`);
process.exitCode = bad ? 1 : 0;
