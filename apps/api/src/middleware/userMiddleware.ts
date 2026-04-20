import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const userMiddleware = (req: Request,res: Response, next: NextFunction) => {

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }
    const secret = process.env.JWT_SECRET || 'iamceobitch';
    if (!secret) {
        res.status(400).json({ message: 'Internal server error' });
        return;
    }
    try {
        const decoded = jwt.verify(token, secret) as { sub: string };
        req.userId = decoded.sub;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Unauthorized' });
        return;
    }
    
}

export default userMiddleware;