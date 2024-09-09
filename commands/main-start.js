module.exports = {
    name: "start",
    aliases: [],
    description: {
        en: "Starting bot",
        id: "Memulai bot"
    },
    category: "main",
    permissions: [],
    execute: async (ctx, config, tools) => {
        const [userLanguage] = await Promise.all([
            config.db.get(`user.${ctx.from.sender}.language`)
        ]);

        return [await tools.msg.getText("general.command.start", userLanguage)];
    }
};