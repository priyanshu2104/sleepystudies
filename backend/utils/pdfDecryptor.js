const fs = require("fs");
const { decryptPDF } = require("@pdfsmaller/pdf-decrypt");
const { execSync } = require("child_process");
const path = require("path");

const decryptionCache = new Map();
const MAX_CACHE_ITEMS = 30; // Limit RAM usage

async function getDecryptedPdfBytes(pdfPath, password = "SleepyStudiesSecurityPass2026") {
    let stat;
    try {
        stat = fs.statSync(pdfPath);
    } catch (e) {
        return fs.readFileSync(pdfPath);
    }

    const cacheKey = `${pdfPath}:${stat.mtimeMs}`;
    if (decryptionCache.has(cacheKey)) {
        return decryptionCache.get(cacheKey);
    }

    const rawBuffer = fs.readFileSync(pdfPath);
    let decryptedBytes = null;

    // 1. Try pure JavaScript Web Crypto PDF decryption (zero native binary dependencies)
    try {
        const decryptedUint8Array = await decryptPDF(new Uint8Array(rawBuffer), password);
        if (decryptedUint8Array && decryptedUint8Array.length > 100) {
            decryptedBytes = Buffer.from(decryptedUint8Array);
        }
    } catch (err) {}

    // 2. Try pdftocairo (Native Poppler binary fallback)
    if (!decryptedBytes) {
        try {
            const tempDir = path.join(__dirname, "..", "temp_uploads");
            fs.mkdirSync(tempDir, { recursive: true });
            const tempOut = path.join(tempDir, `dec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.pdf`);
            
            execSync(`pdftocairo -upw "${password}" -pdf "${pdfPath}" "${tempOut}"`, { timeout: 25000 });
            
            if (fs.existsSync(tempOut)) {
                const bytes = fs.readFileSync(tempOut);
                try { fs.unlinkSync(tempOut); } catch (e) {}
                if (bytes && bytes.length > 100) {
                    decryptedBytes = bytes;
                }
            }
        } catch (err) {}
    }

    if (!decryptedBytes) {
        decryptedBytes = rawBuffer;
    }

    // Store in cache (LRU eviction if limit reached)
    if (decryptionCache.size >= MAX_CACHE_ITEMS) {
        const firstKey = decryptionCache.keys().next().value;
        decryptionCache.delete(firstKey);
    }
    decryptionCache.set(cacheKey, decryptedBytes);

    return decryptedBytes;
}

module.exports = { getDecryptedPdfBytes };
