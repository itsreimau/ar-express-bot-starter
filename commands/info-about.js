module.exports = {
    name: "about",
    aliases: ["info"],
    description: {
        en: "About bot",
        id: "Tentang bot"
    },
    category: "info",
    permissions: [],
    execute: async (ctx, config, tools) => {
        const [userLanguage] = await Promise.all([
            config.db.get(`user.${ctx.from.sender}.language`)
        ]);

        return [await tools.msg.getText("command.about.caption", userLanguage)];
    }
};