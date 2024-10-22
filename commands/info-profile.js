const fs = require("fs/promises");
const path = require("path");

module.exports = {
    name: "profile",
    aliases: ["prof", "profil"],
    description: {
        en: "Get profile information",
        id: "Dapatkan informasi profil"
    },
    category: "info",
    permissions: [],
    async execute(ctx, config, tools) {
        const [userLanguage, userPremium] = await Promise.all([
            config.db.get(`user.${ctx.from.sender}.language`),
            config.db.get(`user.${ctx.from.sender}.premium`)
        ]);

        try {
            const caption = await tools.msg.getText("command.profile.caption", userLanguage, {
                sender: ctx.from.sender,
                language: userLanguage,
                premium: userPremium
            })
            return await [caption]
        } catch (error) {
            console.error("[ar-express-bot-starter] Kesalahan:", error);
            return [await tools.msg.getText("general.error", userLanguage, {
                error_message: error.message
            })];
        }
    }
};