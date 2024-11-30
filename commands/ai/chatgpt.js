const axios = require("axios");

module.exports = {
    name: "chatgpt",
    aliases: ["ai", "chatai", "gpt", "openai"],
    description: "Chat with AI",
    category: "ai",
    permissions: [],
    async execute(ctx, config, tools) {
        const {
            text
        } = ctx.input;

        if (!text) return ["📌 Please provide an argument!"];

        try {
            const apiUrl = tools.api.createUrl("btch", "/openai", {
                text
            });
            const {
                data
            } = await axios.get(apiUrl);

            return [data.result];
        } catch (error) {
            console.error("Error:", error);
            return [`⚠ An error occurred: ${error.message}`];
        }
    }
};