// Миграция: конвертация строковых дат в Date объекты
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrate() {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db();
        const videosCollection = db.collection('videos');

        // Найти все видео, где publishedAt является строкой
        const videos = await videosCollection.find({
            publishedAt: { $type: 'string' }
        }).toArray();

        console.log(`Found ${videos.length} videos with string publishedAt`);

        let updated = 0;
        for (const video of videos) {
            try {
                const publishedAtDate = new Date(video.publishedAt);

                if (!isNaN(publishedAtDate.getTime())) {
                    await videosCollection.updateOne(
                        { _id: video._id },
                        { $set: { publishedAt: publishedAtDate } }
                    );
                    updated++;
                } else {
                    console.warn(`Invalid date for video ${video._id}: ${video.publishedAt}`);
                }
            } catch (error) {
                console.error(`Error updating video ${video._id}:`, error.message);
            }
        }

        console.log(`✅ Successfully updated ${updated} videos`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.close();
    }
}

migrate();