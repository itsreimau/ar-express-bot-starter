const {
    _ai
} = require("lowline.ai");

module.exports = {
    name: "chatgpt",
    aliases: ["lowline"],
    description: "Chat with AI",
    category: "ai",
    permissions: [],
    async execute(ctx, config) {
        const {
            text
        } = ctx.input;

        if (!text) return ["📌 Please provide an argument!"];

        try {
            const res = await _ai.generatePlaintext({
                prompt: text
            });

            return [res.result];
        } catch (error) {
            console.error("Error:", error);
            return [`⚠ An error occurred: ${error.message}`];
        }
    }
};