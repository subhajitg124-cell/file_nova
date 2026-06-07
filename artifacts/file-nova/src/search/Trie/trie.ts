export interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  toolIds: string[];
  categoryId: string | null;
}

export class Trie {
  private root: TrieNode = {
    children: new Map(),
    isEnd: false,
    toolIds: [],
    categoryId: null,
  };

  private static readonly DELIMITERS = /[\s\-_]+/g;

  private normalizeTerm(term: string): string[] {
    const normalized = term.toLowerCase().replace(Trie.DELIMITERS, ' ').trim();
    return normalized.split(' ').filter(Boolean);
  }

  insert(term: string, toolId: string, categoryId: string): void {
    const words = this.normalizeTerm(term);
    let node = this.root;

    for (const word of words) {
      for (const char of word) {
        if (!node.children.has(char)) {
          node.children.set(char, {
            children: new Map(),
            isEnd: false,
            toolIds: [],
            categoryId: null,
          });
        }
        node = node.children.get(char)!;
      }
      node.toolIds.push(toolId);
      node.categoryId = categoryId;
    }
    node.isEnd = true;
  }

  remove(term: string, toolId: string): void {
    const words = this.normalizeTerm(term);
    this.removeRecursive(this.root, words, 0, toolId);
  }

  private removeRecursive(node: TrieNode, words: string[], depth: number, toolId: string): boolean {
    if (depth >= words.length) {
      const idx = node.toolIds.indexOf(toolId);
      if (idx > -1) node.toolIds.splice(idx, 1);
      return node.children.size === 0 && node.toolIds.length === 0;
    }

    const word = words[depth];
    for (const char of word) {
      const child = node.children.get(char);
      if (!child) return false;

      if (this.removeRecursive(child, words, depth + 1, toolId)) {
        node.children.delete(char);
        return node.children.size === 0 && node.toolIds.length === 0;
      }
    }
    return false;
  }

  searchPrefix(prefix: string): string[] {
    const words = this.normalizeTerm(prefix);
    if (words.length === 0) return [];

    let node = this.root;

    for (const word of words) {
      for (const char of word) {
        node = node.children.get(char);
        if (!node) return [];
      }
    }

    return this.collectAllToolIds(node);
  }

  private collectAllToolIds(node: TrieNode): string[] {
    const ids: string[] = [...node.toolIds];
    for (const child of node.children.values()) {
      ids.push(...this.collectAllToolIds(child));
    }
    return ids;
  }

  getSuggestions(prefix: string, limit: number = 10): string[] {
    const toolIds = this.searchPrefix(prefix);
    return Array.from(new Set(toolIds)).slice(0, limit);
  }
}

let _trieInstance: Trie | null = null;
let _toolIdMap: Map<string, string> | null = null;

export function getTrie(toolIdMap: Map<string, string>): Trie {
  if (!_trieInstance || !_toolIdMap) {
    _trieInstance = new Trie();
    _toolIdMap = toolIdMap;
  }
  return _trieInstance;
}

let _indexBuilt = false;

export function buildSearchIndex(tools: Array<{ id: string; title: string; description: string; category: string }>, toolIdMap: Map<string, string>): Trie {
  const trie = getTrie(toolIdMap);

  if (_indexBuilt) return trie;

  for (const tool of tools) {
    trie.insert(tool.title, tool.id, tool.category);
    trie.insert(tool.description, tool.id, tool.category);
    if (tool.title.toLowerCase().includes('pdf')) {
      trie.insert(`pdf ${tool.title.toLowerCase().replace('pdf', '').trim()}`, tool.id, tool.category);
    }
  }

  _indexBuilt = true;
  return trie;
}