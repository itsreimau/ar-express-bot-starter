module.exports = {
    name: "echo",
    aliases: ["say"],
    description: "Repeat message",
    category: "tools",
    permissions: [],
    async execute(ctx, config, tools) {
        const {
            text
        } = ctx.input;

        if (!text) return ["📌 Please provide an argument!"];

        return [text];
    }
};