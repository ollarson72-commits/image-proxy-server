// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Раздаем статические файлы

// Универсальная функция парсинга
async function parseProduct(url) {
    try {
        console.log('🔄 Парсим URL:', url);
        
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
                'Referer': 'https://www.google.com/'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(data);
        console.log('✅ HTML загружен');

        let productData = {
            title: '',
            price: '',
            description: '',
            characteristics: [],
            images: []
        };

        // УНИВЕРСАЛЬНЫЕ СЕЛЕКТОРЫ ДЛЯ ВСЕХ САЙТОВ
        productData.title = $('h1').first().text().trim() || 
                           $('[class*="title"]').first().text().trim() ||
                           $('title').text().split('|')[0].trim();

        productData.price = $('[class*="price"]').first().text().trim() ||
                           $('[class*="cost"]').first().text().trim() ||
                           'Цена не указана';

        productData.description = $('[class*="description"]').first().text().trim() ||
                                 $('[class*="about"]').first().text().trim() ||
                                 $('meta[name="description"]').attr('content') ||
                                 'Описание отсутствует';

        // ХАРАКТЕРИСТИКИ - универсальные
        $('table tr, dl, [class*="spec"] li, [class*="char"] li').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && (text.includes(':') || text.includes('—'))) {
                const separator = text.includes(':') ? ':' : '—';
                const parts = text.split(separator);
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const value = parts.slice(1).join(separator).trim();
                    if (name && value && name.length < 100) {
                        productData.characteristics.push({ name, value });
                    }
                }
            }
        });

        // ИЗОБРАЖЕНИЯ - универсальные
        $('img').each((i, elem) => {
            let src = $(elem).attr('src') || $(elem).attr('data-src');
            if (src) {
                // Преобразуем относительные ссылки в абсолютные
                if (src.startsWith('//')) {
                    src = 'https:' + src;
                } else if (src.startsWith('/')) {
                    const baseUrl = new URL(url).origin;
                    src = baseUrl + src;
                }
                
                // Фильтруем маленькие иконки и логотипы
                if (src && 
                    !src.includes('icon') && 
                    !src.includes('logo') && 
                    !src.includes('sprite') &&
                    !src.startsWith('data:') &&
                    (src.includes('product') || 
                     src.includes('goods') || 
                     $(elem).attr('alt')?.toLowerCase().includes('product') ||
                     src.match(/\.(jpg|jpeg|png|webp)$/i))) {
                    productData.images.push(src);
                }
            }
        });

        // Ограничиваем количество изображений и убираем дубликаты
        productData.images = [...new Set(productData.images)].slice(0, 8);

        console.log('✅ Данные получены:', {
            title: productData.title?.substring(0, 50),
            price: productData.price,
            characteristics: productData.characteristics.length,
            images: productData.images.length
        });

        return {
            success: true,
            data: productData
        };
        
    } catch (error) {
        console.error('❌ Ошибка парсинга:', error.message);
        return {
            success: false,
            error: `Не удалось получить данные: ${error.message}`
        };
    }
}

// Маршрут для парсинга
app.post('/parse', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ 
            success: false, 
            error: 'URL обязателен' 
        });
    }

    try {
        console.log('📨 Получен запрос для:', url);
        const result = await parseProduct(url);
        res.json(result);
    } catch (error) {
        console.error('💥 Серверная ошибка:', error);
        res.status(500).json({ 
            success: false, 
            error: `Внутренняя ошибка сервера: ${error.message}` 
        });
    }
});

// Корневой маршрут
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Parser Studio Pro.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Parser Studio Pro запущен: http://localhost:${PORT}`);
    console.log(`✅ Сервер готов к работе!`);
});
