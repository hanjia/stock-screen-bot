const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');
const execPromise = util.promisify(exec);

// Skill script paths
const watchlistReader = path.join('.gemini', 'skills', 'watchlist-reader', 'scripts', 'read_watchlist.js');
const priceChecker = path.join('.gemini', 'skills', 'stock-price-checker', 'scripts', 'get_stock_info.js');
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
    console.log("--- Executing Overpriced Short Strategy ---");
    
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

    // Step 2: Overbought RSI Check (RSI > 70)
    console.log("Step 2: Checking for overbought RSI (5-day RSI > 70)...");
    const rsiResults = await Promise.all(symbols.map(async (s) => {
        const outRsi = await runSkill(rsiChecker, s);
        return { symbol: s, outRsi };
    }));

    let step2List = [];
    rsiResults.forEach(({ symbol, outRsi }) => {
        if (outRsi) {
            const match = outRsi.match(/5-Day RSI: ([\d.]+)/);
            if (match) {
                const rsi = parseFloat(match[1]);
                if (rsi > 70) {
                    step2List.push({ symbol, rsi });
                }
            }
        }
    });
    console.log(`Step 2: ${step2List.length} stocks are overbought (RSI > 70).`);

    // Step 3: Price Extension Check (Price > 10% above 20DMA or 50DMA)
    console.log("Step 3: Checking for price extension above moving averages...");
    let finalResults = [];
    const extensionResults = await Promise.all(step2List.map(async (item) => {
        const outPrice = await runSkill(priceChecker, item.symbol);
        const out20 = await runSkill(maChecker, `${item.symbol} 20`);
        const out50 = await runSkill(maChecker, `${item.symbol} 50`);
        return { ...item, outPrice, out20, out50 };
    }));

    extensionResults.forEach(({ symbol, rsi, outPrice, out20, out50 }) => {
        if (outPrice && out20 && out50) {
            const price = parseFloat(outPrice.match(/Price: ([\d.]+) /)[1]);
            const m20 = parseFloat(out20.match(/Moving Average \(20DMA\): ([\d.]+)/)[1]);
            const m50 = parseFloat(out50.match(/Moving Average \(50DMA\): ([\d.]+)/)[1]);

            // Price extended > 10% above 20DMA or > 15% above 50DMA
            const ext20 = (price - m20) / m20 > 0.10;
            const ext50 = (price - m50) / m50 > 0.15;
            
            if (ext20 || ext50) {
                finalResults.push({ symbol, price, rsi, m20, m50, ext20: ((price-m20)/m20*100), ext50: ((price-m50)/m50*100) });
            }
        }
    });

    console.log(`\n--- Final Overpriced Short Candidates (${finalResults.length}) ---`);
    if (finalResults.length === 0) {
        console.log("No stocks currently meet the overpriced short criteria.");
    } else {
        finalResults.forEach(res => {
            console.log(`Symbol: ${res.symbol}`);
            console.log(`  Price: ${res.price.toFixed(2)} (Extended)`);
            console.log(`  5-Day RSI: ${res.rsi.toFixed(2)}`);
            console.log(`  Extension: Above 20DMA: ${res.ext20.toFixed(2)}%, Above 50DMA: ${res.ext50.toFixed(2)}%`);
            console.log('---------------------------');
        });
    }

    if (errorLogs.length > 0) {
        console.log("\n--- Error Logs ---");
        errorLogs.forEach(log => console.log(log));
    }
}

runStrategy();
