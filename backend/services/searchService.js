const fs = require("fs-extra");
const path = require("path");
const { formatNoteTitle } = require("../utils/titleHelper");

const PDF_ROOT = path.join(__dirname, "..", "pdfs");

function searchNotes(query) {
    const keyword = query.toLowerCase();
    const results = [];

    if (!fs.existsSync(PDF_ROOT)) return [];

    const semesters = fs.readdirSync(PDF_ROOT);

    semesters.forEach(semester => {
        const semPath = path.join(PDF_ROOT, semester);
        if (!fs.statSync(semPath).isDirectory()) return;

        const subjects = fs.readdirSync(semPath);

        subjects.forEach(subject => {
            const folder = path.join(semPath, subject);
            if (!fs.statSync(folder).isDirectory()) return;

            const files = fs.readdirSync(folder);

            files.forEach(file => {
                if (!file.endsWith(".pdf")) return;

                const noteSlug = file.replace(".pdf", "");
                const title = formatNoteTitle(file);

                if (
                    title.toLowerCase().includes(keyword) ||
                    subject.toLowerCase().includes(keyword)
                ) {
                    const imageDir = path.join(PDF_ROOT, "..", "images", semester, subject, noteSlug);
                    let thumbnail = null;
                    if (fs.existsSync(imageDir)) {
                        const imgFiles = fs.readdirSync(imageDir)
                            .filter(f => f.endsWith(".png"))
                            .sort();
                        if (imgFiles.length > 0) {
                            thumbnail = `http://localhost:5001/images/${semester}/${subject}/${noteSlug}/${imgFiles[0]}`;
                        }
                    }

                    results.push({
                        title,
                        file,
                        subject,
                        semester,
                        thumbnail
                    });
                }
            });
        });
    });

    return results;
}

module.exports = {

    searchNotes,

};