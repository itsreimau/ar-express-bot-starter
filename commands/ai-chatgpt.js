const {
    _ai
} = require("lowline.ai");

module.exports = {
    name: "chatgpt",
    aliases: ["lowline"],
    description: {
        en: "Chat with AI",
        id: "Ngobrol dengan AI"
    },
    category: "ai",
    permissions: [],
    async execute(ctx, config, tools) {
        const [userLanguage] = await Promise.all([
            config.db.get(`user.${ctx.from.sender}.language`)
        ]);
        const {
            text
        } = ctx.input;

        if (!text) {
            return [await tools.msg.getText("general.argument", userLanguage)];
        }

        try {
            const res = await _ai.generatePlaintext({
                prompt: text
            });

            return [res.result];
        } catch (error) {
            console.error("[ar-express-bot-starter] Kesalahan:", error);
            return [await tools.msg.getText("general.error", userLanguage, {
                error_message: error.message
            })];
        }
    }
};