const axios = require("axios");

module.exports = {
    name: "wikipedia",
    aliases: ["wiki"],
    description: {
        en: "Search for information on Wikipedia",
        id: "Cari informasi di Wikipedia"
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
            const apiUrl = tools.api.createUrl("https://en.wikipedia.org", `/api/rest_v1/page/summary/${text}`);
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data || !data.extract) {
                return [await tools.msg.getText("general.notFound", userLanguage)];
            }

            const caption = await tools.msg.getText("command.wikipedia.caption", userLanguage, {
                title: data.title,
                description: data.extract
            });
            return [caption];
        } catch (error) {
            console.error("[ar-express-bot-starter] Kesalahan:", error);
            return [await tools.msg.getText("general.error", userLanguage, {
                error_message: error.message
            })];
        }
    }
};