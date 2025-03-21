const fs = require("node:fs/promises");
const path = require("node:path");

module.exports = {
    name: "profile",
    aliases: ["prof", "profil"],
    description: "Get profile information",
    category: "info",
    permissions: [],
    async execute(ctx, config, tools) {
        const caption =
            `👤 Profile:\n` +
            `> Sender: ${ctx.from.sender}\n` +
            `> Premium: ${ctx.from.isPremium ? "Premium" : "Freemium"}`;

        return [caption];
    }
};