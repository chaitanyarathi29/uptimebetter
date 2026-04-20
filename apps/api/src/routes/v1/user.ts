import { Router } from "express";
import { siginSchema, signupSchema } from "../../types/types";
import client from "@repo/db/client";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
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

        const userCheck = await client.user.findUnique({
            where: {
                username: result.data.username
            }
        })
        
        if(userCheck){
            res.status(409).json({
                message: "Username already exists"
            })
            return;
        }

        const hashedPassword = await bcrypt.hash(result.data.password,10);

        const user = await client.user.create({
            data: {
                username: result.data.username,
                password: hashedPassword    
            }
        })
        
        const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'iamceobitch');
        
        res.json({
            userId: user.id,
            token: token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        }) 
    }
    

})

router.post('/signin', async (req,res)=> {

    try {
        const result = siginSchema.safeParse(req.body);
        if(!result.success){
            res.status(400).json({
                message: "validation failed",
                error: result.error
            })
            return;
        }

        const user = await client.user.findUnique({
            where: {
                username: result.data.username
            }
        })

        if (!user) {
            res.status(401).json({
                message: "Invalid credentials"
            })
            return;
        }

        const compare = await bcrypt.compare(result.data.password, user.password);

        if(!compare){
            res.status(401).json({
                message: "Invalid credentials"
            })
            return;
        }
        
        const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'iamceobitch');

        res.json({
            userId: user.id,
            token: token
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }

})
