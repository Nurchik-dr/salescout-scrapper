import dotenv from 'dotenv';
dotenv.config();
import IORedis from "ioredis";
import mongoose, {Types} from "mongoose";
import {Worker} from "bullmq";
import {AnalysisTasksModel} from "./repositories/analyze-tasks.schema.js";

import express from 'express';
import cors from 'cors';
import analyzeRouter from './routes/analyze.js';
import AnalyzerFactory from './services/analyzerFactory.js';
import {validateVideoData} from "./utils/validator.js";
import {VideoModel} from "./repositories/video.model.js";
import {CompanyModel} from "./repositories/company.schema.js";
import {AnalysisModel} from "./repositories/analysis.scheman.js";

// Подключаем MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const connection = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
});

connection.on('connect', () => console.log('✅ Connected to Redis'));
connection.on('error', (err) => console.error('❌ Redis connection error:', err));

const aiAnalysisWorker = new Worker(
    'ai_analysis_queue',
    async (job) => {

        try {
            const videoData = job.data;

            const taskId = new Types.ObjectId(videoData.taskId);

            if (!videoData.videoDescription) {
                throw new Error('VideoDescription is required');
            }

            console.log(`\n🎯 Процесс обработки ${videoData.taskId}`);
            let provider = process.env.AI_PROVIDER || 'gpt';

            const task = await AnalysisTasksModel.findById(taskId)

            console.log("task", task)

            if(!task){
                throw new Error('task is required');
            }

            const video = await VideoModel.findById(task.videoId)

            if(!video){
                throw new Error('video is required');
            }

            const company = await CompanyModel.findById(task.companyId)

            if(!company){
                throw new Error('company is required');
            }

            const formatVideo = {
                "videoId": video._id,
                "aboutCompany": company.description,
                "platform": video.platform,
                "author": video.author,
                "description": video.description,
                "views": video.views,
                "likes": video.likes,
                "comments": video.comments,
                "viralScore": video.viralScore,
                "isViral": video.isViral,
                "publishedAt": video.publishedAt,
                "videoData": videoData.videoDescription,
            }

            const validation = validateVideoData(formatVideo);

            if (!validation.valid) {
                console.log('validation.errors', validation.errors);
                throw new Error('video validation failed');
            }

            await AnalysisTasksModel.findByIdAndUpdate(videoData.taskId, {
                status: 'analysis'
            });

            // ============================================
            // ЗАКОММЕНТИРОВАННЫЙ КОД РЕАЛЬНОГО АНАЛИЗА
            // ============================================
            const analyzer = AnalyzerFactory.create(provider);
            const startTime = Date.now();
            const analysis = await analyzer.analyzeVideo(formatVideo);
            const analysisTime = Date.now() - startTime;

            console.log('⏳ Имитация AI анализа...');


            console.log(`✅ Analysis completed in ${analysisTime}ms`);

            console.log('final', {
                success: true,
                videoId: video._id,
                platform: video.platform,
                provider: provider,
                analyzedAt: new Date().toISOString(),
                analysisTime: `${analysisTime}ms`,
                analysis: analysis
            })

            // Сохраняем результат в БД
            await AnalysisModel.create({
                success: true,
                videoId: video._id,
                platform: video.platform,
                provider: provider,
                analyzedAt: new Date().toISOString(),
                analysisTime: analysisTime,
                analysis: analysis
            })

            await AnalysisTasksModel.findByIdAndUpdate(videoData.taskId, {
                status: 'completed'
            });

        } catch (error) {
            console.error('❌ Analysis error:', error);
            console.error('Error stack:', error.stack);

            await AnalysisTasksModel.findByIdAndUpdate(videoData.taskId, {
                status: 'failed'
            });
        }
    },
    {
        connection,
        concurrency: 2, // Обрабатываем до 2 задач параллельно
        limiter: {
            max: 5, // Максимум 5 задач
            duration: 60000 // за 60 секунд (для соблюдения rate limits)
        }
    }
);

aiAnalysisWorker.on('completed', (job) => {
    console.log(`\n✨ Job ${job.id} (${job.name}) completed successfully`);
});

aiAnalysisWorker.on('failed', (job, err) => {
    console.error(`\n💥 Job ${job?.id} (${job?.name}) failed:`, err.message);
});

aiAnalysisWorker.on('progress', (job, progress) => {
    console.log(`⏳ Job ${job.id} progress: ${progress}%`);
});

console.log('\n🚀 Workers started successfully!');
console.log(' 📡 Search queue: video_search_queue');
console.log('\n⏳ Waiting for jobs...\n');


// const app = express();
// const PORT = process.env.PORT || 3000;

// Middleware
// app.use(cors());
// app.use(express.json());

// Routes
// app.use('/api', analyzeRouter);

// Health check
// app.get('/health', (req, res) => {
//     const providers = AnalyzerFactory.getAvailableProviders();
//
//     res.json({
//         status: 'OK',
//         service: 'AI Video Analyzer',
//         timestamp: new Date().toISOString(),
//         aiProvider: process.env.AI_PROVIDER || 'gpt',
//         availableProviders: providers
//     });
// });
//
// // Error handler
// app.use((err, req, res, next) => {
//     console.error('Error:', err);
//     res.status(500).json({
//         error: 'Internal server error',
//         message: err.message
//     });
// });
//
// app.listen(PORT, () => {
//     const providers = AnalyzerFactory.getAvailableProviders();
//     const currentProvider = process.env.AI_PROVIDER || 'gpt';
//
//     console.log(`🚀 AI Analyzer service running on port ${PORT}`);
//     console.log(`🤖 Current AI Provider: ${currentProvider.toUpperCase()}`);
//     console.log(`📋 Available providers: ${providers.join(', ')}`);
//     console.log(`📊 Health check: http://localhost:${PORT}/health`);
//     console.log(`🔍 Analyze endpoint: http://localhost:${PORT}/api/analyze`);
//     console.log(`📝 Providers list: http://localhost:${PORT}/api/providers`);
//     console.log('');
//     console.log('✅ Server is ready! Press Ctrl+C to stop');
// });
//
// // Prevent exit
// process.on('SIGTERM', () => {
//     console.log('SIGTERM received, shutting down gracefully...');
//     process.exit(0);
// });
//
// process.on('SIGINT', () => {
//     console.log('\n👋 Shutting down server...');
//     process.exit(0);
// });