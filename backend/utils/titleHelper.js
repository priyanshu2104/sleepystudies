function formatNoteTitle(filename) {
    const raw = filename.replace(/\.pdf$/i, "").replace(/-/g, " ");
    return raw
        .split(" ")
        .map(word => {
            const upper = word.toUpperCase();
            // Match Roman numerals (I to XX)
            if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)$/i.test(word)) {
                return upper;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
}

module.exports = { formatNoteTitle };
