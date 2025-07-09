# ➕ Adding New Challenges

> **Step-by-step guide to create engaging KQL security challenges with progressive hints and expert walkthroughs.**

## 🚀 Quick Overview

Adding a new challenge takes **30-60 minutes** and involves:
1. **Create training data** (CSV with realistic logs)
2. **Write expert solution** (KQL query that detects the threat)
3. **Build educational content** (Progressive hints + walkthrough)
4. **Register in platform** (Add to navigation and metadata)
5. **Test and validate** (Ensure everything works)

## 📋 Before You Start

### Choose Your Challenge

**Good challenge characteristics:**
- **Real-world relevance**: Based on actual attack patterns
- **Clear learning objective**: What specific KQL skill does this teach?
- **Appropriate difficulty**: Fits into beginner → intermediate → advanced progression
- **Detectable pattern**: Can be found with KQL analysis

**Challenge ideas:**
- **Beginner**: Basic filtering, counting, time windows
- **Intermediate**: Grouping, aggregation, correlation
- **Advanced**: Complex joins, advanced analytics, behavioral analysis

### Required Skills

- **Security knowledge**: Understanding of the attack pattern
- **KQL expertise**: Ability to write effective detection queries
- **Educational design**: Creating progressive learning content

## 🎯 Step 1: Create Challenge Directory

```bash
# Create your challenge folder
mkdir assets/data/scenarios/your-challenge-name

# Files you'll create:
# ├── your-logs.csv           # Training data
# ├── solution.kql           # Expert solution  
# └── your-challenge-name.json # Educational content
```

**Naming conventions:**
- Use kebab-case: `brute-force`, `lateral-movement`, `privilege-escalation`
- Keep names descriptive but concise
- Match folder name with JSON filename

## 📊 Step 2: Create Training Data (CSV)

### Example Structure
```csv
TimeGenerated,UserPrincipalName,IPAddress,ResultType,AppDisplayName,Location
2025-06-27T14:23:15Z,user1@company.com,192.168.1.100,0,Microsoft 365,"New York, NY"
2025-06-27T14:24:32Z,user2@company.com,203.0.113.45,50126,Microsoft 365,Unknown
2025-06-27T14:25:41Z,user3@company.com,203.0.113.45,50126,Microsoft 365,Unknown
```

### Data Design Guidelines

**1. Realistic Field Names**
Use authentic column names from actual log sources:
```csv
# ✅ Good: Real Microsoft log fields
TimeGenerated,UserPrincipalName,IPAddress,ResultType,ConditionalAccessStatus

# ❌ Avoid: Generic or fake field names  
Time,User,IP,Status,Access
```

**2. Mix Normal + Suspicious Activity**
```csv
# Normal activity (ResultType = 0 = success)
2025-06-27T09:15:20Z,alice@company.com,10.0.1.50,0,Microsoft Teams,"Seattle, WA"
2025-06-27T09:18:35Z,bob@company.com,10.0.1.51,0,SharePoint Online,"Seattle, WA"

# Suspicious activity (attack pattern)
2025-06-27T13:45:12Z,admin@company.com,203.0.113.45,50126,Microsoft 365,Unknown
2025-06-27T13:45:23Z,service@company.com,203.0.113.45,50126,Microsoft 365,Unknown
2025-06-27T13:45:34Z,backup@company.com,203.0.113.45,50126,Microsoft 365,Unknown
```

**3. Include Enough Data**
- **Minimum**: 30-50 rows
- **Sweet spot**: 100-200 rows  
- **Pattern ratio**: 80% normal, 20% suspicious

**4. Clear Attack Signature**
Make sure your attack pattern is:
- **Detectable**: Can be found with KQL
- **Realistic**: Based on real attack techniques
- **Unambiguous**: Clear distinction from normal activity

### Common Log Types

**Microsoft 365 / Entra ID**:
```csv
TimeGenerated,UserPrincipalName,IPAddress,Location,ResultType,AppDisplayName,ClientAppUsed,DeviceDetail,RiskLevelDuringSignIn
```

**Azure Activity**:
```csv
TimeGenerated,Caller,ResourceGroup,OperationName,ActivityStatusValue,ResourceId,SubscriptionId
```

**AWS CloudTrail**:
```csv
eventTime,userIdentity.type,sourceIPAddress,eventName,errorCode,userIdentity.userName,awsRegion
```

## 🔍 Step 3: Write Expert Solution (KQL)

### Solution Template
```kql
// [Challenge Name] Detection
// Identifies [specific attack pattern] using [technique]
// This pattern suggests [what it indicates]

YourLogTable
| where TimeGenerated > ago(24h)
| where [initial filtering conditions]
| summarize 
    [key metrics] = [aggregation functions],
    [supporting metrics] = [other calculations],
    [evidence] = make_set([relevant fields])
    by [grouping fields]
| where [threshold conditions]
| extend [calculated fields]
| order by [priority fields] desc
| project [final output columns]
```

