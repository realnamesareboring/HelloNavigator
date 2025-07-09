# 🚀 Deployment Guide

> **Production deployment, hosting, monitoring, and operational maintenance for the KQL Security Training Platform.**

## ⚡ Quick Deployment

### GitHub Pages (Recommended)

**Fastest path to production:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Enable GitHub Pages
# Go to: Repository Settings → Pages
# Source: Deploy from branch
# Branch: main / (root)

# 3. Site live at: https://your-username.github.io/KQLified
```

**Deployment time:** ~2-3 minutes after push

## 🏗️ Hosting Options

### Option 1: GitHub Pages (Free)

**✅ Pros:**
- Free hosting for public repositories
- Automatic deployments on push
- Built-in Jekyll support
- SSL certificates included
- CDN distribution

**⚠️ Considerations:**
- Public repositories only (for free)
- 1GB storage limit
- 100GB bandwidth/month limit
- Custom domains supported

**Setup Steps:**
```bash
# 1. Repository settings
Settings → Pages → Source: Deploy from a branch
Branch: main, Folder: / (root)

# 2. Configure _config.yml
title: "Your KQL Training Platform"
baseurl: "/your-repo-name"  # Must match repository name
url: "https://your-username.github.io"

# 3. Custom domain (optional)
# Add CNAME file with: your-domain.com
# Configure DNS: CNAME record pointing to your-username.github.io
```

### Option 2: Self-Hosted (VPS/Cloud)

**Use cases:**
- Private/internal training platforms
- Custom branding requirements
- Higher traffic volumes
- Additional security controls

**Basic setup:**
```bash
# Example: Ubuntu server deployment
sudo apt update
sudo apt install nginx ruby-full build-essential zlib1g-dev

# Install Jekyll
gem install jekyll bundler

# Clone and build
git clone https://github.com/your-username/KQLified.git
cd KQLified
jekyll build

