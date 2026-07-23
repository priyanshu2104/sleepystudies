const fs = require("fs");
const { decryptPDF } = require("@pdfsmaller/pdf-decrypt");
const { execSync } = require("child_process");
const path = require("path");

async function getDecryptedPdfBytes(pdfPath, password = "SleepyStudiesSecurityPass2026") {
    const rawBuffer = fs.readFileSync(pdfPath);

    // 1. Try pure JavaScript Web Crypto PDF decryption (zero native binary dependencies)
    try {
        const decryptedUint8Array = await decryptPDF(new Uint8Array(rawBuffer), password);
        if (decryptedUint8Array && decryptedUint8Array.length > 100) {
            return Buffer.from(decryptedUint8Array);
        }
    } catch (err) {
        // Continue to fallbacks if JS decryption encounters unusual PDF features
    }

    // 2. Try pdftocairo (Native Poppler binary fallback)
    try {
        const tempDir = path.join(__dirname, "..", "temp_uploads");
        fs.mkdirSync(tempDir, { recursive: true });
        const tempOut = path.join(tempDir, `dec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.pdf`);
        
        execSync(`pdftocairo -upw "${password}" -pdf "${pdfPath}" "${tempOut}"`, { timeout: 25000 });
        
        if (fs.existsSync(tempOut)) {
            const bytes = fs.readFileSync(tempOut);
            try { fs.unlinkSync(tempOut); } catch (e) {}
            if (bytes && bytes.length > 100) {
                return bytes;
            }
        }
    } catch (err) {}

    // Fallback: raw buffer
    return rawBuffer;
}

module.exports = { getDecryptedPdfBytes };
