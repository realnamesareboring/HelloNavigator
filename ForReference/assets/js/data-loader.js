// Enhanced Data Loader for Jekyll - JSON-Driven Navigation + Challenge Loading
class DataLoader {
    constructor() {
        this.scenarios = {};
        this.navigationConfig = null;
        this.currentScenarioData = null;
        this.currentColumns = [];
        this.challengeCache = new Map(); // Cache loaded challenges
    }

    // =============================================================================
    // NEW: Navigation Configuration Loading
    // =============================================================================

    async loadNavigationConfig() {
        try {
            console.log('🔄 Loading navigation configuration...');
            const response = await fetch('assets/data/scenarios.json');
            const config = await response.json();
            this.navigationConfig = config;
            console.log('✅ Navigation config loaded:', {
                platforms: Object.keys(config.platforms).length,
                totalChallenges: this.getTotalChallengeCount(config)
            });
            return this.navigationConfig;
        } catch (error) {
            console.error('❌ Failed to load navigation config:', error);
            return null;
        }
    }

    getTotalChallengeCount(config) {
        return Object.values(config.platforms || {}).reduce((total, platform) => {
            return total + (platform.challenges ? platform.challenges.length : 0);
        }, 0);
    }

    getNavigationConfig() {
        return this.navigationConfig;
    }

    // =============================================================================
    // NEW: Individual Challenge Loading
    // =============================================================================

    async loadIndividualChallenge(challengeId) {
        try {
            // Check cache first
            if (this.challengeCache.has(challengeId)) {
                console.log(`✅ Using cached challenge data for: ${challengeId}`);
                return this.challengeCache.get(challengeId);
            }
            // 🔇 SUPPRESS: Only log for available challenges
            const isComingSoon = this.isComingSoonChallenge(challengeId);
            if (!isComingSoon) {
                console.log(`🔄 Loading individual challenge: ${challengeId}`);
        }
            
            // Load challenge-specific JSON file
            const challengeResponse = await fetch(`assets/data/scenarios/${challengeId}/${challengeId}.json`);
            if (!challengeResponse.ok) {
                throw new Error(`Challenge file not found: ${challengeResponse.status}`);
            }
            const challengeData = await challengeResponse.json();
            
            console.log(`✅ Loaded challenge '${challengeId}':`, {
                title: challengeData.title,
                difficulty: challengeData.difficulty,
                hints: challengeData.progressiveHints?.length || 0,
                walkthrough: challengeData.walkthrough ? 'available' : 'missing'
            });

            // Cache the challenge data
            this.challengeCache.set(challengeId, challengeData);
            return challengeData;
            
        } catch (error) {
            // 🔇 SUPPRESS: Don't log errors for coming-soon challenges
            if (!this.isComingSoonChallenge(challengeId)) {
                console.error(`❌ Failed to load challenge '${challengeId}':`, error);
            }

            // Return fallback challenge data
            return {
                challengeId: challengeId,
                title: "Challenge Not Found",
                difficulty: "beginner",
                estimatedTime: "Unknown",
                xpReward: 0,
                description: "This challenge is not yet available.",
                progressiveHints: [
                    {
                        level: 1,
                        title: "💡 Challenge Unavailable",
                        content: "This challenge hasn't been implemented yet. Check back soon!",
                        example: "// Challenge coming soon"
                    }
                ],
                walkthrough: null
            };
        }
    }

