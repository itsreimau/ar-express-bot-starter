// List of free APIs, use wisely!
const APIs = {
    agatz: {
        baseURL: "https://api.agatz.xyz"
    },
    aggelos_007: {
        baseURL: "https://api.aggelos-007.xyz"
    },
    chiwa: {
        baseURL: "https://api.chiwa.my.id"
    },
    itzpire: {
        baseURL: "https://itzpire.com"
    },
    lenwy: {
        baseURL: "https://api-lenwy.vercel.app"
    },
    nyxs: {
        baseURL: "https://api.nyxs.pw"
    },
    ryzendesu: {
        baseURL: "https://api.ryzendesu.vip"
    },
    sandipbaruwal: {
        baseURL: "https://sandipbaruwal.onrender.com"
    },
    widipe: {
        baseURL: "https://widipe.com"
    },
    wudysoft: {
        baseURL: "https://wudysoft.us.kg"
    },
    nexoracle: {
        baseURL: "https://api.nexoracle.com",
        APIKey: "free_key@maher_apis" // APIKey is provided by Maher Zubair
    },
    zenith: {
        baseURL: "https://api-zenith.koyeb.app",
        APIKey: "zenkey" // APIKey is provided by Zenith
    }
};

function createUrl(apiNameOrURL, endpoint, params = {}, apiKeyParamName) {
    const api = APIs[apiNameOrURL];

    if (!api) {
        try {
            const url = new URL(apiNameOrURL);
            apiNameOrURL = url;
        } catch (error) {
            throw new Error(`Invalid API name or custom URL: ${apiNameOrURL}`);
        }
    }

    const queryParams = new URLSearchParams(params);

    if (apiKeyParamName && api && "APIKey" in api) {
        queryParams.set(apiKeyParamName, api.APIKey);
    }

    const apiUrl = new URL(endpoint, api ? api.baseURL : apiNameOrURL.origin);
    apiUrl.search = queryParams.toString();

    return apiUrl.toString();
}

function listUrl() {
    return APIs;
}

module.exports = {
    createUrl,
    listUrl
};