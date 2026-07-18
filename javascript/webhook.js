const https = require("https")

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    }

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" }
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) }
    }

    const { url } = JSON.parse(event.body)

    if (!url || !url.includes("discord.com/api/webhooks")) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "wbh" }) }
    }

    const urlObj = new URL(url)

    const result = await new Promise((resolve) => {
        const req = https.request({
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: "DELETE",
        }, (res) => {
            res.on("data", () => {})
            res.on("end", () => {
                resolve({ status: res.statusCode })
            })
        })

        req.setTimeout(5000, () => { req.destroy(); resolve({ status: 408 }) })
        req.on("error", (e) => resolve({ status: 500, error: e.message }))
        req.end()
    })

    if (result.status === 204) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, deleted: true, message: "wbh molestada" })
        }
    }

    if (result.status === 404) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: false, deleted: false, message: "not found wbh" })
        }
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, deleted: false, message: "Error: stats " + result.status })
    }
}