    // 🔇 NEW: Helper to check if challenge is coming soon
isComingSoonChallenge(challengeId) {
    try {
        // Check if challenge is marked as coming-soon in scenarios.json
        if (!this.navigationConfig) return false;
        
        for (const platform of Object.values(this.navigationConfig.platforms)) {
            const challenge = platform.challenges?.find(c => c.id === challengeId);
            if (challenge && challenge.status === 'coming-soon') {
                return true;
            }
        }
        return false;
    } catch (error) {
        return false;
    }
}

// 🔇 NEW: Format challenge title from ID
formatChallengeTitle(challengeId) {
    return challengeId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

    // =============================================================================
    // ENHANCED: Scenario Data Loading (Combines Navigation + Challenge Data)
    // =============================================================================

    async loadScenarioData(scenarioId) {
        try {
            console.log(`🔄 Loading complete scenario data for: ${scenarioId}`);
            
            // 1. Load individual challenge data
            const challengeData = await this.loadIndividualChallenge(scenarioId);
            
            // 2. Load CSV data
            const csvResponse = await fetch(`assets/data/scenarios/${scenarioId}/${challengeData.dataFile || 'signin-logs.csv'}`);
            if (!csvResponse.ok) {
                throw new Error(`CSV file not found: ${csvResponse.status}`);
            }
            const csvText = await csvResponse.text();
            console.log('📄 CSV data loaded, length:', csvText.length);
            
            // 3. Load KQL solution
            const kqlResponse = await fetch(`assets/data/scenarios/${scenarioId}/${challengeData.solutionFile || 'solution.kql'}`);
            if (!kqlResponse.ok) {
                throw new Error(`KQL file not found: ${kqlResponse.status}`);
            }
            const kqlText = await kqlResponse.text();
            console.log('📝 KQL solution loaded, length:', kqlText.length);

            // 4. Parse CSV with PapaParse
            const parsedData = Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                delimitersToGuess: [',', '\t', '|', ';']
            });

            console.log('📊 Papa Parse results:');
            console.log('  - Rows:', parsedData.data.length);
            console.log('  - Columns:', parsedData.meta.fields);
            console.log('  - Errors:', parsedData.errors);

            // 5. Create unified scenario data structure
            this.currentScenarioData = {
                // Challenge metadata from individual JSON file
                ...challengeData,
                
                // CSV data
                rows: parsedData.data,
                columns: parsedData.meta.fields.map(field => field.trim()),
                
                // KQL solution
                solution: kqlText.trim(),
                
                // Legacy metadata structure for backward compatibility
                metadata: {
                    title: challengeData.title,
                    platform: challengeData.platform,
                    difficulty: challengeData.difficulty,
                    duration: challengeData.estimatedTime,
                    points: challengeData.xpReward + ' XP',
                    description: challengeData.description,
                    hint: challengeData.progressiveHints?.[0]?.content || "No hint available",
                    tableName: challengeData.tableName || 'SigninLogs',
                    xpReward: challengeData.xpReward
                }
            };

            console.log(`✅ Complete scenario loaded for '${scenarioId}':`, {
                rows: this.currentScenarioData.rows.length,
                columns: this.currentScenarioData.columns.length,
                hints: this.currentScenarioData.progressiveHints?.length || 0,
                walkthrough: this.currentScenarioData.walkthrough ? 'available' : 'missing'
            });

            return this.currentScenarioData;
            
        } catch (error) {
            console.error(`❌ Failed to load scenario data for '${scenarioId}':`, error);
            return null;
        }
    }

    // =============================================================================
    // BACKWARD COMPATIBILITY: Legacy Functions
    // =============================================================================

    async loadScenariosConfig() {
        // Maintain backward compatibility - just load navigation config
        return await this.loadNavigationConfig();
    }

    getCurrentData() {
        return this.currentScenarioData;
    }

    getScenarioMetadata(scenarioId) {
        // Try to get from current loaded scenario first
        if (this.currentScenarioData && this.currentScenarioData.challengeId === scenarioId) {
            return this.currentScenarioData.metadata;
        }
        
        // Fallback to legacy scenarios object (if it exists)
        return this.scenarios[scenarioId] || null;
    }

    // =============================================================================
    // EXISTING: Query Execution Engine (Unchanged)
    // =============================================================================

    generateTableHTML(data, maxRows = 100) {
        if (!data || !data.rows || !data.columns) {
            return '<p>No data available</p>';
        }

        const { rows, columns } = data;
        const displayRows = rows.slice(0, maxRows);

        let html = `
            <table class="logs-table">
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        displayRows.forEach((row, index) => {
            let rowClass = '';
            let ipClass = '';
            
            if (row.ResultType && row.ResultType !== 0 && row.ResultType !== '0') {
                rowClass = 'log-failed';
            } else if (row.ResultType === 0 || row.ResultType === '0') {
                rowClass = 'log-success';
            }
            
            if (row.IPAddress && (row.IPAddress.includes('203.0.113.') || row.IPAddress.includes('198.51.100.'))) {
                rowClass = 'log-spray-ip';
                ipClass = 'suspicious-ip';
            }

            html += `<tr class="${rowClass}">`;
            
            columns.forEach(col => {
                let cellValue = row[col] || '';
                let cellClass = '';
                
                if (col === 'IPAddress' && ipClass) {
                    cellClass = ipClass;
                } else if (col === 'ResultType') {
                    if (cellValue === 0 || cellValue === '0') {
                        cellClass = 'result-type-0';
                        cellValue = 'Success';
                    } else if (cellValue) {
                        cellClass = 'result-type-failed';
                        cellValue = `Failed (${cellValue})`;
                    }
                }
                
                html += `<td class="${cellClass}">${cellValue}</td>`;
            });
            
            html += '</tr>';
        });

        html += `
                </tbody>
            </table>
        `;

        return html;
    }

    executeQuery(queryText, data = null) {
        const dataset = data || this.currentScenarioData;
        if (!dataset || !dataset.rows) {
            console.error('❌ No dataset available for query execution');
            return { success: false, error: 'No data available' };
        }

        console.log('🔍 Executing query on dataset:', {
            rows: dataset.rows.length,
            columns: dataset.columns,
            query: queryText.substring(0, 100) + '...'
        });

        try {
            const results = this.executeBasicKQLQuery(queryText, dataset);
            console.log('✅ Query execution complete. Results:', results.length);
            return { success: true, data: results };
        } catch (error) {
            console.error('❌ Query execution failed:', error);
            return { success: false, error: error.message };
        }
    }

    executeBasicKQLQuery(query, dataset) {
        const { rows } = dataset;
        let processedData = [...rows];

        console.log('🔄 Starting query execution with', processedData.length, 'rows');

        const lines = query.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('//'));

        const queryText = lines.join(' ').toLowerCase();
        console.log('📝 Normalized query:', queryText);

        // Basic where filtering
        if (queryText.includes('where')) {
            console.log('🔍 Processing WHERE clauses...');
            const whereMatches = queryText.match(/where\s+(.+?)(?:\s*\||$)/g);
            if (whereMatches) {
                whereMatches.forEach((whereClause, index) => {
                    const condition = whereClause.replace('where', '').trim();
                    console.log(`  WHERE clause ${index + 1}:`, condition);
                    
                    if (condition.includes('resulttype != 0')) {
                        const beforeCount = processedData.length;
                        processedData = processedData.filter(row => {
                            const isNonZero = row.ResultType && row.ResultType !== 0 && row.ResultType !== '0';
                            return isNonZero;
                        });
                        console.log(`  Filtered ResultType != 0: ${beforeCount} → ${processedData.length}`);
                    }
                });
            }
        }

        // Basic summarize operation
        if (queryText.includes('summarize')) {
            console.log('🔄 Processing SUMMARIZE...');
            const summarizeMatch = queryText.match(/summarize\s+(.+?)(?:\s+by\s+(.+?))?(?:\s*\||$)/);
            if (summarizeMatch) {
                const groupByField = summarizeMatch[2] ? summarizeMatch[2].trim() : null;
                console.log('  Group by field:', groupByField);
                
                if (groupByField && (groupByField.includes('ipaddress') || groupByField.includes('location'))) {
                    // Password spray analysis (group by IP)
                    console.log('🔄 Grouping by IP address...');
                    const grouped = {};
                    processedData.forEach(row => {
                        const ip = row.IPAddress;
                        if (!grouped[ip]) {
                            grouped[ip] = {
                                IPAddress: ip,
                                Location: row.Location || 'Unknown',
                                UniqueUsers: new Set(),
                                FailedAttempts: 0,
                                TargetedUsers: [],
                                FirstAttempt: row.TimeGenerated,
                                LastAttempt: row.TimeGenerated
                            };
                        }
                        grouped[ip].UniqueUsers.add(row.UserPrincipalName);
                        grouped[ip].TargetedUsers.push(row.UserPrincipalName);
                        grouped[ip].FailedAttempts++;
                        
                        if (row.TimeGenerated < grouped[ip].FirstAttempt) {
                            grouped[ip].FirstAttempt = row.TimeGenerated;
                        }
                        if (row.TimeGenerated > grouped[ip].LastAttempt) {
                            grouped[ip].LastAttempt = row.TimeGenerated;
                        }
                    });

                    processedData = Object.values(grouped).map(group => ({
                        IPAddress: group.IPAddress,
                        Location: group.Location,
                        UniqueUsers: group.UniqueUsers.size,
                        FailedAttempts: group.FailedAttempts,
                        AverageAttemptsPerUser: Math.round((group.FailedAttempts / group.UniqueUsers.size) * 10) / 10,
                        FirstAttempt: group.FirstAttempt,
                        LastAttempt: group.LastAttempt,
                        TargetedUsers: [...new Set(group.TargetedUsers)].slice(0, 5)
                    }));
                    
                } else if (groupByField && groupByField.includes('userprincipalname')) {
                    // Brute force analysis (group by user)
                    console.log('🔄 Grouping by User...');
                    const grouped = {};
                    processedData.forEach(row => {
                        const user = row.UserPrincipalName;
                        if (!grouped[user]) {
                            grouped[user] = {
                                UserPrincipalName: user,
                                FailedAttempts: 0,
                                SourceIPs: new Set(),
                                FirstAttempt: row.TimeGenerated,
                                LastAttempt: row.TimeGenerated
                            };
                        }
                        grouped[user].FailedAttempts++;
                        grouped[user].SourceIPs.add(row.IPAddress);
                        
                        if (row.TimeGenerated < grouped[user].FirstAttempt) {
                            grouped[user].FirstAttempt = row.TimeGenerated;
                        }
                        if (row.TimeGenerated > grouped[user].LastAttempt) {
                            grouped[user].LastAttempt = row.TimeGenerated;
                        }
                    });

                    processedData = Object.values(grouped).map(group => ({
                        UserPrincipalName: group.UserPrincipalName,
                        FailedAttempts: group.FailedAttempts,
                        UniqueIPs: group.SourceIPs.size,
                        SourceIPs: [...group.SourceIPs].slice(0, 5),
                        FirstAttempt: group.FirstAttempt,
                        LastAttempt: group.LastAttempt,
                        AttackDuration: group.LastAttempt + ' - ' + group.FirstAttempt
                    }));
                }
                
                console.log('📊 After summarize:', processedData.length, 'grouped results');
            }
        }

        // Basic where filtering after summarize (for thresholds)
        if (queryText.includes('uniqueusers >= 5')) {
            console.log('🔍 Filtering UniqueUsers >= 5...');
            const beforeCount = processedData.length;
            processedData = processedData.filter(row => row.UniqueUsers >= 5);
            console.log(`  Threshold filter: ${beforeCount} → ${processedData.length}`);
        }

        if (queryText.includes('failedattempts >= 10')) {
            console.log('🔍 Filtering FailedAttempts >= 10...');
            const beforeCount = processedData.length;
            processedData = processedData.filter(row => row.FailedAttempts >= 10);
            console.log(`  Threshold filter: ${beforeCount} → ${processedData.length}`);
        }

        // Basic ordering
        if (queryText.includes('order by')) {
            console.log('🔄 Processing ORDER BY...');
            const orderMatch = queryText.match(/order by\s+(\w+)(?:\s+(desc|asc))?/);
            if (orderMatch) {
                const field = orderMatch[1];
                const direction = orderMatch[2] || 'asc';
                console.log(`  Ordering by ${field} ${direction}`);
                
                processedData.sort((a, b) => {
                    const aVal = a[field] || 0;
                    const bVal = b[field] || 0;
                    return direction === 'desc' ? bVal - aVal : aVal - bVal;
                });
            }
        }

        console.log('✅ Final query result:', processedData.length, 'rows');
        if (processedData.length > 0) {
            console.log('📊 Sample result:', processedData[0]);
        }

        return processedData;
    }

    validateQuery(userQuery, scenarioId) {
        console.log('🔍 Validating query for scenario:', scenarioId);
        
        if (!this.currentScenarioData) {
            console.error('❌ No scenario data available for validation');
            return { valid: false, message: 'No scenario data available' };
        }

        const userResults = this.executeQuery(userQuery);
        if (!userResults.success) {
            console.error('❌ User query execution failed');
            return { valid: false, message: 'Query execution failed: ' + userResults.error };
        }

        console.log('📊 User query results:', userResults.data.length, 'rows');

        const userResultsData = userResults.data;
        const expectedResults = this.currentScenarioData.expectedResults;

        if (!expectedResults) {
            return { valid: true, message: 'Query executed successfully!' };
        }

        console.log('📋 Expected criteria:', expectedResults);

        if (userResultsData.length >= (expectedResults.minRows || 1)) {
            console.log('✅ Query validation successful!');
            return { 
                valid: true, 
                message: 'Query executed successfully!',
                results: userResultsData
            };
        } else {
            console.log('❌ Query validation failed - insufficient results');
            return { 
                valid: false, 
                message: `Expected at least ${expectedResults.minRows || 1} results, got ${userResultsData.length}` 
            };
        }
    }
}

// Initialize global data loader
window.dataLoader = new DataLoader();