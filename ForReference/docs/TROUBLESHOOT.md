# 🔧 Troubleshooting Guide

> **Common issues, solutions, and debugging techniques for the KQL Security Training Platform.**

## 🚨 Quick Fixes

### Platform Won't Load

**Symptoms:** Blank page, loading indefinitely, or JavaScript errors

**Quick diagnosis:**
```bash
# 1. Check browser console (F12 → Console)
# Look for red error messages

# 2. Test in different browser
# Chrome, Firefox, Safari, Edge

# 3. Clear browser cache
# Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

# 4. Check GitHub Pages status
# Visit: https://your-username.github.io/KQLified
```

**Common causes and fixes:**
| Error Message | Cause | Solution |
|---------------|-------|----------|
| `404 Not Found` | Wrong baseurl in _config.yml | Update `baseurl: "/KQLified"` |
| `JavaScript error: fetch` | CORS or network issue | Check GitHub Pages deployment |
| `Loading scenarios config failed` | scenarios.json syntax error | Validate JSON with `jq .` |
| `Papa Parse error` | CSV formatting issue | Check CSV file format |

### Challenge Won't Load

**Symptoms:** Challenge selection doesn't work, data doesn't appear

**Step-by-step fix:**
```javascript
// 1. Open browser console and check current state
console.log('Selected scenario:', selectedScenario);
console.log('Data loader:', window.dataLoader);

// 2. Test data loading manually
window.dataLoader.loadScenarioData('password-spray').then(data => {
    console.log('Loaded data:', data);
});

// 3. Check file existence
fetch('assets/data/scenarios/password-spray/signin-logs.csv')
    .then(response => console.log('CSV status:', response.status));
```

### Progressive Hints Not Working

**Symptoms:** Hints don't stack, buttons don't respond

**Debug steps:**
```javascript
// Check enhanced system status
console.log('Enhanced system active:', useEnhancedSystem);
console.log('Current hint level:', enhancedHintLevel);
console.log('Challenge content:', enhancedChallengeContent);

// Reset hint system
resetEnhancedHintSystem();
toggleEnhancedHint();
```

## 🔍 Development Issues

### Jekyll Build Failures

**Error: `jekyll serve` won't start**
```bash
# Check Ruby and Jekyll versions
ruby --version  # Should be 2.7+
jekyll --version  # Should be 4.0+

# Reinstall if needed
gem uninstall jekyll
gem install jekyll bundler

# Clear Jekyll cache
rm -rf _site .jekyll-cache
jekyll serve --livereload
```

**Error: `Liquid Exception` during build**
```bash
# Common Liquid syntax errors in HTML files
# Fix: Check for unescaped {{ or }} in content
# Replace with: {% raw %}{{ content }}{% endraw %}

# Validate _config.yml syntax
ruby -c _config.yml
```

**Error: `Permission denied` on Windows**
```bash
# Run as administrator or fix permissions
icacls . /grant %USERNAME%:F /t

# Alternative: Use WSL (Windows Subsystem for Linux)
wsl
cd /mnt/c/path/to/KQLified
jekyll serve
```

### JavaScript Debugging

**Function not defined errors:**
```javascript
// Check loading order in index.html
<script src="assets/js/data-loader.js"></script>  <!-- Must be first -->
<script src="assets/js/user-manager.js"></script>
<script src="assets/js/script.js"></script>      <!-- Must be last -->

// Verify functions are loaded
console.log(typeof window.dataLoader);  // Should be 'object'
console.log(typeof selectScenario);     // Should be 'function'
```

**Enhanced system conflicts:**
```javascript
// Check for function override conflicts
const originalSelectScenario = window.selectScenario;
console.log('Original function exists:', typeof originalSelectScenario);

// Disable enhanced system for testing
disableEnhancedSystem();
selectScenario('password-spray');
```

**Memory leaks during testing:**
```javascript
// Monitor memory usage
console.log('Memory usage:', performance.memory.usedJSHeapSize / 1024 / 1024, 'MB');

// Clear data after testing
window.dataLoader.currentScenarioData = null;
enhancedChallengeContent = null;
```

### CSV Processing Errors

**Papa Parse failures:**
```javascript
// Debug CSV parsing step by step
const csvText = await fetch('assets/data/scenarios/password-spray/signin-logs.csv')
    .then(r => r.text());

console.log('CSV text length:', csvText.length);
console.log('First 200 chars:', csvText.substring(0, 200));

// Test parsing with error handling
const parsed = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    error: function(err) {
        console.error('Parse error:', err);
    },
    complete: function(results) {
        console.log('Parse success:', results.data.length, 'rows');
        console.log('Columns:', results.meta.fields);
        console.log('Errors:', results.errors);
    }
});
```

