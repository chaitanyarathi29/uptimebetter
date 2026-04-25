import { createClient } from "redis";

const client = await createClient()
    .on("error",(err) => console.log("Redis Client Error", err))
    .connect();

type WebsiteEvent = {url: string, id: string}

const STREAM_NAME = 'betteruptime:website';

async function xAdd({url, id}: WebsiteEvent) {
    await client.xAdd(
        STREAM_NAME,'*', {
            url,
            id
        }
    );
}

export async function xAddBulk(websites: WebsiteEvent[]){
    for(let i=0; i<websites.length; i++){
        const website = websites[i];
        if (!website) {
            continue;
        }
        await xAdd({
            url: website.url,
            id: website.id
        })
    }
}

export async function xReadGroup(consumerGroup: string, workerId: string){
    
    const res = await client.xReadGroup(
        consumerGroup, workerId, {
            key: STREAM_NAME,
            id: '>'
        }, {
            'COUNT': 5
        }
    )

    console.log(res);
    return res;
}

export async function xAck(consumerGroup: string, streamId: string){
    const res = await client.xAck(STREAM_NAME,consumerGroup,streamId);
}