const express = require('express');
const {Ollama} = require('ollama');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json({ limit: '50mb' })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase URL-encoded payload limit

const ollama = new Ollama(({host: 'http://localhost:11434'}));
const fs = require('fs');

app.post('/create-model', async (req, res) => {
    const {model, modelfile} = req.body;
    try {
        await ollama.create({model, modelfile});
        res.json({status: 'success'});
    } catch (error) {
        res.status(500).json({status: 'error', message: error.message});
    }
});

app.post('/chat', async (req, res) => {
    const {prompt} = req.body;
    const modelName = req.headers['x-model-name'];
    if (!modelName) {
        res.status(400).json({status: 'error', message: 'Model name is required in the x-model-name header'});
        return;
    }
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                prompt: prompt,
                format: "json",
                stream: false
            }),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({status: 'error', message: error.message});
    }
});

app.post('/chat-image', async (req, res) => {
    const { prompt, image } = req.body;
    const modelName = req.headers['x-model-name'];
    if (!modelName) {
        res.status(400).json({status: 'error', message: 'Model name is required in the x-model-name header'});
        return;
    }
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                prompt: prompt,
                stream: false,
                images: image
            }),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({status: 'error', message: error.message});
    }
});

app.post('/save-response', (req, res) => {
    const { response, file} = req.body;
    fs.writeFile(file, JSON.stringify(response), (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: err.message });
        } else {
            res.json({ status: 'success', message: 'The file has been saved!' });
        }
    });
});

app.get('/read-response/:filename', (req, res) => {
    const filename = req.params.filename;
    fs.readFile(`${filename}.json`, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: err.message });
        } else {
            try {
                const jsonData = JSON.parse(data);
                res.json({ status: 'success', data: jsonData });
            } catch (error) {
                res.json({ status: 'error', message: 'File is empty' });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});