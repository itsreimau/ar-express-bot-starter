module.exports = {
    name: "echo",
    aliases: ["say"],
    description: {
        en: "Repeat message",
        id: "Ulangi pesan"
    },
    category: "tools",
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
            return [text];
        } catch (error) {
            console.error("[ar-express-bot-starter] Kesalahan:", error);
            return [await tools.msg.getText("general.error", userLanguage, {
                error_message: error.message
            })];
        }
    }
};