 import { createClient } from "redis";

async function main() {
    const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();

    const res = await client.xAdd('betteruptime:website','*',{
        url: "https://google.com",
        id: "1"
    })
    console.log(res);
    client.destroy();
}

main();