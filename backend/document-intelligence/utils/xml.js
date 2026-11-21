import { DOMParser } from '@xmldom/xmldom';

export const NS = {
  a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  p: 'http://schemas.openxmlformats.org/presentationml/2006/main',
  w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
};

export function parseXml(xml, label = 'Office XML') {
  const errors = [];
  const doc = new DOMParser({
    errorHandler: {
      warning: (m) => errors.push(m),
      error: (m) => errors.push(m),
      fatalError: (m) => errors.push(m),
    },
  }).parseFromString(xml, 'application/xml');
  if (!doc?.documentElement || errors.some((x) => /fatal|error/i.test(x))) {
    throw new Error(`${label} could not be parsed: ${errors.join('; ')}`);
  }
  return doc;
}

export function descendants(node, namespace, localName) {
  return Array.from(node?.getElementsByTagNameNS(namespace, localName) || []);
}

export function directChildren(node, namespace, localName) {
  return Array.from(node?.childNodes || []).filter(
    (child) => child.nodeType === 1 && child.namespaceURI === namespace && child.localName === localName,
  );
}

export function firstDirect(node, namespace, localName) {
  return directChildren(node, namespace, localName)[0] || null;
}

export function textContent(node) {
  return String(node?.textContent || '').replace(/\u0000/g, '').replace(/\s+/g, ' ').trim();
}
