import client from "@repo/db/client";
import { Router } from "express";
import { websiteSchema } from "../../types/types";
import userMiddleware from "../../middleware/userMiddleware";

export const websiteRouter = Router();


websiteRouter.post('/website', userMiddleware, async (req,res) => {
    try {
        const result = websiteSchema.safeParse(req.body);
        if(!result.success){
            res.status(400).json({
                message: "validation failed",
                error: result.error
            })
            return;
        }

        const website = await client.website.create({
            data: {
                url: result.data.url,
                timeAdded: new Date(),
                user_id: req.userId!
            }
        })    

        res.json({
            id: website.id
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        }) 
    }

})

websiteRouter.get('/status/:websiteId', userMiddleware, async (req,res) => {
    try {
        const website = await client.website.findFirst({
            where: {
                user_id: req.userId!,
                id: req.params.websiteId as string
            },
            include: {
                ticks: {
                    orderBy: [{
                        createdAt: 'desc'
                    }],
                    take: 10
                }
            }
        })

        if(!website){
            res.status(404).json({
                message: 'Website not found'
            })
            return;
        }

        res.json({
            id: website.id,
            url: website.url,
            timeAdded: website.timeAdded,
            ticks: website.ticks
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

websiteRouter.get('/websites', userMiddleware, async (req,res) => {
    try {
        const websites = await client.website.findMany({
            where: {
                user_id: req.userId!
            },
            include: {
                ticks: {
                    orderBy: [{
                        createdAt: 'desc'
                    }],
                    take: 10
                }
            },
            orderBy: {
                timeAdded: 'desc'
            }
        })

        const data = websites.map((website) => {
            const latestTick = website.ticks[0];
            const avgResponseTime = website.ticks.length
                ? Math.round(
                    website.ticks.reduce((sum, tick) => sum + tick.response_time_ms, 0) /
                        website.ticks.length
                )
                : null;

            return {
                id: website.id,
                url: website.url,
                timeAdded: website.timeAdded,
                status: latestTick?.status ?? 'Unknown',
                latencyMs: latestTick?.response_time_ms ?? null,
                avgResponseTimeMs: avgResponseTime
            };
        })

        res.json({
            data
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
})