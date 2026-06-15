const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Currency pairs to fetch from Google Finance
const CURRENCY_PAIRS = [
    { from: 'IDR', to: 'USD', symbol: 'IDR-USD' },
    { from: 'EUR', to: 'USD', symbol: 'EUR-USD' },
    { from: 'GBP', to: 'USD', symbol: 'GBP-USD' },
    { from: 'JPY', to: 'USD', symbol: 'JPY-USD' },
    { from: 'SGD', to: 'USD', symbol: 'SGD-USD' },
    { from: 'AUD', to: 'USD', symbol: 'AUD-USD' },
    { from: 'MYR', to: 'USD', symbol: 'MYR-USD' },
    { from: 'CNY', to: 'USD', symbol: 'CNY-USD' },
    { from: 'THB', to: 'USD', symbol: 'THB-USD' },
    { from: 'KRW', to: 'USD', symbol: 'KRW-USD' },
    { from: 'INR', to: 'USD', symbol: 'INR-USD' },
    { from: 'PHP', to: 'USD', symbol: 'PHP-USD' },
    { from: 'HKD', to: 'USD', symbol: 'HKD-USD' },
    { from: 'VND', to: 'USD', symbol: 'VND-USD' },
];

// Fetch rate from Google Finance (following redirects)
function fetchRate(pair) {
    return new Promise((resolve, reject) => {
        fetchWithRedirect(`/finance/quote/${pair.symbol}`, 0)
            .then(data => {
                let rate = null;
                
                // For IDR - get the full rate from "trading at Rp17,675"
                if (pair.from === 'IDR') {
                    const rpMatch = data.match(/trading at Rp([\d,]+)/);
                    if (rpMatch) {
                        rate = parseFloat(rpMatch[1].replace(/,/g, ''));
                    }
                } else {
                    // For other currencies - get USD per unit rate
                    const headerMatch = data.match(/class="N6SYTe"[^>]*>[^<]*<[^>]*><span>([\d.]+)<\/span>/);
                    if (headerMatch) {
                        rate = parseFloat(headerMatch[1]);
                    }
                }
                
                console.log(`  ${pair.from}: ${rate}`);
                resolve({ pair: `${pair.from}-${pair.to}`, rate });
            })
            .catch(err => {
                console.error(`  Error: ${err.message}`);
                resolve({ pair: `${pair.from}-${pair.to}`, rate: null });
            });
    });
}

// Helper function to follow redirects
function fetchWithRedirect(path, redirects) {
    return new Promise((resolve, reject) => {
        if (redirects > 5) {
            reject(new Error('Too many redirects'));
            return;
        }
        
        const options = {
            hostname: 'www.google.com',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        };

        const req = https.request(options, (res) => {
            // Follow redirects
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307 || res.statusCode === 308) {
                const location = res.headers.location;
                if (location) {
                    console.log(`  Redirecting to: ${location}`);
                    fetchWithRedirect(location, redirects + 1).then(resolve).catch(reject);
                    return;
                }
            }
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.end();
    });
}

// Cache for rates
let cachedRates = null;
let lastFetch = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Fetch all rates
async function fetchAllRates() {
    const now = Date.now();
    
    // Return cached data if still valid
    if (cachedRates && (now - lastFetch) < CACHE_DURATION) {
        return cachedRates;
    }
    
    const results = { USD: 1 };
    
    for (const pair of CURRENCY_PAIRS) {
        try {
            const result = await fetchRate(pair);
            if (result.rate) {
                // Store as USD per currency unit
                results[pair.from] = result.rate;
                console.log(`${pair.from}/USD: ${result.rate}`);
            }
        } catch (e) {
            console.error(`Error fetching ${pair.from}: ${e.message}`);
        }
    }
    
    // Update cache
    cachedRates = results;
    lastFetch = now;
    
    return results;
}

// Serve the app
const server = http.createServer(async (req, res) => {
    if (req.url === '/api/rates') {
        // API endpoint for rates
        try {
            const rates = await fetchAllRates();
            // rates contains: currency -> USD per 1 unit of currency
            // e.g., IDR: 17675 means 1 USD = 17,675 IDR
            // We need to convert to IDR per 1 unit of currency
            // e.g., IDR: 1, USD: 17675, EUR: 17675/1.1598 = 15238
            
            const idrPerUsd = rates.IDR; // 1 USD = 17,675 IDR
            const idrRates = { IDR: 1 };
            
            for (const [currency, usdPerUnit] of Object.entries(rates)) {
                if (currency === 'IDR') continue;
                if (usdPerUnit) {
                    // How many IDR per 1 unit of this currency
                    // If 1 USD = 17,675 IDR and 1 EUR = 1.16 USD
                    // Then 1 EUR = 1.16 * 17,675 = 20,503 IDR
                    idrRates[currency] = idrPerUsd / usdPerUnit;
                }
            }
            
            res.writeHead(200, { 
                'Content-Type': 'application/json', 
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            });
            res.end(JSON.stringify({ 
                rates: idrRates, 
                timestamp: new Date().toISOString(),
                source: 'Google Finance'
            }));
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
    } else {
        // Serve HTML file
        const htmlPath = path.join(__dirname, 'index.html');
        fs.readFile(htmlPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/rates\n`);
});
