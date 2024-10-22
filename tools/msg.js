const fs = require("fs/promises");
const path = require("path");

async function getText(key, lc, replacements = {}) {
    try {
        const filePath = path.join(__dirname, `../assets/language/${lc}.json`);
        const fileContent = await fs.readFile(filePath, "utf8");
        const lang = JSON.parse(fileContent);

        const keys = key.split(".");
        let text = lang;
        for (const k of keys) {
            text = text[k];
            if (!text) return null;
        }

        if (typeof text === "string") {
            return text.replace(/%(\w+)%/g, (_, variable) => replacements[variable] || `%${variable}%`);
        }

        return null;
    } catch (error) {
        console.error("[ar-express-bot-starter] Kesalahan:", error);
    }
}

module.exports = {
    getText
};