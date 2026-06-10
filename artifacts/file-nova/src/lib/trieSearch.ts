import { TOOL_REGISTRY, ToolRegistryItem } from "./toolPlugin";

class TrieNode {
  children: Record<string, TrieNode> = {};
  isWord: boolean = false;
  toolIds: string[] = []; // Store IDs of tools associated with this node
}

export class ToolTrieSearch {
  root: TrieNode = new TrieNode();

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Index all tools from registry
    Object.values(TOOL_REGISTRY).forEach(tool => {
      // 1. Index tool name words
      const nameParts = tool.name.toLowerCase().split(/\s+/);
      nameParts.forEach(word => this.insert(word, tool.id));

      // 2. Index entire tool name
      this.insert(tool.name.toLowerCase(), tool.id);

      // 3. Index category
      this.insert(tool.category.toLowerCase(), tool.id);

      // 4. Index common search typos and synonyms
      const synonyms: Record<string, string[]> = {
        "merge-pdf": ["combine", "join", "marge", "union", "pdf mer", "pdf merge"],
        "split-pdf": ["divide", "extract", "cut", "splet", "pdf split"],
        "compress-pdf": ["reduce", "shrink", "optimize", "size", "under 100kb", "under 200kb", "small", "copress"],
        "pan-card-resize": ["utiitsl", "nsdl", "pan card", "pan card crop", "resize pan"],
        "aadhaar-mask-pdf": ["uidai", "mask aadhaar", "aadhaar card", "blur aadhaar", "redact", "secure aadhaar"],
        "ocr": ["scan", "extract text", "image to text", "hindi ocr", "bengali ocr"],
        "remove-background": ["bg remove", "transparent", "background eraser"],
        "ai-pdf-summary": ["summarize", "bullet points", "pdf sumry"],
      };

      if (synonyms[tool.id]) {
        synonyms[tool.id].forEach(syn => {
          this.insert(syn.toLowerCase(), tool.id);
          // Insert individual words of synonyms as well
          syn.toLowerCase().split(/\s+/).forEach(word => this.insert(word, tool.id));
        });
      }
    });
  }

  insert(keyword: string, toolId: string) {
    let current = this.root;
    for (let char of keyword) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
      // Store reference at prefix level as well for quick prefix lookup
      if (!current.toolIds.includes(toolId)) {
        current.toolIds.push(toolId);
      }
    }
    current.isWord = true;
  }

  search(query: string): ToolRegistryItem[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    let current = this.root;
    for (let char of cleanQuery) {
      if (!current.children[char]) {
        // If exact path is not found, fallback to basic fuzzy search across registry
        return this.fallbackFuzzySearch(cleanQuery);
      }
      current = current.children[char];
    }

    // Return the unique tools corresponding to toolIds in this node
    const ids = current.toolIds;
    return ids.map(id => TOOL_REGISTRY[id]).filter(Boolean);
  }

  private fallbackFuzzySearch(query: string): ToolRegistryItem[] {
    // Simple levenshtein distance or matching filter
    return Object.values(TOOL_REGISTRY).filter(tool => {
      const name = tool.name.toLowerCase();
      const desc = tool.description.toLowerCase();
      return (
        name.includes(query) ||
        desc.includes(query) ||
        query.includes(name) ||
        this.getLevenshteinDistance(query, name) <= 3
      );
    });
  }

  private getLevenshteinDistance(a: string, b: string): number {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

export const trieSearch = new ToolTrieSearch();
export default trieSearch;
