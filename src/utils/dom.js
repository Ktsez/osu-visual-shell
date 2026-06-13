export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function collectByDataAttribute(attribute) {
  return Object.fromEntries(
    [...document.querySelectorAll(`[${attribute}]`)].map((item) => [item.dataset[attribute.replace(/^data-/, '').replace(/-([a-z])/g, (_, char) => char.toUpperCase())], item]),
  );
}

export function createCssVarWriter(target = document.documentElement) {
  const cache = new Map();
  return function setCssVar(name, value) {
    if (cache.get(name) === value) return;
    cache.set(name, value);
    target.style.setProperty(name, value);
  };
}

export function createTextWriter() {
  const cache = new WeakMap();
  return function setText(node, value) {
    if (!node || cache.get(node) === value) return;
    cache.set(node, value);
    node.textContent = value;
  };
}

export function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char]);
}
