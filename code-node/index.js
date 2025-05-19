const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const app = express();
const upload = multer({ dest: 'upload/' });

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'License Plate Detection',
        detections: null,
        imageBase64: null,
        showResults: false
    });
});

app.post('/upload', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).render('index', {
                title: 'License Plate Detection',
                error: 'No file uploaded',
                detections: null,
                imageBase64: null,
                showResults: false
            });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        const response = await axios.post('http://localhost:8000/detect', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        console.log(response.data.results);

        if (!response.data || !response.data.results || !response.data.image_with_boxes) {
            throw new Error('Invalid response from FastAPI server');
        }

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const imageBase64 = hexToBase64(response.data.image_with_boxes);

        res.render('index', {
            title: 'License Plate Detection',
            detections: response.data.results,
            imageBase64: imageBase64,
            error: null,
            showResults: true
        });
    } catch (error) {
        console.error('Error:', error.message);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).render('index', {
            title: 'License Plate Detection',
            error: 'Error occurred while processing the image: ' + error.message,
            detections: null,
            imageBase64: null,
            showResults: false
        });
    }
});

function hexToBase64(hexString) {
    const bytes = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return Buffer.from(bytes).toString('base64');
}

app.listen(3000, () => console.log('Node.js server running on port 3000'));