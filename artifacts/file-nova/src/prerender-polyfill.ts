// src/prerender-polyfill.ts
console.log("=== PRERENDER POLYFILL RUNNING ===");

// Polyfill DOMMatrix for Node.js pre-rendering/SSR environments (required by pdfjs-dist)
if (typeof globalThis.DOMMatrix === 'undefined') {
  console.log("Polyfilling DOMMatrix...");
  globalThis.DOMMatrix = class DOMMatrix {
    a: number = 1;
    b: number = 0;
    c: number = 0;
    d: number = 1;
    e: number = 0;
    f: number = 0;

    static fromMatrix() { return new DOMMatrix(); }
    static fromFloat32Array() { return new DOMMatrix(); }
    static fromFloat64Array() { return new DOMMatrix(); }
    translate() { return this; }
    scale() { return this; }
    multiply() { return this; }
    inverse() { return this; }
    transformPoint(p: any) { return p; }
  } as any;
}

// Polyfill localStorage for Node.js pre-rendering/SSR environments
if (typeof globalThis.localStorage === 'undefined') {
  console.log("Polyfilling localStorage...");
  const mockStorage: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = String(value); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { for (const k of Object.keys(mockStorage)) delete mockStorage[k]; },
    key: (index: number) => Object.keys(mockStorage)[index] ?? null,
    get length() { return Object.keys(mockStorage).length; }
  } as any;
}
