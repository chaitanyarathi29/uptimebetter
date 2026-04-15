import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const client = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres'
    })
});


export default client;