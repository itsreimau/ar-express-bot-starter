function bold(str) {
    return `*${str}*`;
}

function inlineCode(str) {
    return `\`${str}\``;
}

function italic(str) {
    return `_${str}_`;
}

function monospace(str) {
    return `\`\`\`${str}\`\`\``;
}

function quote(str) {
    return `> ${str}`;
}

function strikethrough(str) {
    return `~${str}~`;
}

module.exports = {
    bold,
    inlineCode,
    italic,
    monospace,
    quote,
    strikethrough
};