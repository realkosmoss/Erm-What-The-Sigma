const express = require("express");
const undici = require("undici");
const fs = require("fs");
const funcaptcha = require("./lib");

const app = express();
const port = 8181;

app.use(express.json());

const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function handleCaptcha(req, res) {
    try {
        const ClientData = req.body.task;
        const publicKey = ClientData.publicKey;
        const ApiUrl = ClientData.ApiUrl;
        const dataExchangeBlob = ClientData.blob;
        const site = ClientData.site;

        const token = await funcaptcha.getToken({
            pkey: publicKey,
            surl: ApiUrl,
            data: {
                blob: dataExchangeBlob,
            },
            headers: {
                "User-Agent": USER_AGENT,
            },
            site: site,
        });

        if (token.token.includes("sup=1")) {
            console.log(
                `Solved: ${token.token.slice(0, 13) + "..."} Waves: Suppressed`,
            );
            res.send(token.token.toString());
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log(`Failed: ${token.token.slice(0, 13) + "..."} Non Suppressed`);
        res.send(token.token.toString());
        return;
    } catch (error) {
        console.error("HandleCaptcha Error:", error);
    }
}

app.post("/createTask", handleCaptcha);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
