import { xAck, xReadGroup } from '@repo/redis/client';
import dotenv from 'dotenv';
dotenv.config();

const REGION_ID = process.env.REGION_ID;
const WORKER_ID = process.env.WORKER_ID;


async function main(){
    
    if(!REGION_ID){
        return;
    }
    if(!WORKER_ID){
        return;
    }

    while(1){
        //read from the stream
         const res = xReadGroup(REGION_ID,WORKER_ID);
        //process the website and store the result in the DB 
        //bulk insert through queue maybe

        //ack back to the queue that this event has been processed
        xAck(REGION_ID,"a");
    }   
}

main();