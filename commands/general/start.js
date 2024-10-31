module.exports = {
    name: "start",
    aliases: [],
    description: "Starting bot",
    category: "main",
    permissions: [],
    execute: async (ctx, config, tools) => {
        return ["WELCOME! Use /help to see the available commands."];
    }
};