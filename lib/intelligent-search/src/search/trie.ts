import type { TrieNode } from '../types.js';

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = this.createNode();
  }

  private createNode(): TrieNode {
    return {
      children: new Map(),
      isEnd: false,
      toolIds: new Set(),
      popularity: 0,
      recentUsage: 0,
    };
  }

  insert(word: string, toolId?: string): void {
    if (!word || word.length === 0) return;
    let node: TrieNode = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, this.createNode());
      }
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
    if (toolId) node.toolIds.add(toolId);
  }

  remove(word: string, toolId?: string): void {
    if (!word) return;
    this.removeRecursive(this.root, word, 0, toolId);
  }

  private removeRecursive(
    node: TrieNode,
    word: string,
    depth: number,
    toolId?: string,
  ): boolean {
    if (depth === word.length) {
      if (toolId && node.toolIds.has(toolId)) {
        node.toolIds.delete(toolId);
      }
      node.isEnd = node.toolIds.size > 0 || node.children.size > 0;
      return !node.isEnd && node.toolIds.size === 0;
    }
    const ch = word[depth];
    const child = node.children.get(ch);
    if (!child) return false;
    const shouldDelete = this.removeRecursive(child, word, depth + 1, toolId);
    if (shouldDelete) {
      node.children.delete(ch);
      const isEmpty = !node.isEnd && node.toolIds.size === 0 && node.children.size === 0;
      return isEmpty;
    }
    return false;
  }

  searchPrefix(prefix: string): TrieNode | null {
    if (!prefix) return null;
    let node: TrieNode = this.root;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }

  getAllWithPrefix(node: TrieNode, prefix: string, results: { id: string; prefix: string }[]): void {
    if (node.isEnd || node.toolIds.size > 0) {
      for (const id of node.toolIds) {
        results.push({ id, prefix });
      }
    }
    for (const [ch, child] of node.children) {
      this.getAllWithPrefix(child, prefix + ch, results);
    }
  }

  getRoot(): TrieNode {
    return this.root;
  }

  insertTool(name: string, keywords: string[], aliases: string[], toolId: string): void {
    this.insert(name, toolId);
    for (const kw of keywords) {
      this.insert(kw, toolId);
    }
    for (const alias of aliases) {
      this.insert(alias, toolId);
    }
  }

  removeTool(name: string, keywords: string[], aliases: string[], toolId: string): void {
    this.remove(name, toolId);
    for (const kw of keywords) this.remove(kw, toolId);
    for (const alias of aliases) this.remove(alias, toolId);
  }

  clear(): void {
    this.root = this.createNode();
  }

  size(): number {
    return this.countNodes(this.root);
  }

  private countNodes(node: TrieNode): number {
    let count = 1;
    for (const child of node.children.values()) {
      count += this.countNodes(child);
    }
    return count;
  }
}
