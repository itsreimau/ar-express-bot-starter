module.exports = {
    name: "menu",
    aliases: ["help", "?"],
    description: "Show menu",
    category: "main",
    permissions: [],
    execute: async (ctx, config) => {
        try {
            const {
                cmd
            } = config;
            const tags = {
                ai: "🤖 AI",
                profile: "👤 Profile",
                tools: "🛠️ Tools",
                information: "ℹ️ Information",
                "": "❓ No Category"
            };

            if (!cmd || cmd.size === 0) {
                return ["No commands found."];
            }

            let body = "";
            const addedCategories = new Set();

            for (const [category, categoryName] of Object.entries(tags)) {
                const commands = cmd.filter(command => command.category === category);

                if (commands.size > 0 && !addedCategories.has(category)) {
                    body += `\n${categoryName}\n`;
                    addedCategories.add(category);

                    for (const command of commands.values()) {
                        const description = command.description || "No description.";
                        body += `> ${ctx.cmd.prefix}${command.name} - ${description}\n`;
                    }
                }
            }

            const header = `Hello ${ctx.from.sender}! Here is the list of available commands:`;
            const footer = "👨‍💻 Developed by ItsReimau";

            const caption = `${header}\n` +
                "\n" +
                `${body.trim()}\n` +
                "\n" +
                footer;

            return [caption];
        } catch (error) {
            console.error("Kesalahan:", error);
            return [`Error occurred: ${error.message}`];
        }
    }
};