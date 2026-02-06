const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// 1. Configure Multer for temporary storage
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use timestamp to prevent name collisions
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 2. Define the route
router.post('/analyze-blood', upload.single('file'), async (req, res) => {
    // Check if file is present
    if (!req.file) {
        return res.status(400).json({ error: 'Lütfen bir resim dosyası yükleyin.' });
    }

    const filePath = req.file.path;

    try {
        // Prepare form data for the Python service
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        // 3. Send POST request to Python AI Service
        // Assuming Python service is running on port 8000
        const pythonServiceUrl = 'http://127.0.0.1:8000/analyze';
        
        const response = await axios.post(pythonServiceUrl, formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxBodyLength: Infinity, // Allow large files
            maxContentLength: Infinity
        });

        // 4. Return the result from Python service to the client
        res.json(response.data);

    } catch (error) {
        console.error('AI Service Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ error: 'AI Servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.' });
        } else if (error.response) {
            // Error returned from the Python service (e.g., 400, 500)
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Kan tahlili analizi sırasında bir hata oluştu.' });
        }

    } finally {
        // 5. Cleanup: Delete the temporary file
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Error deleting temp file ${filePath}:`, err);
            });
        }
    }
});

module.exports = router;
