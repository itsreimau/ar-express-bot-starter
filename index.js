require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const SimplDB = require("simpl.db");
const {
    Collection
} = require("@discordjs/collection");
const fs = require("fs/promises");
const path = require("path");
const tools = require("./tools/exports.js");
const {
    exec
} = require("child_process");
const {
    inspect
} = require("util");

const commandConfig = new Collection();
const databaseConfig = new SimplDB();
const config = {
    cmd: commandConfig,
    db: databaseConfig
};

const app = express();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Content-Type", "application/json; charset=UTF-8");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, SECRET");
    next();
});

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello from AutoResponder!");
});

app.get("/api", (req, res) => {
    res.status(405).json({
        error: "Method Not Allowed",
        message: "Only POST requests are allowed"
    });
});

const loadCommands = async () => {
    try {
        const commandFiles = await fs.readdir(path.join(__dirname, "commands"));
        console.log("Loading command...");
        for (const file of commandFiles) {
            const commandModule = require(`./commands/${file}`);
            const {
                name,
                aliases = [],
                description = "",
                category = "",
                permissions = [],
                execute
            } = commandModule;
            commandConfig.set(name.toLowerCase(), {
                name,
                aliases: aliases.map((alias) => alias.toLowerCase()),
                description,
                category,
                permissions,
                execute
            });
        }
        console.log("Commands loaded:", commandConfig.keys());
    } catch (error) {
        console.error("Failed to load commands:", error);
    }
};

app.post("/api", async (req, res) => {
    const data = req.body;

    if (!data.query || !data.appPackageName || !data.messengerPackageName || !data.query.sender || !data.query.message) {
        return res.status(400).json({
            replies: [{
                    message: "Error ❌"
                },
                {
                    message: "JSON data is incomplete. Was the request sent by AutoResponder?"
                }
            ]
        });
    }

    const {
        isGroup,
        groupParticipant,
        sender: rawSender,
        message,
        ruleId,
        isTestMessage
    } = data.query;

    const sender = isGroup ? groupParticipant : rawSender;
    const prefixList = ["!", ".", "/"];
    const prefix = prefixList.find((p) => message.startsWith(p));
    const commandMessage = message.slice(prefix.length).trim();
    const commandName = commandMessage.split(" ")[0].toLowerCase();
    const input = {
        text: commandMessage.split(" ").slice(1).join(" "),
        param: commandMessage.split(" ").slice(1)
    };
    const ctx = {
        from: {
            sender
        },
        msg: {
            message,
            isTestMessage
        },
        group: {
            isGroup,
            groupParticipant
        },
        cmd: {
            prefix,
            commandName
        },
        input,
        other: {
            ruleId
        }
    };

    const command = config.cmd.get(commandName) || [...config.cmd.values()].find((cmd) => cmd.aliases.includes(commandName));

    if (!prefix || !command) {
        return res.status(200).json({
            replies: []
        });
    }

    const userDb = await config.db.get(`user.${ctx.from.sender}`);
    if (!userDb) {
        await config.db.set(`user.${ctx.from.sender}`, {
            language: "en",
            premium: false
        });
    }

    const [userLanguage] = await Promise.all([
        config.db.get(`user.${ctx.from.sender}.language`)
    ]);

    try {
        if (command.permissions.includes("group") && !isGroup) {
            return res.status(200).json({
                replies: [{
                    message: await tools.msg.getText("permission.group", userLanguage)
                }]
            });
        }

        if (command.permissions.includes("private") && isGroup) {
            return res.status(200).json({
                replies: [{
                    message: await tools.msg.getText("permission.private", userLanguage)
                }]
            });
        }

        if (command.permissions.includes("developer") && req.headers["secret"] === "080207") {
            return res.status(200).json({
                replies: [{
                    message: await tools.msg.getText("permission.developer", userLanguage)
                }]
            });
        }

        const output = await command.execute(ctx, config, tools);
        const replies = Array.isArray(output) ? output : [output];
        const formattedReplies = replies.map((message) => ({
            message
        }));

        return res.status(200).json({
            replies: formattedReplies
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            replies: [{
                message: await tools.msg.getText("general.error", userLanguage, {
                    error_message: error.message
                })
            }]
        });
    }

    if ((!prefix || !command) && req.headers["secret"] === "080207") {
        if (message.startsWith("> ")) {
            try {
                const code = message.slice(2).trim();
                const result = eval(code);
                return res.json({
                    replies: [{
                        message: inspect(result)
                    }]
                });
            } catch (error) {
                console.error("Error:", error);
                return res.json({
                    replies: [{
                        message: await tools.msg.getText("general.error", userLanguage, {
                            error_message: error.message
                        })
                    }]
                });
            }
        } else if (message.startsWith(">> ")) {
            try {
                const code = message.slice(3).trim();
                const result = await eval(`(async () => { ${code} })()`);
                return res.json({
                    replies: [{
                        message: inspect(result)
                    }]
                });
            } catch (error) {
                console.error("Error:", error);
                return res.json({
                    replies: [{
                        message: await tools.msg.getText("general.error", userLanguage, {
                            error_message: error.message
                        })
                    }]
                });
            }
        } else if (message.startsWith("$ ")) {
            try {
                const command = message.slice(2).trim();
                const output = await new Promise((resolve, reject) => {
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            reject(new Error(`Error: ${error.message}`));
                        } else if (stderr) {
                            reject(new Error(stderr));
                        } else {
                            resolve(stdout);
                        }
                    });
                });

                return res.json({
                    replies: [{
                        message: output
                    }]
                });
            } catch (error) {
                console.error("Error:", error);
                return res.json({
                    replies: [{
                        message: await tools.msg.getText("general.error", userLanguage, {
                            error_message: error.message
                        })
                    }]
                });
            }
        }
    }
});

loadCommands().then(() => {
    const port = 1334;
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
});