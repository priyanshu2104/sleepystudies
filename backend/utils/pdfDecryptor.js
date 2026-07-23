const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getDecryptedPdfBytes(pdfPath, password = "SleepyStudiesSecurityPass2026") {
    // 1. Try pdftocairo (Native Poppler C++ binary on Linux/Render)
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
    } catch (err) {
        console.error("pdftocairo decryption failed, trying fallbacks:", err.message);
    }

    // 2. Try qpdf
    try {
        const qpdfBuffer = execSync(`qpdf --decrypt --password="${password}" "${pdfPath}" -`, {
            maxBuffer: 100 * 1024 * 1024,
            timeout: 25000
        });
        if (qpdfBuffer && qpdfBuffer.length > 100) {
            return qpdfBuffer;
        }
    } catch (err) {}

    // 3. Try Python pypdf with fast writer.append
    try {
        const pyCmd = `import sys, io
from pypdf import PdfReader, PdfWriter
reader = PdfReader(r'''${pdfPath}''')
if reader.is_encrypted:
    try:
        reader.decrypt('''${password}''')
    except Exception:
        pass
writer = PdfWriter()
writer.append(reader)
out = io.BytesIO()
writer.write(out)
sys.stdout.buffer.write(out.getvalue())`;

        const buffer = execSync(`python3 -c "${pyCmd.replace(/"/g, '\\"')}"`, {
            maxBuffer: 100 * 1024 * 1024,
            timeout: 25000
        });

        if (buffer && buffer.length > 100) {
            return buffer;
        }
    } catch (err) {
        console.error("Python pypdf decryption error:", err.message);
    }

    // Fallback: direct read
    return fs.readFileSync(pdfPath);
}

module.exports = { getDecryptedPdfBytes };
