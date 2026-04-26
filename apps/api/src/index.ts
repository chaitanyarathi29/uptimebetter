import cors from 'cors';
import express from 'express';
import { router } from './routes/v1/user';
import { websiteRouter } from './routes/v1/website';

const app = express();
app.use(
    cors({
        origin: true,
        credentials: true
    })
);
app.use(express.json());

app.use('/api/v1',router);
app.use('/api/v1',websiteRouter);

app.listen(process.env.PORT || 3000,() => {
    console.log('starting at 3000');
});