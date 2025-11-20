// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

// Функция парсинга товара
async function parseProduct(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(data);
        
        // Парсим основные данные (универсальные селекторы)
        const title = $('h1, [class*="title"], [class*="name"]').first().text().trim();
        const price = $('[class*="price"], [class*="cost"]').first().text().trim();
        const description = $('[class*="description"], [class*="about"]').first().text().trim();
        
        // Парсим характеристики
        const characteristics = [];
        $('[class*="characteristics"], [class*="specifications"] li, tr').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && text.includes(':')) {
                const [name, value] = text.split(':').map(s => s.trim());
                characteristics.push({ name, value });
            }
        });
        
        // Парсим изображения
        const images = [];
        $('img[src*="product"], img[alt*="product"], [class*="gallery"] img').each((i, elem) => {
            let src = $(elem).attr('src');
            if (src && !src.startsWith('data:')) {
                if (src.startsWith('//')) src = 'https:' + src;
                else if (src.startsWith('/')) src = new URL(src, url).href;
                images.push(src);
            }
        });
        
        return {
            success: true,
            data: {
                title: title || 'Не удалось определить название',
                price: price || 'Цена не указана',
                description: description || 'Описание отсутствует',
                characteristics: characteristics.length ? characteristics : [{name: 'Характеристики', value: 'Не найдены'}],
                images: images.slice(0, 10) // Берем первые 10 изображений
            }
        };
        
    } catch (error) {
        return {
            success: false,
            error: `Ошибка парсинга: ${error.message}`
        };
    }
}

// Маршрут для парсинга
app.post('/parse', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ success: false, error: 'URL обязателен' });
    }
    
    try {
        const result = await parseProduct(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: `Серверная ошибка: ${error.message}` 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Parser Studio Pro запущен на порту ${PORT}`);
});
