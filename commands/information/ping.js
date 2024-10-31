module.exports = {
    name: "ping",
    aliases: [],
    description: "Check ping",
    category: "information",
    permissions: [],
    execute: async (ctx, config, tools) => {
        return ["Pong!"];
    }
};