# Configure Nginx
sudo cp _site/* /var/www/html/
sudo systemctl reload nginx
```

### Option 3: Alternative Static Hosts

**Netlify:**
```bash
# netlify.toml
[build]
  command = "jekyll build"
  publish = "_site"

[build.environment]
  JEKYLL_ENV = "production"
```

**Vercel:**
```json
// vercel.json
{
  "buildCommand": "jekyll build",
  "outputDirectory": "_site",
  "framework": "jekyll"
}
```

## ⚙️ CI/CD Pipeline

### GitHub Actions Workflow

**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy KQL Training Platform

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true
          
      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v3
        
      - name: Build with Jekyll
        run: bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"
        env:
          JEKYLL_ENV: production
          
      - name: Test build
        run: |
          # Basic validation
          test -f _site/index.html
          test -f _site/assets/js/script.js
          test -f _site/assets/css/style.css
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### Automated Testing

**Pre-deployment validation:**
```yaml
# Add to build job
- name: Validate content
  run: |
    # Check for broken internal links
    bundle exec htmlproofer _site --disable-external --check-html
    
    # Validate JSON files
    find assets/data -name "*.json" -exec jq . {} \;
    
    # Check CSV format
    python3 -c "
    import pandas as pd
    pd.read_csv('assets/data/scenarios/password-spray/signin-logs.csv')
    print('CSV validation passed')
    "
    
    # Verify JavaScript syntax
    node -c assets/js/script.js
    node -c assets/js/data-loader.js
    node -c assets/js/user-manager.js
```

### Deployment Notifications

**Slack integration:**
```yaml
- name: Notify deployment
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    channel: '#deployments'
    text: '🚀 KQL Training Platform deployed successfully!'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## 📊 Performance Monitoring

### Core Metrics

**Response Time Targets:**
- Initial page load: < 3 seconds
- Challenge load: < 2 seconds
- Query execution: < 1 second
- Hint display: < 500ms

**Monitoring Tools:**

**1. Google PageSpeed Insights**
```bash
# Monitor performance score
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://your-site.com&strategy=mobile"
```

**2. Lighthouse CI**
```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    configPath: './lighthouserc.json'
    uploadArtifacts: true
```

**3. Real User Monitoring**
```javascript
// Add to index.html for production monitoring
if (window.performance && window.performance.getEntriesByType) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const navigation = performance.getEntriesByType('navigation')[0];
            const metrics = {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstByte: navigation.responseStart - navigation.requestStart
            };
            
            // Send to analytics (implement based on your needs)
            console.log('Performance metrics:', metrics);
        }, 0);
    });
}
```

### Performance Optimization

**Asset Optimization:**
```bash
# Minify CSS
npm install -g clean-css-cli
cleancss -o assets/css/style.min.css assets/css/style.css

# Minify JavaScript
npm install -g uglify-js
uglifyjs assets/js/script.js -o assets/js/script.min.js

# Optimize images
npm install -g imagemin-cli
imagemin assets/images/* --out-dir=assets/images/optimized
```

**Jekyll Performance:**
```yaml
# _config.yml optimizations
plugins:
  - jekyll-minifier

jekyll-minifier:
  uglifier_args:
    harmony: true
  
sass:
  style: compressed

exclude:
  - node_modules
  - .git
  - README.md
  - docs/
```

### Caching Strategy

**Browser caching headers:**
```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html|json)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

**Service Worker (Progressive Web App):**
```javascript
// sw.js - Basic service worker for offline support
const CACHE_NAME = 'kql-training-v1';
const urlsToCache = [
    '/',
    '/assets/css/style.css',
    '/assets/js/script.js',
    '/assets/js/data-loader.js',
    '/assets/js/user-manager.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});
```

## 🔒 Security Considerations

### Content Security Policy

**Add to index.html:**
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    connect-src 'self';
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
">
```

### Data Privacy

**User data handling:**
- All user progress stored locally (localStorage)
- No personal data transmitted to servers
- GDPR compliant by design
- Optional analytics with clear opt-out

**Implementation:**
```javascript
// Privacy-first analytics
const analytics = {
    enabled: localStorage.getItem('analytics-consent') === 'true',
    
    track: function(event, data) {
        if (!this.enabled) return;
        
        // Only track anonymous usage patterns
        const anonymousData = {
            event: event,
            timestamp: Date.now(),
            // No personal identifiers
        };
        
        // Send to privacy-friendly analytics service
    }
};
```

### Security Headers

**Recommended headers:**
```nginx
# nginx security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy strict-origin-when-cross-origin;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
```

## 📈 Scaling Considerations

### Traffic Growth Planning

**Current capacity:**
- GitHub Pages: 100GB bandwidth/month
- Typical page size: ~500KB
- Estimated capacity: ~200,000 page views/month

**Scaling indicators:**
```javascript
// Monitor these metrics
const scalingMetrics = {
    dailyActiveUsers: 'Track via localStorage timestamps',
    averageSessionLength: 'Time spent per visit',
    challengeCompletionRates: 'Success rates by scenario',
    serverResponseTimes: 'Monitor via external tools'
};
```

**Scaling strategies:**
1. **CDN implementation** for global performance
2. **Asset optimization** and compression
3. **Progressive loading** for large datasets
4. **Microservice architecture** for advanced features

### Content Scaling

**Challenge management:**
```bash
# Automated challenge validation
scripts/validate-challenges.sh
├── JSON schema validation
├── CSV format checking  
├── KQL syntax verification
└── Educational content review
```

**Multi-language support:**
```yaml
# _config.yml
languages: ["en", "es", "fr", "de"]
default_lang: "en"

# Directory structure
_data/
├── en/
│   ├── scenarios.json
│   └── ui-text.json
├── es/
│   ├── scenarios.json
│   └── ui-text.json
```

## 🔧 Maintenance Operations

### Regular Maintenance Tasks

**Weekly:**
- [ ] Monitor performance metrics
- [ ] Review error logs and user feedback
- [ ] Update dependencies for security patches
- [ ] Validate all challenge scenarios still work

**Monthly:**
- [ ] Performance optimization review
- [ ] Content quality assessment
- [ ] User analytics analysis
- [ ] Security vulnerability scan

**Quarterly:**
- [ ] Platform architecture review
- [ ] Educational effectiveness evaluation
- [ ] Community feedback integration
- [ ] Roadmap and feature planning

### Update Procedures

**Content updates:**
```bash
# Safe content update process
git checkout -b content-update-$(date +%Y%m%d)

# Make changes to scenarios or content
# Test locally
jekyll serve --livereload

# Validate changes
scripts/validate-content.sh

# Deploy via pull request
git push origin content-update-$(date +%Y%m%d)
# Create PR for review
```

**Platform updates:**
```bash
# Feature deployment with rollback capability
git tag production-backup-$(date +%Y%m%d)
git checkout main
git pull origin main

# Deploy new features
git push origin main

# Monitor for issues
# If problems: git reset --hard production-backup-$(date +%Y%m%d)
```

### Backup Strategy

**Automated backups:**
```yaml
# .github/workflows/backup.yml
name: Backup Platform Data

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly at 2 AM Sunday

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup repository
        run: |
          git clone --mirror https://github.com/your-username/KQLified.git
          tar -czf backup-$(date +%Y%m%d).tar.gz KQLified.git
          
      - name: Store backup
        uses: actions/upload-artifact@v3
        with:
          name: platform-backup-$(date +%Y%m%d)
          path: backup-$(date +%Y%m%d).tar.gz
          retention-days: 90
```

## 📊 Analytics and Insights

### User Analytics (Privacy-First)

**Metrics to track:**
```javascript
const privacyFriendlyMetrics = {
    // Usage patterns (no personal data)
    popularChallenges: 'Most completed scenarios',
    averageCompletionTime: 'Time per challenge',
    hintUsagePatterns: 'Where users need help',
    deviceTypes: 'Mobile vs desktop usage',
    
    // Educational effectiveness
    learningProgression: 'Skill building patterns',
    retentionRates: 'Return visit frequency',
    successRates: 'Challenge completion rates',
    difficultyCalibration: 'Challenge difficulty accuracy'
};
```

**Implementation with Plausible Analytics:**
```html
<!-- Privacy-friendly analytics -->
<script defer data-domain="your-domain.com" src="https://plausible.io/js/plausible.js"></script>
<script>
    window.plausible = window.plausible || function() { 
        (window.plausible.q = window.plausible.q || []).push(arguments) 
    }
</script>
```

### Performance Analytics

**Core Web Vitals monitoring:**
```javascript
// Monitor Core Web Vitals
function observeWebVitals() {
    new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            // Log or send to analytics
            console.log(`${entry.name}: ${entry.value}`);
        }
    }).observe({entryTypes: ['largest-contentful-paint', 'first-input', 'cumulative-layout-shift']});
}

if ('PerformanceObserver' in window) {
    observeWebVitals();
}
```

## 🚨 Incident Response

### Common Issues and Solutions

**Issue: Site not loading after deployment**
```bash
# 1. Check GitHub Actions status
# 2. Verify _config.yml syntax
jekyll build --verbose

# 3. Check for broken links
bundle exec htmlproofer _site --disable-external

# 4. Rollback if necessary
git revert HEAD~1
git push origin main
```

**Issue: Challenge not loading**
```bash
# 1. Validate JSON syntax
jq . assets/data/scenarios/challenge-name/challenge-name.json

# 2. Check CSV format
head -5 assets/data/scenarios/challenge-name/data.csv

# 3. Verify file paths in scenarios.json
# 4. Test locally with specific scenario
```

**Issue: Performance degradation**
```bash
# 1. Run Lighthouse audit
lighthouse https://your-site.com --output=json

# 2. Check asset sizes
du -sh _site/assets/*

# 3. Monitor browser DevTools Network tab
# 4. Implement optimizations based on findings
```

### Emergency Procedures

**Critical issue (site down):**
1. **Immediate**: Rollback to last known good state
2. **Communicate**: Update status page/social media
3. **Investigate**: Identify root cause
4. **Fix**: Implement proper solution
5. **Post-mortem**: Document lessons learned

**Data loss prevention:**
- Automated daily backups
- Version control for all content
- Multiple deployment environments
- Recovery procedures documented

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] All tests pass locally
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Content validation passed
- [ ] Backup created

### Deployment
- [ ] Deploy to staging environment first
- [ ] Monitor deployment process
- [ ] Verify functionality post-deployment
- [ ] Check performance metrics
- [ ] Confirm all scenarios work

### Post-Deployment
- [ ] Monitor error rates for 24 hours
- [ ] Review user feedback and issues
- [ ] Document any lessons learned
- [ ] Plan next iteration improvements

**Ready for production?** Your KQL Security Training Platform is built for reliable, scalable deployment! 🚀

---

## 📞 Operations Support

- **🚨 Emergency issues**: Create urgent GitHub issue
- **📊 Performance questions**: Check monitoring dashboards
- **🔧 Technical deployment help**: Review troubleshooting guide
- **📈 Scaling planning**: Contact platform maintainers

**Keep your platform running smoothly and your learners engaged!** 🛡️