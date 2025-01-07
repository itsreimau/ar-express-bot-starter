// Required modules and dependencies
const express = require("express");
const bodyParser = require("body-parser");
const {
    Collection
} = require("@discordjs/collection");
const SimplDB = require("simpl.db");
const fs = require("fs/promises");
const path = require("path");
const tools = require("./tools/exports.js");
const {
    exec
} = require("child_process");
const util = require("util");

// Set configuration
const commandConfig = new Collection();
const databaseConfig = new SimplDB();
const config = {
    cmd: commandConfig,
    db: databaseConfig
};

// Create a database
const dbFile = path.join(__dirname, "database.json");
fs.access(dbFile).catch(() => fs.writeFile(dbFile, JSON.stringify({}), "utf8"));

// Create an express application
const app = express();

// Middleware to set response headers for cross-origin access
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Content-Type", "application/json; charset=UTF-8");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, SECRET");
    next();
});

app.use(bodyParser.json());

// Basic endpoint for server checking
app.get("/", (req, res) => {
    res.send("Hello from AutoResponder!");
});

// GET endpoint for /api (only accepts POST requests)
app.get("/api", (req, res) => {
    res.status(400).json({
        replies: [{
                message: "Error ❌"
            },
            {
                message: "JSON data is incomplete. Was the request sent by AutoResponder?"
            }
        ]
    });
});

// Function to load all commands from the 'commands' folder
const loadCommands = async () => {
    try {
        const commandCategories = await fs.readdir(path.join(__dirname, "commands"), {
            withFileTypes: true
        });

        console.log("Loading commands...");

        for (const category of commandCategories) {
            if (category.isDirectory()) {
                const categoryPath = path.join(__dirname, "commands", category.name);
                const commandFiles = await fs.readdir(categoryPath);

                for (const file of commandFiles) {
                    const commandModule = require(path.join(categoryPath, file));
                    const {
                        name,
                        aliases = [],
                        description = "",
                        permissions = [],
                        execute
                    } = commandModule;

                    commandConfig.set(name.toLowerCase(), {
                        name,
                        aliases: aliases.map(alias => alias.toLowerCase()),
                        description,
                        category: category.name,
                        permissions,
                        execute
                    });

                    console.log(`Loaded command: ${name} (Category: ${category.name})`);
                }
            }
        }
        console.log("All commands loaded successfully.");
    } catch (error) {
        console.error("Failed to load commands:", error);
    }
};

// Handler for POST requests in /api
app.post("/api", async (req, res) => {
    const data = req.body;

    // Validation of received data
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

    const isDebug = req.headers["DEBUG"] === "080207";

    const {
        isGroup,
        groupParticipant,
        sender: rawSender,
        message,
        ruleId,
        isTestMessage,
        isDebug
    } = data.query;

    // Log all incoming messages, including private and group
    if (isGroup) {
        console.log(`Incoming group message: Group: ${rawSender}, Participant: ${groupParticipant}, Message: ${message}`);
    } else {
        console.log(`Incoming private message from: ${rawSender}, Message: ${message}`);
    }

    // If message is marked as secret, handle it accordingly
    if (isDebug) {
        console.log(`Secret message detected from ${rawSender}`);
    }

    // Message handling is based on whether the message comes from a group or private
    const sender = groupParticipant ? groupParticipant : rawSender;

    // List of supported prefixes
    const prefixList = ["!", ".", "/"];
    const prefix = prefixList.find(p => message.startsWith(p));
    if (!prefix) return res.status(200).json({
        replies: []
    });

    // Parse the message to get the command name and input
    const commandMessage = message.slice(prefix.length).trim();
    const commandName = commandMessage.split(" ")[0].toLowerCase();
    const input = {
        text: commandMessage.split(" ").slice(1).join(" "),
        param: commandMessage.split(" ").slice(1)
    };

    // Search for commands by name or alias
    const command = config.cmd.get(commandName) || [...config.cmd.values()].find(cmd => cmd.aliases.includes(commandName));
    if (!command) return res.status(200).json({
        replies: []
    });

    // Retrieve or create user data in the database
    let userDb;

    if (isTestMessage) {
        userDb = {
            premium: true
        };
    } else if (/^[\d+\-]+$/.test(sender)) {
        userDb = await config.db.get(`user.${sender}`) || {
            premium: false
        };
        await config.db.set(`user.${sender}`, userDb);
    } else {
        userDb = {
            premium: false
        };
    }

    // Check command permissions
    try {
        if (command.permissions.includes("group") && !isGroup) {
            return res.status(200).json({
                replies: [{
                    message: "⛔ This command can only be used in group chats."
                }]
            });
        }
        if (command.permissions.includes("private") && isGroup) {
            return res.status(200).json({
                replies: [{
                    message: "⛔ This command can only be used in private chats."
                }]
            });
        }
        if (command.permissions.includes("developer") && !isDebug && isTestMessage) {
            return res.status(200).json({
                replies: [{
                    message: "⛔ You do not have permission to use this command."
                }]
            });
        }
        if (command.permissions.includes("premium") && userDb.premium) {
            return res.status(200).json({
                replies: [{
                    message: "⛔ This command can only be used in private chats."
                }]
            });
        }

        const ctx = {
            from: {
                sender,
                isTest: isTestMessage,
                isPremium: userDb.premium
            },
            msg: {
                content: message
            },
            group: isGroup ? {
                participant: groupParticipant,
                name: rawSender
            } : null,
            cmd: {
                prefix,
                name: commandName
            },
            input,
            isGroup,
            misc: {
                ruleId
            }
        };

        // Execute the command and return the results
        const output = await command.execute(ctx, config, tools);
        const replies = Array.isArray(output) ? output : [output];
        return res.status(200).json({
            replies: replies.map(msg => ({
                message: msg
            }))
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            replies: [{
                message: `⚠ An error occurred: ${error.message}`
            }]
        });
    }

    // Debug command evaluation for direct code or shell execution
    if ((!prefix || !command) && isDebug && isTestMessage) {
        if (message.startsWith("=> ")) {
            try {
                const code = message.slice(2).trim();
                const result = eval(code);
                return res.json({
                    replies: [{
                        message: util.inspect(result)
                    }]
                });
            } catch (error) {
                console.error("Error:", error);
                return res.json({
                    replies: [{
                        message: `⚠ An error occurred: ${error.message}`
                    }]
                });
            }
        } else if (message.startsWith("==> ")) {
            try {
                const code = message.slice(3).trim();
                const result = await eval(`(async () => { ${code} })()`);
                return res.json({
                    replies: [{
                        message: util.inspect(result)
                    }]
                });
            } catch (error) {
                console.error("Error:", error);
                return res.json({
                    replies: [{
                        message: `⚠ An error occurred: ${error.message}`
                    }]
                });
            }
        } else if (message.startsWith("$ ")) {
            try {
                const command = message.slice(2).trim();
                const output = await util.promisify(exec)(command);
                return res.json({
                    replies: [{
                        message: output.stdout || output.stderr
                    }]
                });
            } catch (error) {
                console.error("Error:", error);
                return res.json({
                    replies: [{
                        message: `⚠ An error occurred: ${error.message}`
                    }]
                });
            }
        }
    }
});

// Loading commands and starting the server
loadCommands().then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server started on port ${port}`));
});