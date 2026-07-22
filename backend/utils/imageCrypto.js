const crypto = require("crypto");

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function getKeys(pass) {
    const key = crypto.createHash("sha256").update(pass).digest();
    const iv = crypto.createHash("md5").update(pass).digest();
    return { key, iv };
}

function encryptImageBuffer(buffer) {
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_HEADER)) {
        const pass = process.env.PDF_SECRET_PASSWORD || "SleepyStudiesSecurityPass2026";
        const { key, iv } = getKeys(pass);
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        return Buffer.concat([cipher.update(buffer), cipher.final()]);
    }
    return buffer;
}

function decryptImageBuffer(buffer) {
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_HEADER)) {
        return buffer;
    }

    const passwordsToTry = [
        process.env.PDF_SECRET_PASSWORD,
        "SleepyStudiesSecurityPass2026"
    ].filter(Boolean);

    for (const pass of passwordsToTry) {
        try {
            const { key, iv } = getKeys(pass);
            const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
            const decrypted = Buffer.concat([decipher.update(buffer), decipher.final()]);
            if (decrypted.length >= 8 && decrypted.subarray(0, 8).equals(PNG_HEADER)) {
                return decrypted;
            }
        } catch (e) {}
    }

    return buffer;
}

module.exports = {
    encryptImageBuffer,
    decryptImageBuffer
};
