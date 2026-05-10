import client from "@repo/db/client";
import {xAddBulk} from '@repo/redis/client'

async function main(){
    let websites = await client.website.findMany({
        select: {
            url: true,
            id: true
        }
    })
    console.log(websites.length);
    await xAddBulk(websites.map(w => ({
        url: w.url,
        id: w.id
    })));
}

setInterval(()=> {
    main();
},10*1000);