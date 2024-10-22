module.exports = {
    name: "menu",
    aliases: ["help", "?"],
    description: {
        en: "Show menu",
        id: "Menampilkan menu"
    },
    category: "main",
    permissions: [],
    execute: async (ctx, config, tools) => {
        const [userLanguage] = await Promise.all([
            config.db.get(`user.${ctx.from.sender}.language`)
        ]);

        try {
            const {
                cmd
            } = config;
            const tags = {
                ai: "🤖 AI",
                profile: "👤 Profile",
                tools: "🛠️ Tools",
                info: "ℹ️ Info",
                "": "❓ No Category"
            };

            if (!cmd || cmd.size === 0) {
                return [await tools.msg.getText("general.notFound", userLanguage)];
            }

            let body = "";
            const addedCategories = new Set();

            for (const [category, categoryName] of Object.entries(tags)) {
                const commands = cmd.filter(command => command.category === category);

                if (commands.size > 0 && !addedCategories.has(category)) {
                    body += `\n${categoryName}\n`;
                    addedCategories.add(category);

                    for (const command of commands.values()) {
                        const description = command.description[userLanguage] || "No description.";
                        body += `> ${ctx.cmd.prefix}${command.name} - ${description}\n`;
                    }
                }
            }

            const caption = await tools.msg.getText("command.menu.caption", userLanguage, {
                header: await tools.msg.getText("command.menu.header", userLanguage, {
                    sender: ctx.from.sender
                }),
                body: body.trim(),
                footer: await tools.msg.getText("command.menu.footer", userLanguage)
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