**CSV format issues:**
```csv
# ❌ Common mistakes:
# Missing quotes around text with commas
TimeGenerated,UserPrincipalName,Location
2025-06-27T14:23:15Z,user@company.com,New York, NY

# ✅ Correct format:
TimeGenerated,UserPrincipalName,Location
2025-06-27T14:23:15Z,user@company.com,"New York, NY"

# ❌ Inconsistent columns:
Row 1: TimeGenerated,User,IP
Row 2: Time,UserPrincipalName,IPAddress

# ✅ Consistent headers:
TimeGenerated,UserPrincipalName,IPAddress
```

## 🎯 Challenge Creation Issues

### JSON Validation Errors

**Invalid JSON syntax:**
```bash
# Validate JSON files
find assets/data -name "*.json" -exec jq . {} \;

# Common syntax errors:
# Missing comma: { "level": 1 "title": "Start" }  ❌
# Correct: { "level": 1, "title": "Start" }        ✅

# Trailing comma: { "level": 1, "title": "Start", } ❌
# Correct: { "level": 1, "title": "Start" }         ✅

# Unescaped quotes: { "content": "Use "where" clause" } ❌
# Correct: { "content": "Use \"where\" clause" }        ✅
```

**Schema validation:**
```javascript
// Validate progressive hints structure
const requiredHintFields = ['level', 'title', 'content'];
const hints = challengeContent.progressiveHints;

hints.forEach((hint, index) => {
    requiredHintFields.forEach(field => {
        if (!hint[field]) {
            console.error(`Hint ${index + 1} missing field: ${field}`);
        }
    });
    
    if (hint.level !== index + 1) {
        console.error(`Hint ${index + 1} has wrong level: ${hint.level}`);
    }
});
```

### Query Engine Limitations

**Unsupported KQL operators:**
```javascript
// Currently supported in data-loader.js:
const supportedOperators = [
    'where',       // Basic filtering
    'summarize',   // Grouping and aggregation
    'order by',    // Sorting
    'extend',      // Calculated fields
    'project'      // Column selection (limited)
];

// NOT supported yet:
const unsupportedOperators = [
    'join',        // Table joins
    'union',       // Combine tables
    'let',         // Variable assignment
    'materialize', // Query optimization
    'evaluate',    // Plugin functions
];
```

**Query execution debugging:**
```javascript
// Test query step by step
const dataset = window.dataLoader.getCurrentData();
console.log('Dataset rows:', dataset.rows.length);

// Test basic filtering
let filtered = dataset.rows.filter(row => row.ResultType != 0);
console.log('Failed logins:', filtered.length);

// Test grouping manually
const grouped = {};
filtered.forEach(row => {
    const ip = row.IPAddress;
    if (!grouped[ip]) grouped[ip] = [];
    grouped[ip].push(row);
});
console.log('Grouped by IP:', Object.keys(grouped).length);
```

### Content Quality Issues

**Hint progression problems:**
```javascript
// Check hint difficulty progression
const hints = challengeContent.progressiveHints;
const hintComplexity = hints.map(hint => ({
    level: hint.level,
    hasExample: !!hint.example,
    contentLength: hint.content.length,
    keywordCount: (hint.content.match(/summarize|where|order by/gi) || []).length
}));

console.table(hintComplexity);
// Should show gradual increase in complexity
```

**Unrealistic training data:**
```javascript
// Validate data realism
const data = window.dataLoader.getCurrentData();
const analysis = {
    totalRows: data.rows.length,
    uniqueUsers: new Set(data.rows.map(r => r.UserPrincipalName)).size,
    uniqueIPs: new Set(data.rows.map(r => r.IPAddress)).size,
    failureRate: data.rows.filter(r => r.ResultType != 0).length / data.rows.length,
    timeSpan: {
        start: Math.min(...data.rows.map(r => new Date(r.TimeGenerated))),
        end: Math.max(...data.rows.map(r => new Date(r.TimeGenerated)))
    }
};

console.log('Data analysis:', analysis);
// Should show realistic ratios and patterns
```

## 🎮 User Experience Issues

### Performance Problems

**Slow challenge loading:**
```javascript
// Performance debugging
console.time('Challenge Load');
loadScenario('password-spray').then(() => {
    console.timeEnd('Challenge Load');  // Should be < 2000ms
});

// Check asset sizes
fetch('assets/data/scenarios/password-spray/signin-logs.csv')
    .then(response => {
        console.log('CSV size:', response.headers.get('content-length'), 'bytes');
    });

// Monitor memory during operation
setInterval(() => {
    if (performance.memory) {
        console.log('Memory:', Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), 'MB');
    }
}, 5000);
```

