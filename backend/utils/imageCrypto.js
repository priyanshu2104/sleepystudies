const crypto = require("crypto");
const fs = require("fs");

const ALGORITHM = "aes-256-cbc";
const PASSWORD = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";
const KEY = crypto.createHash("sha256").update(PASSWORD).digest();
const IV = crypto.createHash("md5").update(PASSWORD).digest();

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function encryptImageBuffer(buffer) {
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_HEADER)) {
        // Only encrypt if it starts with raw PNG header
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
        return Buffer.concat([cipher.update(buffer), cipher.final()]);
    }
    return buffer;
}

function decryptImageBuffer(buffer) {
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_HEADER)) {
        // Already raw unencrypted PNG
        return buffer;
    }
    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
        const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);
        if (decrypted.length >= 8 && decrypted.subarray(0, 8).equals(PNG_HEADER)) {
            return decrypted;
        }
    } catch (e) {}
    return buffer;
}

module.exports = {
    encryptImageBuffer,
    decryptImageBuffer
};
