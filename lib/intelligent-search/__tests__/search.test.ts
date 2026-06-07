import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Trie } from '../src/search/trie.js';
import { levenshteinDistance, damerauLevenshteinDistance, fuzzyScore } from '../src/search/fuzzy.js';
import { IntelligentSearchEngine } from '../src/search/engine.js';
import { SynonymMapper } from '../src/features/synonyms.js';
import { SearchAnalytics } from '../src/features/analytics.js';
import { SearchCache } from '../src/utils.js';
import { SAMPLE_TOOLS, DEFAULT_SYNONYMS } from '../src/data/sample-tools.js';
import { tokenize } from '../src/normalizer/index.js';

describe('Trie', () => {
  it('insert and prefix search', () => {
    const trie = new Trie();
    trie.insert('pdf merge', 't1');
    trie.insert('pdf compress', 't2');
    trie.insert('image resize', 't3');

    const prefixNode = trie.searchPrefix('pdf me');
    assert(prefixNode !== null, 'prefix node should exist');

    const results: { id: string; prefix: string }[] = [];
    trie.getAllWithPrefix(prefixNode, 'pdf me', results);
    const ids = results.map((r) => r.id);
    assert(ids.includes('t1'), 'pdf merge should be found via prefix');
  });

  it('keyword and alias indexing', () => {
    const trie = new Trie();
    trie.insertTool('PDF Merge', ['merge pdf', 'combine pdf'], ['join pdf'], 't1');

    assert(trie.searchPrefix('merge pdf') !== null, 'keyword merge pdf not indexed');
    assert(trie.searchPrefix('join pdf') !== null, 'alias join pdf not indexed');
  });

  it('remove tool', () => {
    const trie = new Trie();
    trie.insertTool('PDF Merge', ['merge pdf'], [], 't1');
    trie.insertTool('PDF Compress', ['compress pdf'], [], 't2');

    trie.removeTool('PDF Merge', ['merge pdf'], [], 't1');

    const nameNd = trie.searchPrefix('pdf merge');
    assert(
      nameNd === null || !nameNd.toolIds.has('t1'),
      'name should be removed',
    );

    const kwNd = trie.searchPrefix('merge pdf');
    assert(
      kwNd === null || !kwNd.toolIds.has('t1'),
      'keyword should be removed',
    );
  });
});

describe('Fuzzy', () => {
  it('levenshtein distance', () => {
    assert.strictEqual(levenshteinDistance('kitten', 'sitting'), 3);
    assert.strictEqual(levenshteinDistance('', 'abc'), 3);
    assert.strictEqual(levenshteinDistance('cat', 'cat'), 0);
  });

  it('damerau levenshtein distance', () => {
    assert.strictEqual(damerauLevenshteinDistance('cat', 'cta'), 1);
    assert.strictEqual(damerauLevenshteinDistance('', 'abc'), 3);
    assert.strictEqual(damerauLevenshteinDistance('abc', 'abc'), 0);
  });

  it('fuzzyScore', () => {
    const s1 = fuzzyScore('marge', 'merge', 2);
    assert(s1 > 0, 'marge/merge should have fuzzy score > 0');

    const s2 = fuzzyScore('compres', 'compress', 2);
    assert(s2 > 0, 'compres/compress should have fuzzy score > 0');
  });
});

describe('SynonymMapper', () => {
  it('add and retrieve', () => {
    const mapper = new SynonymMapper();
    mapper.add('merge', ['combine', 'join', 'unite']);

    assert.strictEqual(mapper.getCanonical('combine'), 'merge');
    assert.strictEqual(mapper.getCanonical('merge'), 'merge');
    assert(mapper.getSynonyms('merge').length > 0, 'merge should have synonyms');
    assert(mapper.has('combine'), 'combine should be in map');
  });
});

describe('Analytics', () => {
  it('track and query', () => {
    const analytics = new SearchAnalytics();
    analytics.trackSearch('pdf merge', 5, 42);
    analytics.trackSearch('pdf merge', 5, 42);
    analytics.trackSearch('compress pdf', 3, 50);

    const popular = analytics.getPopularQueries(10);
    assert.strictEqual(popular.length, 2, `expected 2 popular queries, got ${popular.length}`);
    assert.strictEqual(popular[0].count, 2, 'expected 2 counts for top');
  });
});

describe('SearchCache', () => {
  it('put and get', () => {
    const cache = new SearchCache<string, number>(1000);
    cache.set('key', 42);
    assert.strictEqual(cache.get('key'), 42);
    assert(cache.has('key'), 'cache should have key');
    assert.strictEqual(cache.size(), 1, 'size should be 1');
  });
});

describe('Engine - integration', () => {
  it('prefix search returns top result', () => {
    const engine = new IntelligentSearchEngine(SAMPLE_TOOLS, {
      maxResults: 5,
      debounceMs: 0,
      cacheEnabled: false,
    });
    const results = engine.search('pdf me');
    assert(results.length > 0, 'prefix search should return results');
    assert.strictEqual(results[0].tool.id, 'pdf-merge', 'pdf merge should be top result');
  });

  it('fuzzy typo correction', () => {
    const engine = new IntelligentSearchEngine(SAMPLE_TOOLS, {
      maxResults: 5,
      debounceMs: 0,
      cacheEnabled: false,
    });
    const r = engine.search('marge');
    assert(r.length > 0, 'fuzzy marge->merge should return results');
  });

  it('dynamic add and remove', () => {
    const engine = new IntelligentSearchEngine([], {
      debounceMs: 0,
      cacheEnabled: false,
    });
    const tool = {
      id: 'dyn-tool',
      name: 'Dynamic Tool',
      keywords: ['very unique keyword 12345'],
      aliases: ['dyn alias xyz'],
      popularity: 90,
      clickCount: 100,
      recentUsage: 10,
      createdAt: Date.now(),
    };
    engine.addTool(tool as any);
    const found = engine.search('unique keyword 12345');
    assert(found.length > 0, 'new tool not found after add');
    engine.removeTool('dyn-tool');
    assert.strictEqual(engine.search('unique keyword 12345').length, 0, 'removed tool should be gone');
  });

  it('synonym expansion', () => {
    const engine = new IntelligentSearchEngine(SAMPLE_TOOLS, {
      debounceMs: 0,
      cacheEnabled: false,
    });
    engine.updateSynonymBatch(DEFAULT_SYNONYMS);
    const results = engine.search('combine');
    assert(results.length > 0, 'synonym combine should find results');
  });
});

describe('Normalizer', () => {
  it('tokenize and stopwords', () => {
    const tokens = tokenize('PDF Merge Tool for documents');
    assert(tokens.includes('merge'), 'merge should be present');
    assert(!tokens.includes('for'), 'for should be filtered (stopword)');
    assert(tokens.includes('documents'), 'documents should be present');
  });
});
