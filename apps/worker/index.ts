 import { createClient } from "redis";

async function main() {
    const client = await createClient()
        .on("error", (err) => console.log("Redis Client Error", err))
        .connect();

    const res = await client.xReadGroup('india','india-1',{
        key: 'betteruptime:website',
        id: '>'
    }, {
        COUNT: 2
    })

    if(!res){
        client.destroy();
        return;
    }

    // @ts-ignore
    console.log((res[0]).messages);
    client.destroy();
}

main();