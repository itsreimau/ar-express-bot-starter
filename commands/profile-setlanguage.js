const fs = require("fs/promises");
const path = require("path");

module.exports = {
    name: "setlanguage",
    aliases: ["setlang"],
    description: {
        en: "Set language",
        id: "Mengatur bahasa"
    },
    category: "profile",
    permissions: ["private"],
    async execute(ctx, config, tools) {
        const [userLanguage] = await Promise.all([
            config.db.get(`user.${ctx.from.sender}.language`)
        ]);
        const {
            text
        } = ctx.input;

        if (!text) {
            return [await tools.msg.getText("command.setlanguage.argument", userLanguage)];
        }

        let languages;
        try {
            const files = await fs.readdir(path.join(__dirname, '../assets/language/'));
            languages = files.map(file => file.replace('.json', ''));
        } catch (error) {
            console.error("Error:", error);
            return [await tools.msg.getText("general.error", userLanguage, {
                error_message: error.message
            })];
        }

        if (text === "list") {
            const format = languages.map(lang => `- ${lang}`).join('\n');
            return [format];
        }
        if (!languages.includes(text)) {
            return [await tools.msg.getText("command.setlanguage.invalid", userLanguage)];
        }

        try {
            await config.db.set(`user.${ctx.from.sender}.language`, text);
            return [await tools.msg.getText("command.setlanguage.success", text)];
        } catch (error) {
            console.error("Error:", error);
            return [await tools.msg.getText("general.error", userLanguage, {
                error_message: error.message
            })];
        }
    }
};