### Real Example (Password Spray)
```kql
// Password Spray Attack Detection
// Identifies IP addresses targeting multiple user accounts with failed login attempts
// This pattern suggests automated password spraying against multiple accounts

SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != 0  // Failed logins only
| summarize 
    UniqueUsers = dcount(UserPrincipalName),
    FailedAttempts = count(),
    TargetedUsers = make_set(UserPrincipalName),
    FirstAttempt = min(TimeGenerated),
    LastAttempt = max(TimeGenerated)
    by IPAddress, Location
| where UniqueUsers >= 5  // Potential spray threshold
| extend 
    AttackDuration = LastAttempt - FirstAttempt,
    AverageAttemptsPerUser = FailedAttempts / UniqueUsers
| order by UniqueUsers desc, FailedAttempts desc
| project 
    IPAddress,
    Location,
    UniqueUsers,
    FailedAttempts,
    AverageAttemptsPerUser,
    AttackDuration,
    FirstAttempt,
    LastAttempt,
    TargetedUsers
```

### Solution Quality Checklist
- [ ] **Clear comments**: Explain what and why
- [ ] **Proper formatting**: Readable indentation
- [ ] **Effective detection**: Actually finds the attack pattern
- [ ] **Minimal false positives**: Doesn't trigger on normal activity
- [ ] **Educational value**: Teaches important KQL concepts

## 📚 Step 4: Create Educational Content (JSON)

### Full Template
```json
{
  "challengeId": "your-challenge-name",
  "title": "Your Challenge Detection",
  "progressiveHints": [
    {
      "level": 1,
      "title": "🎯 Start Simple",
      "content": "Begin by exploring the data source. Look for [what to look for] by filtering where [basic condition]. This will show you [what you'll see].",
      "example": "YourTable | where [basic filter]"
    },
    {
      "level": 2, 
      "title": "📊 Group Your Data",
      "content": "[Attack type] attacks show [specific pattern]. Use the 'summarize' operator to group [events] by [grouping field] and count [what to count].",
      "example": "| summarize [metric] = [function] by [grouping]"
    },
    {
      "level": 3,
      "title": "🔍 Add More Metrics",
      "content": "Enhance your analysis by adding [additional metrics]. Use [functions] to [what they do] and [other functions] for [their purpose].",
      "example": "| summarize [metric1] = [func1], [metric2] = [func2] by [grouping]"
    },
    {
      "level": 4,
      "title": "⚡ Set Thresholds",
      "content": "[Attack type] typically [behavior pattern]. Add a filter after your summarize to focus on suspicious activity with 'where [metric] >= [threshold]'.",
      "example": "| where [metric] >= [threshold]"
    },
    {
      "level": 5,
      "title": "🎯 Final Polish",
      "content": "Sort your results to show the most suspicious [items] first using 'order by [field] desc'. Also consider adding [additional enhancements] for complete analysis.",
      "example": "| order by [field] desc, [field2] desc"
    }
  ],
  "walkthrough": {
    "title": "🧠 [Attack Type]: KQL Detective Work",
    "subtitle": "Let's understand WHY we built this query step-by-step and how each piece solves the puzzle",
    "challenge": {
      "title": "🎯 The Challenge: What Makes [Attack Type] Tricky?",
      "description": "[Attack type] attacks are sneaky because:",
      "points": [
        "**[Challenge 1]** - [explanation]",
        "**[Challenge 2]** - [explanation]", 
        "**[Challenge 3]** - [explanation]"
      ],
      "detectiveWork": "Find patterns that show _[what we're looking for]_"
    },
    "solution": {
      "title": "📝 Our Detective Query",
      "query": "[Your KQL solution with inline comments]"
    },
    "reasoningSteps": [
      {
        "step": 1,
        "title": "Data Source Selection",
        "operator": "YourTable",
        "explanation": "This table contains [what it contains]. It's our [metaphor for data source].",
        "detectiveInsight": "Like [real-world analogy] - we need to [what we need to do].",
        "borderColor": "#2c5aa0"
      },
      {
        "step": 2,
        "title": "Time Window Focus",
        "operator": "| where TimeGenerated > ago(24h)",
        "explanation": "[Attack type] campaigns happen in [timeframe]. [Why this matters].",
        "detectiveInsight": "[Real-world analogy]. The `ago()` function is like [metaphor].",
        "borderColor": "#ff9800"
      }
    ],
    "resultInterpretation": {
      "title": "🎓 What Our Results Tell Us",
      "description": "When our query finds results, here's what each field reveals:",
      "fields": [
        {
          "field": "[FieldName] + [condition]",
          "meaning": "[What this indicates about the attack]"
        }
      ],
      "pattern": "[Summary of what pattern we're detecting]"
    }
  }
}
```

### Progressive Hints Best Practices

**Level 1 - Data Exploration**
- Introduce the data source
- Basic filtering concept
- Simple example query

**Level 2 - Core Concept**
- Introduce main KQL operator (usually `summarize`)
- Explain the attack pattern
- Show grouping concept

**Level 3 - Enhanced Analysis** 
- Add more metrics and functions
- Introduce complexity gradually
- Multiple aggregations

**Level 4 - Threshold Setting**
- Explain why thresholds matter
- Show filtering after aggregation
- Reduce false positives

**Level 5 - Query Optimization**
- Sorting and presentation
- Additional calculated fields
- Professional query structure

