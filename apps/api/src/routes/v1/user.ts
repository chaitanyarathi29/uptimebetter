import { Router } from "express";
import { siginSchema, signupSchema } from "../../types/types";
import client from "@repo/db/client";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();

export const router = Router();

router.post('/signup', async (req,res)=> {

    try {
        
        const result = signupSchema.safeParse(req.body);
        if(!result.success){
            res.status(400).json({
                message: "validation failed",
                error: result.error
            })
            return;
        }
        
        const hashedPassword = jwt.sign(result.data.password, process.env.JWT_SECRET || 'iamceobitch');

        const user = await client.user.create({
            data: {
                username: result.data.username,
                password: hashedPassword    
            }
        })
        res.json({
            userId: user.id
        })

    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error
        }) 
    }
    

})

router.post('/signin', (req,res)=> {

    

})
