function formatNoteTitle(filename) {
    let raw = filename.replace(/\.pdf$/i, "");

    let campusSuffix = "";
    if (/-jaipur$/i.test(raw)) {
        raw = raw.replace(/-jaipur$/i, "");
        campusSuffix = " (Jaipur)";
    } else if (/-mesra$/i.test(raw)) {
        raw = raw.replace(/-mesra$/i, "");
        campusSuffix = " (Mesra)";
    }

    const formatted = raw
        .replace(/-/g, " ")
        .split(" ")
        .map(word => {
            const upper = word.toUpperCase();
            if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)$/i.test(word)) {
                return upper;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");

    return formatted + campusSuffix;
}

module.exports = { formatNoteTitle };
