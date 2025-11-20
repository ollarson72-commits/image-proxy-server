// server.js
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const genAI = new GoogleGenerativeAI("AIzaSyCFpT1bxjLywPBfol1g3mrGVAUQjlEfHwA");

app.post('/parse', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.json({ success: false, error: 'URL обязателен' });
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { temperature: 0.3, maxOutputTokens: 4000 }
        });

        const prompt = `
Проанализируй товар по ссылке и верни данные в JSON формате.

Ссылка: ${url}

Структура JSON:
{
    "title": "название",
    "price": "цена в рублях", 
    "description": "описание",
    "characteristics": [{"name": "характеристика", "value": "значение"}],
    "images": ["url_фото"]
}

Только JSON, без лишнего текста. Русский язык.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const productData = JSON.parse(jsonMatch[0]);
            res.json({ success: true, data: productData });
        } else {
            throw new Error('AI не вернул JSON');
        }

    } catch (error) {
        console.error('Ошибка:', error);
        res.json({ success: false, error: 'Ошибка анализа: ' + error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/parser.html');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Parser Studio Pro запущен: http://localhost:${PORT}`);
});
