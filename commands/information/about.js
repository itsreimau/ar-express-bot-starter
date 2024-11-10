module.exports = {
    name: "about",
    aliases: ["info"],
    description: "About bot",
    category: "information",
    permissions: [],
    execute: async (ctx, config, tools) => {
        return ["This starter template for the WhatsApp bot is based on the AutoResponder Web Server using Express."];
    }
};