**Browser compatibility issues:**
```javascript
// Check browser capabilities
const browserSupport = {
    es6: typeof Symbol !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    localStorage: typeof Storage !== 'undefined',
    promises: typeof Promise !== 'undefined',
    asyncAwait: (async () => {})() instanceof Promise
};

console.log('Browser support:', browserSupport);
// All should be true for full functionality
```

### Mobile Responsiveness

**Common mobile issues:**
```css
/* Debug mobile layout */
@media (max-width: 768px) {
    * {
        border: 1px solid red !important;  /* Temporary: visualize layout */
    }
    
    .challenge-panel {
        padding: 1rem !important;  /* Ensure mobile padding */
    }
    
    .logs-table {
        font-size: 0.7rem !important;  /* Readable table text */
    }
}
```

**Touch interaction testing:**
```javascript
// Test touch events on mobile
document.addEventListener('touchstart', function(e) {
    console.log('Touch detected on:', e.target.className);
});

// Check for mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log('Is mobile device:', isMobile);
```

### Accessibility Issues

**Screen reader compatibility:**
```html
<!-- Verify accessibility attributes -->
<button aria-label="Get next hint" onclick="showEnhancedNextHint()">
    🔍 Get Next Hint
</button>

<!-- Check heading structure -->
<h1>Main Title</h1>
  <h2>Section Title</h2>
    <h3>Subsection Title</h3>  <!-- Proper nesting -->
```

**Keyboard navigation testing:**
```javascript
// Test keyboard navigation
document.addEventListener('keydown', function(e) {
    console.log('Key pressed:', e.key, 'on element:', e.target.tagName);
    
    // Ensure all interactive elements are accessible
    if (e.key === 'Tab') {
        console.log('Tabbing to:', document.activeElement);
    }
});
```

## 📊 Data Issues

### User Progress Problems

**XP not awarding correctly:**
```javascript
// Debug XP system
const userManager = window.userManager;
console.log('Current XP:', userManager.getUserXP());
console.log('Completed scenarios:', userManager.getCompletedScenarios());

// Test XP award manually
userManager.addXP(100, 'test-scenario');

// Check localStorage
console.log('LocalStorage data:', {
    xp: localStorage.getItem('kql_user_xp'),
    completed: localStorage.getItem('kql_scenarios_completed'),
    name: localStorage.getItem('kql_user_name')
});
```

**Progress not saving:**
```javascript
// Test localStorage functionality
try {
    localStorage.setItem('test', 'value');
    const retrieved = localStorage.getItem('test');
    localStorage.removeItem('test');
    console.log('LocalStorage working:', retrieved === 'value');
} catch (e) {
    console.error('LocalStorage disabled:', e);
    // Fallback to session storage or in-memory storage
}
```

**Recovery codes not working:**
```javascript
// Debug recovery code system
const userManager = window.userManager;

// Test code generation
const testCode = userManager.generateCompletionCode('password-spray');
console.log('Generated code:', testCode);

// Test code validation
const validation = userManager.validateCompletionCode(testCode);
console.log('Validation result:', validation);
```

### Content Synchronization

**Scenarios.json out of sync:**
```bash
# Verify all scenarios have complete file sets
for scenario in assets/data/scenarios/*/; do
    name=$(basename "$scenario")
    echo "Checking $name:"
    
    # Required files
    test -f "$scenario/${name}.json" && echo "  ✓ Enhanced content" || echo "  ❌ Missing enhanced content"
    test -f "$scenario/solution.kql" && echo "  ✓ Solution" || echo "  ❌ Missing solution"
    ls "$scenario"/*.csv >/dev/null 2>&1 && echo "  ✓ Data file" || echo "  ❌ Missing CSV"
    
    # Check registration in scenarios.json
    grep -q "\"$name\":" assets/data/scenarios.json && echo "  ✓ Registered" || echo "  ❌ Not registered"
done
```

## 🔧 Advanced Debugging

### Browser DevTools Techniques

**Network tab investigation:**
```javascript
// Monitor all network requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('Fetch request:', args[0]);
    return originalFetch.apply(this, arguments)
        .then(response => {
            console.log('Fetch response:', response.status, args[0]);
            return response;
        })
        .catch(error => {
            console.error('Fetch error:', error, args[0]);
            throw error;
        });
};
```

**Performance profiling:**
```javascript
// Profile function performance
function profileFunction(name, fn) {
    return function(...args) {
        console.time(name);
        const result = fn.apply(this, args);
        console.timeEnd(name);
        return result;
    };
}

// Apply to key functions
window.loadScenario = profileFunction('loadScenario', loadScenario);
window.runQuery = profileFunction('runQuery', runQuery);
```

