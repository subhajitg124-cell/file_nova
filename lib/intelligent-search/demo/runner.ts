export function demonstrateSearch(): void {
  const engine = new IntelligentSearchEngine(SAMPLE_TOOLS, { maxResults: 6, debounceMs: 0, cacheEnabled: false });

  function separator(title: string) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(title);
    console.log('='.repeat(60));
  }

  function printResults(label: string, results: SearchResult[]) {
    console.log(`\n[${label}]`);
    console.log(`Results: ${results.length}`);
    for (const r of results) {
      console.log(
        `  ${r.tool.icon ?? '•'}  ${(r.tool.name).padEnd(22)} score=${r.score.toFixed(3)}  reason=${r.reason}`,
      );
    }
  }

  separator('1. PREFIX SEARCH');
  printResults('query: pdf mer', engine.search('pdf mer'));
  printResults('query: pdf co', engine.search('pdf co'));
  printResults('query: ima', engine.search('ima'));

  separator('2. FUZZY / TYPO CORRECTION');
  printResults('query: pdf marge', engine.search('pdf marge'));
  printResults('query: compres pdf', engine.search('compres pdf'));
  printResults('query: pd merge', engine.search('pd merge'));
  printResults('query: qr maker', engine.search('qr maker'));
  printResults('query: lorem ipusm', engine.search('lorem ipusm'));

  separator('3. SYNONYM EXPANSION');
  engine.updateSynonym('combine', ['merge', 'join', 'combine']);
  engine.updateSynonym('compress', ['reduce size', 'shrink', 'squish']);
  engine.updateSynonym('convert', ['transform', 'change format']);
  printResults('query: combine pdf', engine.search('combine pdf'));
  printResults('query: shrink pdf', engine.search('shrink pdf'));
  printResults('query: transform image', engine.search('transform image'));

  separator('4. SORT & RANKING');
  printResults('query: convert', engine.search('convert'));
  printResults('query: password', engine.search('password'));
  printResults('query: developer', engine.search('developer'));

  separator('5. ANALYTICS & HISTORY');
  const analytics = engine.getAnalytics();
  console.log(`Popular queries: ${analytics.getPopularQueries(5).map(q => q.query).join(', ')}`);
  console.log(`Avg search latency: ${analytics.getAvgLatency().toFixed(2)}ms`);
  console.log(`History items: ${analytics.getHistory().length}`);

  separator('6. DYNAMIC TOOL MANAGEMENT');
  const dynamicTool = {
    id: 'new-tool',
    name: 'Metrics Dashboard',
    description: 'Track your application performance metrics.',
    keywords: ['monitor metrics', 'performance dashboard', 'app metrics'],
    aliases: ['dashboard', 'monitoring'],
    popularity: 70,
    clickCount: 500,
    recentUsage: 12,
    createdAt: Date.now(),
    url: '/tools/metrics-dashboard',
    icon: '📊',
  };
  engine.addTool(dynamicTool);
  printResults('query: metrics', engine.search('metrics'));
  printResults('query: dashboard', engine.search('dashboard'));
  engine.removeTool('new-tool');
  printResults('query: metrics (removed)', engine.search('metrics'));

  separator('7. RECENTLY USED BOOST');
  const jsonResults = engine.search('json');
  engine.recordSelect('json', jsonResults[0]);
  engine.recordSelect('json', engine.search('json')[0]);
  printResults('query: json (after 2 clicks)', engine.search('json'));

  separator('8. EDGE CASES');
  printResults('query: ""', engine.search(''));
  printResults('query: xyz_not_tool_123', engine.search('xyz_not_tool_123'));
  printResults('query: a', engine.search('a'));
}
