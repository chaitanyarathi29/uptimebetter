import client from '@repo/db/client';
import { xAckBulk, xReadGroup } from '@repo/redis/client';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const REGION_ID = process.env.REGION_ID;
const WORKER_ID = process.env.WORKER_ID;


async function main(){
    
    if(!REGION_ID){
        return;
    }
    console.log(REGION_ID);
    if(!WORKER_ID){
        return;
    }
    //read from the stream
    const res = await xReadGroup(REGION_ID,WORKER_ID);

    if(!res){
        return;
    }

    let promises = res.map(({message}) => {fetchWebsite(message.url,message.id)})
    await Promise.all(promises);
    console.log(promises.length);
    //process the website and store the result in the DB 
    //bulk insert through queue maybe
    
    //ack back to the queue that this event has been processed
    xAckBulk(REGION_ID, res.map(({id})=> id));
}

async function fetchWebsite(url: string,websiteId: string):Promise<void>{
    return new Promise<void>((resolve,reject)=> {
            const startTime = Date.now();
            axios.get(url)
                .then(async ()=> {
                    const endTime = Date.now();
                    await client.websiteTicks.create({
                        data: {
                            response_time_ms: endTime-startTime,
                            status: "Up",
                            region_id: REGION_ID!,
                            website_id: websiteId
                        }
                    })
                    resolve();
                })
                .catch(async()=> {
                    const endTime = Date.now();
                    await client.websiteTicks.create({
                        data: {
                            response_time_ms: endTime-startTime,
                            status: "Down",
                            region_id: REGION_ID!,
                            website_id: websiteId
                        }
                    })
                    resolve();
                })
        })
}

main();