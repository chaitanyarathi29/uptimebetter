import { createClient } from "redis";

const client = await createClient()
    .on("error",(err) => console.log("Redis Client Error", err))
    .connect();

type WebsiteEvent = {url: string, id: string}

type MessageType = {
        id: string,
        message: {
            url: string,
            id: string
        }
    };

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

export async function xReadGroup(consumerGroup: string, workerId: string): Promise<MessageType[] | undefined>{
    
    const res = await client.xReadGroup(
        consumerGroup, workerId, {
            key: STREAM_NAME,
            id: '>'
        },{
            'COUNT': 5
        }
    )
    //@ts-ignore
    let messages: MessageType[] | undefined = res?.[0]?.messages;
    return messages;
}

export async function xAck(consumerGroup: string, streamId: string){
    const res = await client.xAck(STREAM_NAME,consumerGroup,streamId);
}

export async function xAckBulk(consumerGroup: string, streamIds: string[]){
    streamIds.map(streamId => xAck(consumerGroup,streamId));
}