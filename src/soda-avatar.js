// src/soda-avatar.js – ES Module (exported API)
function getHashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function generateAvatarData(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length === 1 ? parts[0][0] : (parts[0][0] + parts[1][0]);
  const hashCode = getHashCode(name);
  const hue = Math.abs(hashCode) % 360;
  const backgroundColor = `hsl(${hue}, 45%, 65%)`;
  const accentColor = `hsl(${hue}, 30%, 30%)`;
  return { initials: initials.toUpperCase(), backgroundColor, accentColor, hashCode };
}

function generatePatternSVGContent(name, baseHslColor, size) {
  const hashCode = getHashCode(name);
  const match = baseHslColor.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (!match) return "";
  const [, baseHue, baseSat, baseLight] = match.map(Number);

  const grid = 4;
  const cell = size / grid;
  let svg = "";
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const lightVar = ((hashCode % 10) + r * 5 + c * 5) % 40;
      const light = Math.max(30, Math.min(90, baseLight + lightVar - 20));
      const hue = (baseHue + ((hashCode % 7) * (r + c)) % 20) % 360;
      svg += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="hsl(${hue}, ${baseSat}%, ${light}%)"/>`;
    }
  }
  return svg;
}

function generateIconSVGContent(color, size) {
  const pad = size * 0.15;
  const icon = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${icon}" height="${icon}" x="${pad}" y="${pad}"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.623 18.623 0 0 1 12 22.5a18.623 18.623 0 0 1-7.812-1.7.75.75 0 0 1-.438-.695Z" clip-rule="evenodd"/></svg>`;
}

const emojis = [ "😀","😎","🤩","🚀","🌈","💡","🌟","🎉","🐱","🦊","🐻","🐼","🦁","🐯","🦄","🌸","🌼","☀️","🌙","🌊","⚡","🔥","💧","🍎","🍕","☕","🎮","🎵","🎨","📚","⚽","🏀","🏈","🎾","🎳","🎯","🏆","🥇","🥈","🥉","🎁","🎈","💖","💯","✅","✨","💎","👑" ];

function buildSVG(name, shape, type, size = 64) {
  const { initials, backgroundColor, accentColor, hashCode } = generateAvatarData(name);
  let defs = "", outerShape = "", inner = "";

  if (shape === "circle") outerShape = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"`;
  else if (shape === "square") outerShape = `<rect width="${size}" height="${size}"`;
  else outerShape = `<rect width="${size}" height="${size}" rx="${size * 0.125}" ry="${size * 0.125}"`;

  switch (type) {
    case "initials":
      inner = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="${size * 0.38}" font-weight="bold" fill="${accentColor}">${initials}</text>`;
      outerShape += ` fill="${backgroundColor}"/>`;
      break;
    case "pattern":
      inner = generatePatternSVGContent(name, backgroundColor, size);
      outerShape += ` fill="${backgroundColor}"/>`;
      break;
    case "emoji":
      inner = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="${size * 0.56}">${emojis[Math.abs(hashCode) % emojis.length]}</text>`;
      outerShape += ` fill="${backgroundColor}"/>`;
      break;
    case "gradient":
      const gradId = `grad${hashCode}`;
      defs = `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${backgroundColor}"/><stop offset="100%" stop-color="hsl(${(Math.abs(hashCode) * 7) % 360}, 40%, 70%)"/></linearGradient></defs>`;
      outerShape += ` fill="url(#${gradId})"/>`;
      break;
    case "icon":
      inner = generateIconSVGContent(accentColor, size);
      outerShape += ` fill="${backgroundColor}"/>`;
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}${outerShape}${inner}</svg>`;
}

function createElement(name, shape = "circle", type = "initials", size = 64) {
  const div = document.createElement("div");
  div.className = `sa-avatar sa-${shape}`;
  div.style.width = `${size}px`;
  div.style.height = `${size}px`;
  div.innerHTML = buildSVG(name, shape, type, size);
  div.title = name;
  return div;
}

function getSVGString(name, shape, type, size = 64) {
  return buildSVG(name, shape, type, size);
}

function getSVGDataURL(name, shape, type, size = 64) {
  const svg = buildSVG(name, shape, type, size);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22")}`;
}

function getHTMLString(name, shape, type, renderAs = "div", size = 64) {
  if (renderAs === "img") {
    const url = getSVGDataURL(name, shape, type, size);
    const borderRadius = shape === "circle" ? "50%" : (shape === "rounded" ? `${size * 0.125}px` : "0");
    return `<img src="${url}" alt="Avatar de ${name}" title="${name}" style="width:${size}px;height:${size}px;border-radius:${borderRadius};box-shadow:0 2px 6px rgba(0,0,0,.15);">`;
  }
  if (renderAs === "svg") {
    return getSVGString(name, shape, type, size);
  }
  return createElement(name, shape, type, size).outerHTML;
}

// ✅ Exporta un único objeto
export const SodaAvatar = {
  createElement,
  getSVGString,
  getSVGDataURL,
  getHTMLString
};
