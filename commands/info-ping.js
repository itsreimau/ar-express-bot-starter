module.exports = {
    name: "ping",
    aliases: [],
    description: "Check ping",
    category: "info",
    permissions: [],
    execute: async (ctx, config, tools) => {
        return ["Pong!"];
    }
};