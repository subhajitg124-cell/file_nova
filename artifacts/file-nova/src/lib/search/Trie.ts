export interface ToolMetadata {
  id: string;
  name: string;
  canonical: string;
  description: string;
  category: string;
  iconName: string;
  popularity: number;
  keywords: string[];
  aliases: string[];
}

export class TrieNode {
  children: Record<string, TrieNode> = {};
  isEnd: boolean = false;
  popularity: number = 0;
  tools: ToolMetadata[] = [];
}

export class Trie {
  root: TrieNode = new TrieNode();

  insert(word: string, tool: ToolMetadata) {
    let current = this.root;
    const normalized = word.toLowerCase().trim();
    for (const char of normalized) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
      current.popularity = Math.max(current.popularity, tool.popularity);
    }
    current.isEnd = true;
    if (!current.tools.some(t => t.id === tool.id)) {
      current.tools.push(tool);
    }
  }

  searchPrefix(prefix: string): ToolMetadata[] {
    const normalized = prefix.toLowerCase().trim();
    let current = this.root;
    for (const char of normalized) {
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }

    const results: ToolMetadata[] = [];
    const visitedTools = new Set<string>();

    const collect = (node: TrieNode) => {
      if (node.isEnd) {
        for (const tool of node.tools) {
          if (!visitedTools.has(tool.id)) {
            visitedTools.add(tool.id);
            results.push(tool);
          }
        }
      }
      for (const child of Object.values(node.children)) {
        collect(child);
      }
    };

    collect(current);
    return results;
  }
}
