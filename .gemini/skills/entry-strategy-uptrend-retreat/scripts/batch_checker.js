const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');
const execPromise = util.promisify(exec);

// Skill script paths
const watchlistReader = path.join('.gemini', 'skills', 'watchlist-reader', 'scripts', 'read_watchlist.js');
const priceChecker = path.join('.gemini', 'skills', 'stock-price-checker', 'scripts', 'get_stock_info.js');
const perfChecker = path.join('.gemini', 'skills', 'stock-performance-checker', 'scripts', 'get_performance.js');
const maChecker = path.join('.gemini', 'skills', 'stock-moving-average-checker', 'scripts', 'get_dma.js');
const rsiChecker = path.join('.gemini', 'skills', 'stock-rsi-checker', 'scripts', 'get_rsi.js');

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
    console.log("--- Executing Uptrend Retreat Strategy ---");
    
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
            } catch(e) {}
        }
    }
    const symbols = Array.from(symbolsSet);
    console.log(`Step 1: Loaded ${symbols.length} unique symbols.`);

    // Step 2: Long-term Uptrend Validation (50DMA > 200DMA)
    console.log("Step 2: Validating long-term uptrend (50DMA > 200DMA)...");
    const trendResults = await Promise.all(symbols.map(async (s) => {
        const out50 = await runSkill(maChecker, `${s} 50`);
        const out200 = await runSkill(maChecker, `${s} 200`);
        return { symbol: s, out50, out200 };
    }));

    let step2List = [];
    trendResults.forEach(({ symbol, out50, out200 }) => {
        if (out50 && out200) {
            const m50 = parseFloat(out50.match(/Moving Average \(50DMA\): ([\d.]+)/)[1]);
            const m200 = parseFloat(out200.match(/Moving Average \(200DMA\): ([\d.]+)/)[1]);
            if (m50 > m200) {
                step2List.push({ symbol, m50, m200 });
            }
        }
    });
    console.log(`Step 2: ${step2List.length} stocks are in a long-term uptrend.`);

    // Step 3: Short-term Pullback (Current Price near 20DMA or 50DMA, and RSI < 50)
    console.log("Step 3: Identifying short-term pullback (Near MA support and moderate RSI)...");
    let finalResults = [];
    const pullbackResults = await Promise.all(step2List.map(async (item) => {
        const outPrice = await runSkill(priceChecker, item.symbol);
        const out20 = await runSkill(maChecker, `${item.symbol} 20`);
        const outRsi = await runSkill(rsiChecker, item.symbol);
        return { ...item, outPrice, out20, outRsi };
    }));

    pullbackResults.forEach(({ symbol, m50, m200, outPrice, out20, outRsi }) => {
        if (outPrice && out20 && outRsi) {
            const price = parseFloat(outPrice.match(/Price: ([\d.]+) /)[1]);
            const m20 = parseFloat(out20.match(/Moving Average \(20DMA\): ([\d.]+)/)[1]);
            const rsi = parseFloat(outRsi.match(/5-Day RSI: ([\d.]+)/)[1]);

            // Price within 2% of 20DMA or 50DMA
            const near20 = Math.abs(price - m20) / m20 < 0.02;
            const near50 = Math.abs(price - m50) / m50 < 0.02;
            
            if ((near20 || near50) && rsi < 50) {
                finalResults.push({ symbol, price, rsi, m20, m50, m200 });
            }
        }
    });

    console.log(`\n--- Final Uptrend Retreat Candidates (${finalResults.length}) ---`);
    if (finalResults.length === 0) {
        console.log("No stocks currently meet the uptrend retreat criteria.");
    } else {
        finalResults.forEach(res => {
            console.log(`Symbol: ${res.symbol}`);
            console.log(`  Price: ${res.price.toFixed(2)} (Near Support)`);
            console.log(`  RSI: ${res.rsi.toFixed(2)}`);
            console.log(`  MAs: 20d=${res.m20.toFixed(2)}, 50d=${res.m50.toFixed(2)}, 200d=${res.m200.toFixed(2)}`);
            console.log('---------------------------');
        });
    }

    if (errorLogs.length > 0) {
        console.log("\n--- Error Logs ---");
        errorLogs.forEach(log => console.log(log));
    }
}

runStrategy();
