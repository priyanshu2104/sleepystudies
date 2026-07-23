const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { encryptImageBuffer } = require("../utils/imageCrypto");

const PDF_ROOT = path.join(__dirname, "..", "pdfs");
const IMG_ROOT = path.join(__dirname, "..", "images");
const PASSWORD = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";

console.log("🚀 Starting Catalog Processing & Encrypted Image Generation...");

// Step 1: Encrypt all PDFs with 256-bit AES
console.log("\n🔒 Step 1: Running PDF Encryption...");
execSync("python3 backend/scripts/encrypt_pdfs.py", { stdio: "inherit", cwd: path.join(__dirname, "..", "..") });

// Helper to recursively find all files
function getAllFiles(dirPath, arrayOfFiles = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith(".pdf")) {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

const pdfFiles = getAllFiles(PDF_ROOT);
console.log(`\n📚 Step 2: Generating and Encrypting Page Images for ${pdfFiles.length} PDFs...`);

pdfFiles.forEach((pdfPath, index) => {
    const relPath = path.relative(PDF_ROOT, pdfPath);
    const pdfDir = path.dirname(relPath);
    const pdfBaseName = path.basename(relPath, ".pdf");

    const targetImgDir = path.join(IMG_ROOT, pdfDir, pdfBaseName);

    console.log(`\n[${index + 1}/${pdfFiles.length}] Processing: ${relPath}`);

    // Create target dir
    fs.mkdirSync(targetImgDir, { recursive: true });

    // Decrypt to temp file for pdftoppm
    const tempPdf = path.join(targetImgDir, "_temp_clean.pdf");
    try {
        // Try pdftocairo with password
        execSync(`pdftocairo -upw "${PASSWORD}" -pdf "${pdfPath}" "${tempPdf}"`, { stdio: "pipe" });
    } catch (e) {
        // If unencrypted or different pass, try without password
        try {
            execSync(`pdftocairo -pdf "${pdfPath}" "${tempPdf}"`, { stdio: "pipe" });
        } catch (err) {
            console.error(`❌ Failed to decrypt ${relPath} for rendering:`, err.message);
            return;
        }
    }

    // Generate PNGs using pdftoppm
    try {
        const prefix = path.join(targetImgDir, "page");
        execSync(`pdftoppm -png -r 150 "${tempPdf}" "${prefix}"`, { stdio: "pipe" });
    } catch (e) {
        console.error(`❌ pdftoppm failed for ${relPath}:`, e.message);
    } finally {
        if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
    }

    // Encrypt all generated PNG images in targetImgDir
    const generatedImages = fs.readdirSync(targetImgDir).filter(f => f.endsWith(".png"));
    let encryptedCount = 0;

    generatedImages.forEach(imgName => {
        const imgPath = path.join(targetImgDir, imgName);
        const rawBuf = fs.readFileSync(imgPath);
        const encBuf = encryptImageBuffer(rawBuf);
        fs.writeFileSync(imgPath, encBuf);
        encryptedCount++;
    });

    console.log(`   ✅ Created & AES-256 Encrypted ${encryptedCount} page images in images/${pdfDir}/${pdfBaseName}`);
});

console.log("\n✨ Catalog Processing & Image Encryption Complete!");
