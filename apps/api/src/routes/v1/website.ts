import client from "@repo/db/client";
import { Router } from "express";
import { z } from "zod";
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
                    take: 1
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