## 🔧 Step 5: Register in Platform

### Add to Scenarios Config
Edit `assets/data/scenarios.json`:
```json
{
  "scenarios": {
    "your-challenge-name": {
      "title": "Your Challenge Title",
      "platform": "Microsoft Entra ID",
      "difficulty": "Intermediate", 
      "duration": "20-25 minutes",
      "points": 300,
      "xpReward": 300,
      "description": "<strong>Scenario:</strong> [Scenario description] <br><br><strong>Learning Objectives:</strong> [What they'll learn] <br><br><strong>Data Sources:</strong> [Log sources]",
      "dataFile": "your-logs.csv",
      "solutionFile": "solution.kql",
      "tableName": "YourLogTable",
      "expectedResults": {
        "minRows": 1,
        "suspiciousThreshold": 5,
        "successCriteria": "Identifies [what it should find]"
      }
    }
  }
}
```

### Add to Navigation
Edit `index.html` - find the appropriate platform section:
```html
<div class="attack-path" onclick="selectScenario('your-challenge-name')">
    <span class="attack-path-title">Your Challenge Title</span>
    <span class="difficulty-badge difficulty-intermediate">Intermediate</span>
</div>
```

**Difficulty badges:**
- `difficulty-beginner` (green)
- `difficulty-intermediate` (orange)  
- `difficulty-advanced` (red)
- `difficulty-expert` (purple)

## 🧪 Step 6: Test Your Challenge

### Local Testing Process

```bash
# 1. Start development server
jekyll serve --livereload

# 2. Navigate to your challenge
# Click hamburger menu → Your platform → Your challenge

# 3. Test each component:
```

**Testing Checklist:**
- [ ] Challenge loads without console errors
- [ ] CSV data displays correctly in table
- [ ] Progressive hints show and stack properly
- [ ] Each hint level builds on the previous
- [ ] Query editor accepts input
- [ ] Expert solution runs and finds attack pattern
- [ ] XP awards correctly on successful completion
- [ ] Enhanced walkthrough displays properly

### Validation Tests

**1. Data Quality Test:**
```javascript
// In browser console:
const data = window.dataLoader.getCurrentData();
console.log('Rows:', data.rows.length);
console.log('Columns:', data.columns);
console.log('Sample row:', data.rows[0]);
```

**2. Solution Effectiveness Test:**
```javascript
// Test your expert solution
const result = window.dataLoader.executeQuery(yourExpertSolution);
console.log('Solution results:', result);
// Should find your attack pattern
```

**3. Progressive Hints Test:**
```javascript
// Test each hint level
enhancedHintLevel = 1;
displayEnhancedStackedHints();
// Verify each level makes sense
```

## 📋 Quality Checklist

### Before Submitting

**Technical Quality:**
- [ ] All files created and properly named
- [ ] CSV data is realistic and well-structured
- [ ] KQL solution works and finds attack pattern
- [ ] JSON is valid and follows schema
- [ ] No console errors during testing
- [ ] Challenge loads in under 2 seconds

**Educational Quality:**
- [ ] Clear learning progression from hint 1 to 5
- [ ] Each hint builds on previous knowledge
- [ ] Walkthrough explains concepts thoroughly
- [ ] Real-world relevance is clear
- [ ] Difficulty level is appropriate

**Content Quality:**
- [ ] Attack pattern is realistic and current
- [ ] Detection logic is sound and effective
- [ ] False positive rate is low
- [ ] Educational value is high
- [ ] Writing is clear and engaging

## 🎯 Real Example: Brute Force Challenge

Let's see a real implementation:

### File Structure
```
assets/data/scenarios/brute-force/
├── signin-logs.csv          # Same data as password-spray (different analysis)
├── solution.kql            # Focus on single users with many failures
└── brute-force.json        # Progressive hints for brute force detection
```

### Key Differences from Password Spray
```kql
// Brute force focuses on: many attempts against FEW users
// Password spray focuses on: few attempts against MANY users

// Brute force solution:
SigninLogs
| where ResultType != 0
| summarize FailedAttempts = count(), 
           SourceIPs = make_set(IPAddress)
           by UserPrincipalName  // Group by USER (not IP)
| where FailedAttempts >= 10   // Many attempts per user
| order by FailedAttempts desc
```

### Progressive Hints Focus
1. **Level 1**: Filter for failed logins
2. **Level 2**: Group by USER (not IP like password spray)
3. **Level 3**: Count attempts and source IPs per user
4. **Level 4**: Set threshold for "too many attempts"
5. **Level 5**: Sort by most attacked users first

## 🚀 Next Steps

1. **Create your challenge** following this guide
2. **Test thoroughly** with the checklist
3. **Submit a pull request** with your new challenge
4. **Get feedback** from the community
5. **Iterate and improve** based on testing

### Getting Help

- **📋 Questions?** → [Create a Discussion](https://github.com/your-username/KQLified/discussions)
- **🐛 Issues?** → Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **💡 Ideas?** → Share in Discussions or Issues

---

**🎯 Ready to create your first challenge? Start with a simple brute force or lateral movement scenario!**