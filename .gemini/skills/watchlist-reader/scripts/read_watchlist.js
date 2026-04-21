const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];

if (!filePath) {
    console.error('Error: No file path provided.');
    process.exit(1);
}

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
        process.stdout.write('[]');
        process.exit(0);
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const symbolIndex = headers.indexOf('Symbol');

    if (symbolIndex === -1) {
        console.error('Error: "Symbol" column not found.');
        process.exit(1);
    }

    const symbols = lines.slice(1).map(line => {
        const columns = line.split(',');
        return columns[symbolIndex] ? columns[symbolIndex].trim() : null;
    }).filter(s => s !== null);

    process.stdout.write(JSON.stringify(symbols));
} catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
}
