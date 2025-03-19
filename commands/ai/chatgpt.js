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
            const apiUrl = tools.api.createUrl("fast", "/aillm/gpt-4", {
                ask: text
            });
            const result = (await axios.get(apiUrl)).data.result;

            return [result];
        } catch (error) {
            console.error("Error:", error);
            return [`⚠ An error occurred: ${error.message}`];
        }
    }
};