const fs = require("fs/promises");
const path = require("path");

module.exports = {
    name: "profile",
    aliases: ["prof", "profil"],
    description: "Get profile information",
    category: "info",
    permissions: [],
    async execute(ctx, config) {
        const [userPremium] = await Promise.all([
            config.db.get(`user.${ctx.from.sender}.premium`)
        ]);

        try {
            const caption = `👤 Profile:\n` +
                `> Sender: ${ctx.from.sender}\n` +
                `> Premium: ${userPremium ? "Premium" : "Freemium"}`;

            return [caption];
        } catch (error) {
            console.error("Kesalahan:", error);
            return [`Error occurred: ${error.message}`];
        }
    }
};