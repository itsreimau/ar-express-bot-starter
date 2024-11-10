module.exports = {
    name: "menu",
    aliases: ["help", "?"],
    description: "Show menu",
    category: "main",
    permissions: [],
    execute: async (ctx, config, tools) => {
        try {
            const {
                cmd
            } = config;
            const tags = {
                ai: "🤖 AI",
                profile: "👤 Profile",
                tools: "🛠️ Tools",
                information: "ℹ️ Information",
                misc: "❓ Miscellaneous"
            };

            if (!cmd || cmd.size === 0) return ["No commands found."];

            let menuText =
                `Hello ${ctx.from.sender}! Here is the list of available commands:\n` +
                "\n";

            for (const category of Object.keys(tags)) {
                const categoryCommands = Array.from(cmd.values())
                    .filter(command => command.category === category)
                    .map(command => ({
                        name: command.name,
                        description: command.description || "No description."
                    }));

                if (categoryCommands.length > 0) {
                    menuText += `◆ ${tags[category]}\n`;

                    categoryCommands.forEach(cmd => {
                        menuText += `> ${ctx.cmd.prefix + cmd.name} - ${cmd.description}\n`;
                    });

                    menuText += "\n";
                }
            }

            menuText += "👨‍💻 Developed by ItsReimau";

            return [menuText];
        } catch (error) {
            console.error("Error:", error);
            return [`⚠ An error occurred: ${error.message}`];
        }
    }
};