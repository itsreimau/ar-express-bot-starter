const {
    _ai
} = require("lowline.ai");

module.exports = {
    name: "chatgpt",
    aliases: ["lowline"],
    description: "Chat with AI",
    category: "ai",
    permissions: [],
    async execute(ctx, config, tools) {
        const {
            text
        } = ctx.input;

        if (!text) return ["📌 Please provide an argument!"];

        try {
            let chatThread = config.db.get(`user.${ctx.from.sender}.chatThread`) || [];

            chatThread.push({
                name: ctx.from.sender,
                role: "user",
                content: text,
            });

            const res = await _ai.suggestChatResponse({
                intent: text,
                chat_thread: chatThread
            });

            chatThread.push({
                name: "Bot",
                role: "bot",
                content: res.result,
            });

            config.db.set(`user.${ctx.from.sender}.chatThread`, chatThread);

            return [res.result];
        } catch (error) {
            console.error("Error:", error);
            return [`⚠ An error occurred: ${error.message}`];
        }
    }
};