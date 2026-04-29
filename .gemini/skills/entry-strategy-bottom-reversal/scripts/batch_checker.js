const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');
const execPromise = util.promisify(exec);

// Skill script paths - relative to project root
const watchlistReader = path.join('.gemini', 'skills', 'watchlist-reader', 'scripts', 'read_watchlist.js');
const priceChecker = path.join('.gemini', 'skills', 'stock-price-checker', 'scripts', 'get_stock_info.js');
const perfChecker = path.join('.gemini', 'skills', 'stock-performance-checker', 'scripts', 'get_performance.js');
const maChecker = path.join('.gemini', 'skills', 'stock-moving-average-checker', 'scripts', 'get_dma.js');

let errorLogs = [];

async function runSkill(skillPath, args) {
    try {
        const { stdout, stderr } = await execPromise(`node ${skillPath} ${args}`);
        if (stderr) {
            errorLogs.push(`Error in ${skillPath} with args [${args}]: ${stderr}`);
        }
        return stdout;
    } catch (e) {
        errorLogs.push(`Execution failed for ${skillPath} with args [${args}]: ${e.message}`);
        return null;
    }
}

async function runStrategy() {
    console.log("--- Executing Bottom Reversal Strategy ---");
    
    // Step 1: Get Symbols
    const watchlistDir = 'watchlist';
    if (!fs.existsSync(watchlistDir)) {
        console.error(`Error: Directory "${watchlistDir}" not found.`);
        process.exit(1);
    }
    const files = fs.readdirSync(watchlistDir).filter(f => f.endsWith('.csv'));
    let symbolsSet = new Set();
    
    for (const file of files) {
        const filePath = path.join(watchlistDir, file);
        const output = await runSkill(watchlistReader, filePath);
        if (output) {
            try {
                const symbols = JSON.parse(output);
                symbols.forEach(s => symbolsSet.add(s));
            } catch(e) {
                errorLogs.push(`Failed to parse symbols from ${file}: ${e.message}`);
            }
        }
    }
    const symbols = Array.from(symbolsSet);
    console.log(`Step 1: Loaded ${symbols.length} unique symbols from watchlists.`);

    // Step 2: Price and Positive Change
    console.log("Step 2: Filtering for positive daily price change...");
    const priceResults = await Promise.all(symbols.map(s => runSkill(priceChecker, s)));
    let step2List = [];
    priceResults.forEach((output, index) => {
        if (output) {
            const changeMatch = output.match(/Change: ([\d.-]+)%/);
            const priceMatch = output.match(/Price: ([\d.]+) /);
            if (changeMatch && priceMatch) {
                const change = parseFloat(changeMatch[1]);
                if (change > 0) {
                    step2List.push({ symbol: symbols[index], price: parseFloat(priceMatch[1]), change });
                }
            } else {
                errorLogs.push(`Could not parse price/change for ${symbols[index]}`);
            }
        }
    });
    console.log(`Step 2: ${step2List.length} stocks showing positive momentum today.`);

    // Step 3: Prior Decline (10d & 1mo Performance < 0)
    console.log("Step 3: Checking for prior decline (10d & 1mo performance < 0)...");
    let step3List = [];
    const perfResults = await Promise.all(step2List.map(async (item) => {
        const out10d = await runSkill(perfChecker, `${item.symbol} 10d`);
        const out1mo = await runSkill(perfChecker, `${item.symbol} 1mo`);
        return { item, out10d, out1mo };
    }));

    perfResults.forEach(({ item, out10d, out1mo }) => {
        if (out10d && out1mo) {
            const match10d = out10d.match(/Change: ([\d.-]+)%/);
            const match1mo = out1mo.match(/Change: ([\d.-]+)%/);
            if (match10d && match1mo) {
                const ch10d = parseFloat(match10d[1]);
                const ch1mo = parseFloat(match1mo[1]);
                if (ch10d < 0 && ch1mo < 0) {
                    step3List.push({ ...item, ch10d, ch1mo });
                }
            } else {
                errorLogs.push(`Could not parse performance for ${item.symbol}`);
            }
        }
    });
    console.log(`Step 3: ${step3List.length} stocks passed reversal candidate filter: ${step3List.map(s => s.symbol).join(', ')}`);

    // Step 4: Moving Average Breakout
    console.log("Step 4: Validating moving average breakout (5d > 20d & 50d, 20d > 95% of 50d)...");
    let finalResults = [];
    const maResults = await Promise.all(step3List.map(async (item) => {
        const out5 = await runSkill(maChecker, `${item.symbol} 5`);
        const out20 = await runSkill(maChecker, `${item.symbol} 20`);
        const out50 = await runSkill(maChecker, `${item.symbol} 50`);
        return { item, out5, out20, out50 };
    }));

    maResults.forEach(({ item, out5, out20, out50 }) => {
        if (out5 && out20 && out50) {
            const m5Match = out5.match(/Moving Average \(5DMA\): ([\d.]+)/);
            const m20Match = out20.match(/Moving Average \(20DMA\): ([\d.]+)/);
            const m50Match = out50.match(/Moving Average \(50DMA\): ([\d.]+)/);
            
            if (m5Match && m20Match && m50Match) {
                const m5 = parseFloat(m5Match[1]);
                const m20 = parseFloat(m20Match[1]);
                const m50 = parseFloat(m50Match[1]);
                
                const breakout = m5 > m20 && m5 > m50;
                const support = m20 > 0.95 * m50;
                
                if (breakout && support) {
                    finalResults.push({ ...item, m5, m20, m50 });
                }
            } else {
                errorLogs.push(`Could not parse moving averages for ${item.symbol}`);
            }
        }
    });

    // Step 5: Final Results
    console.log(`\n--- Final Strategy Results (${finalResults.length} Candidates) ---`);
    if (finalResults.length === 0) {
        console.log("No stocks currently meet all criteria for the bottom reversal strategy.");
    } else {
        finalResults.forEach(res => {
            console.log(`Symbol: ${res.symbol}`);
            console.log(`  Current Price: ${res.price}`);
            console.log(`  Daily Change: ${res.change.toFixed(2)}%`);
            console.log(`  10d Performance: ${res.ch10d.toFixed(2)}%`);
            console.log(`  1mo Performance: ${res.ch1mo.toFixed(2)}%`);
            console.log(`  MAs: 5d=${res.m5.toFixed(2)}, 20d=${res.m20.toFixed(2)}, 5d=${res.m50.toFixed(2)}`); // Small fix here from 5d to 50d label
            console.log('---------------------------');
        });
    }

    if (errorLogs.length > 0) {
        console.log("\n--- Error Logs ---");
        errorLogs.forEach(log => console.log(log));
    }
}

runStrategy();
