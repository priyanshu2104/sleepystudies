const { execSync } = require("child_process");
const fs = require("fs");

function getDecryptedPdfBytes(pdfPath, password = "SleepyStudiesSecurityPass2026") {
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
for page in reader.pages:
    writer.add_page(page)
out = io.BytesIO()
writer.write(out)
sys.stdout.buffer.write(out.getvalue())`;

        const buffer = execSync(`python3 -c "${pyCmd.replace(/"/g, '\\"')}"`, {
            maxBuffer: 100 * 1024 * 1024, // 100MB max buffer
        });

        if (buffer && buffer.length > 100) {
            return buffer;
        }
    } catch (err) {
        console.error("Python pdf decryption failed:", err.message);
    }

    try {
        const qpdfBuffer = execSync(`qpdf --decrypt --password="${password}" "${pdfPath}" -`, {
            maxBuffer: 100 * 1024 * 1024,
        });
        if (qpdfBuffer && qpdfBuffer.length > 100) {
            return qpdfBuffer;
        }
    } catch (err) {}

    return fs.readFileSync(pdfPath);
}

module.exports = { getDecryptedPdfBytes };
