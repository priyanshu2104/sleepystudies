const fs = require("fs");
const path = require("path");

function readJSON(file) {
    const filePath = path.join(__dirname, "..", "data", file);
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]");
    }

    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(file, data) {
    const filePath = path.join(__dirname, "..", "data", file);
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2)
    );
}

module.exports = {
    readJSON,
    writeJSON,
};