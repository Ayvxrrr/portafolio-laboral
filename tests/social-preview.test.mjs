import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const meta = key => head.match(new RegExp(`<meta (?:property|name)="${key}"\\s+content="([^\"]+)"`))?.[1];
const site = 'https://ayvar.pages.dev/';

test('la identidad del sitio y el sitemap utilizan el dominio de Cloudflare', async () => {
  assert.ok(head.includes(`<link rel="canonical" href="${site}">`));
  assert.equal(meta('og:url'), site);
  assert.equal(head.includes('ayvar.netlify.app'), false);
  const person = JSON.parse(head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(person.url, site);
  assert.equal(new URL(person.image).origin, new URL(site).origin);
  const robots = await readFile(new URL('../robots.txt', import.meta.url), 'utf8');
  assert.match(robots, /User-agent: \*\s+Allow: \//);
  assert.ok(robots.includes(`Sitemap: ${site}sitemap.xml`));
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  assert.ok(sitemap.includes(`<loc>${site}</loc>`));
});

test('la vista previa está declarada en el HTML inicial sin ejecutar JavaScript', () => {
  assert.equal(meta('og:type'), 'website');
  assert.equal(meta('og:site_name'), 'Ayvar Jose');
  assert.match(meta('og:title'), /Ayvar Jose/);
  assert.ok(meta('og:description').length > 40);
  assert.equal(meta('twitter:card'), 'summary_large_image');
  assert.equal(meta('twitter:title'), meta('og:title'));
  assert.equal(meta('twitter:description'), meta('og:description'));
  assert.match(meta('og:image:alt'), /Ayvar Jose/);
  assert.equal(meta('twitter:image:alt'), meta('og:image:alt'));
});

test('la tarjeta social usa una imagen JPEG pública, ligera y de 1200 × 630', async () => {
  const imageURL = new URL(meta('og:image'));
  assert.equal(imageURL.href, `${site}img/og-image-neon-portrait.jpg`);
  assert.equal(meta('og:image:secure_url'), imageURL.href);
  assert.equal(meta('twitter:image'), imageURL.href);
  assert.equal(meta('og:image:type'), 'image/jpeg');
  assert.equal(meta('og:image:width'), '1200');
  assert.equal(meta('og:image:height'), '630');
  const image = await readFile(new URL(`..${imageURL.pathname}`, import.meta.url));
  assert.equal(image.readUInt16BE(0), 0xffd8);
  assert.ok(image.length < 300 * 1024, 'La tarjeta no debe ser demasiado pesada');
  let dimensions;
  for (let offset = 2; offset < image.length;) {
    assert.equal(image[offset], 0xff);
    const marker = image[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      dimensions = { width: image.readUInt16BE(offset + 7), height: image.readUInt16BE(offset + 5) };
      assert.equal(image[offset + 9], 3, 'El JPEG debe conservar el color del retrato');
      break;
    }
    offset += image.readUInt16BE(offset + 2) + 2;
  }
  assert.deepEqual(dimensions, { width: 1200, height: 630 });
});

test('la tarjeta conserva el tema blanco y negro con una foto a color, sin cambiar la web', async () => {
  assert.ok(html.includes('data-accent="mono"'));
  const preferences = await readFile(new URL('../js/preferences.js', import.meta.url), 'utf8');
  assert.ok(preferences.includes("root.dataset.accent = 'mono'"));
  assert.ok(meta('og:image').endsWith('/og-image-neon-portrait.jpg'));
});

test('se restaura el texto de portada sin volver a utilizar Netlify Forms', async () => {
  assert.ok(html.includes('<p class="presentation-description">Sitios web y sistemas a medida para negocios y emprendimientos.</p>'));
  assert.ok(html.includes('action="https://formspree.io/f/meoykyar"'));
  assert.equal(html.includes('data-netlify='), false);
  const translations = await readFile(new URL('../js/i18n.js', import.meta.url), 'utf8');
  assert.ok(translations.includes('Websites and custom systems for businesses and entrepreneurs.'));
  const css = await readFile(new URL('../css/replica.css', import.meta.url), 'utf8');
  assert.ok(css.includes('.presentation-description {'));
});
