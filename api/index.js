const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 4.5 * 1024 * 1024 }
});

app.get('/', (req, res) => {
    res.send('API Fixed and Running! 🚀');
});

app.post('/api/convert', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
        const format = req.body.format || 'webp';
        const quality = req.body.quality ? parseInt(req.body.quality) : 80;
        let pipeline = sharp(req.file.buffer).withMetadata(false);

        if (format === 'jpeg' || format === 'jpg') pipeline.jpeg({ quality, mozjpeg: true });
        else if (format === 'png') pipeline.png({ quality, compressionLevel: 9 });
        else if (format === 'webp') pipeline.webp({ quality, effort: 6 });

        const buffer = await pipeline.toBuffer();
        res.set({ 'Content-Type': `image/${format}`, 'Content-Disposition': `attachment; filename="converted.${format}"` });
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