**Memory leak detection:**
```javascript
// Monitor for memory leaks
let memoryBaseline = 0;

function checkMemoryUsage() {
    if (performance.memory) {
        const current = performance.memory.usedJSHeapSize / 1024 / 1024;
        const delta = current - memoryBaseline;
        
        console.log(`Memory: ${current.toFixed(1)}MB (${delta > 0 ? '+' : ''}${delta.toFixed(1)}MB)`);
        
        if (delta > 10) {
            console.warn('Potential memory leak detected!');
        }
        
        memoryBaseline = current;
    }
}

// Check memory every 30 seconds during development
setInterval(checkMemoryUsage, 30000);
```

### Production Issue Investigation

**User-reported problems:**
```javascript
// Diagnostic script for users to run
function generateDiagnosticReport() {
    const report = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        localStorage: {
            available: typeof Storage !== 'undefined',
            quota: navigator.storage ? 'checking...' : 'unknown'
        },
        platformState: {
            selectedScenario: selectedScenario,
            enhancedSystem: useEnhancedSystem,
            hintLevel: enhancedHintLevel,
            dataLoaderExists: !!window.dataLoader,
            userManagerExists: !!window.userManager
        },
        performance: performance.getEntriesByType('navigation')[0],
        errors: window.lastErrors || []
    };
    
    // Get storage quota if available
    if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
            report.localStorage.quota = estimate;
        });
    }
    
    console.log('Diagnostic Report:', JSON.stringify(report, null, 2));
    return report;
}

// Error tracking
window.lastErrors = [];
window.addEventListener('error', function(e) {
    window.lastErrors.push({
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        timestamp: Date.now()
    });
    
    // Keep only last 10 errors
    if (window.lastErrors.length > 10) {
        window.lastErrors.shift();
    }
});
```

## 📋 Troubleshooting Checklist

### Before Reporting Issues

**User-level troubleshooting:**
- [ ] Tried in different browser (Chrome, Firefox, Safari)
- [ ] Cleared browser cache and cookies
- [ ] Disabled browser extensions temporarily
- [ ] Checked internet connection stability
- [ ] Tried on different device (if available)

**Developer troubleshooting:**
- [ ] Checked browser console for JavaScript errors
- [ ] Verified all files exist and are accessible
- [ ] Tested with minimal scenario (password-spray)
- [ ] Ran Jekyll build locally without errors
- [ ] Validated JSON and CSV file formats
- [ ] Confirmed GitHub Pages deployment succeeded

**Advanced troubleshooting:**
- [ ] Generated diagnostic report
- [ ] Profiled performance bottlenecks
- [ ] Checked network requests in DevTools
- [ ] Monitored memory usage patterns
- [ ] Tested with enhanced system disabled

### Reporting Issues Effectively

**Include in issue reports:**
1. **Environment details** (browser, device, OS)
2. **Steps to reproduce** (specific scenario, actions taken)
3. **Expected vs actual behavior**
4. **Console errors** (screenshots or text)
5. **Diagnostic report** (if possible)

**Issue template:**
```markdown
## 🐛 Bug Report

**Environment:**
- Browser: Chrome 91.0.4472.124
- Device: Desktop Windows 10
- Screen: 1920x1080
- Internet: Stable broadband

**Steps to Reproduce:**
1. Navigate to password-spray challenge
2. Click "Get Next Hint" button
3. Complete all 5 hints
4. Click "Get Next Hint" again

**Expected Behavior:**
Button should be disabled or show completion message

**Actual Behavior:**
JavaScript error thrown, hints reset to level 1

**Console Error:**
```
TypeError: Cannot read property 'level' of undefined
    at showEnhancedNextHint (script.js:789)
```

**Additional Context:**
- Happens consistently after completing all hints
- Works fine in Firefox
- No browser extensions active
```

---

## 🆘 Getting Help

### Community Support

- **💬 [GitHub Discussions](https://github.com/your-repo/discussions)** - General questions and community help
- **🐛 [GitHub Issues](https://github.com/your-repo/issues)** - Bug reports and feature requests
- **📚 [Documentation](../README.md)** - Comprehensive guides and references

### Emergency Support

**Critical production issues:**
1. Create urgent GitHub issue with `critical` label
2. Include detailed diagnostic report
3. Mention `@maintainers` for immediate attention

**Development blockers:**
1. Check existing issues for similar problems
2. Try workarounds from this troubleshooting guide
3. Join community discussions for real-time help

---

**🎯 Most issues have simple solutions - start with the quick fixes and work through the debugging steps systematically!** 🔧