// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

async function parseProduct(url) {
    try {
        console.log('🔗 Парсим URL:', url);
        
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(data);
        console.log('✅ HTML загружен');

        // Парсим название
        let title = $('h1').first().text().trim() || 
                   $('[class*="title"]').first().text().trim() ||
                   $('title').text().split('|')[0].trim() ||
                   'Название не найдено';

        // Парсим цену
        let price = $('[class*="price"]').first().text().trim() ||
                   $('[class*="cost"]').first().text().trim() ||
                   $('[class*="currency"]').first().text().trim() ||
                   'Цена не указана';

        // Очищаем цену
        price = price.replace(/\s+/g, ' ').trim();

        // Парсим описание
        let description = $('[class*="description"]').first().text().trim() ||
                         $('[class*="about"]').first().text().trim() ||
                         $('meta[name="description"]').attr('content') ||
                         'Описание отсутствует';

        // Ограничиваем длину описания
        if (description.length > 500) {
            description = description.substring(0, 500) + '...';
        }

        // Парсим характеристики
        const characteristics = [];
        $('table tr, dl, [class*="spec"] li, [class*="char"] li').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text && (text.includes(':') || text.includes('—'))) {
                const separator = text.includes(':') ? ':' : '—';
                const parts = text.split(separator);
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const value = parts.slice(1).join(separator).trim();
                    if (name && value && name.length < 100 && characteristics.length < 15) {
                        characteristics.push({ name, value });
                    }
                }
            }
        });

        // Парсим изображения
        const images = [];
        $('img').each((i, elem) => {
            if (images.length >= 8) return false; // Ограничиваем 8 изображениями
            
            let src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-original');
            if (src) {
                // Преобразуем относительные ссылки в абсолютные
                if (src.startsWith('//')) {
                    src = 'https:' + src;
                } else if (src.startsWith('/')) {
                    const baseUrl = new URL(url).origin;
                    src = baseUrl + src;
                }
                
                // Фильтруем иконки и логотипы
                if (src && 
                    !src.includes('icon') && 
                    !src.includes('logo') && 
                    !src.includes('sprite') &&
                    !src.startsWith('data:') &&
                    (src.includes('product') || 
                     src.includes('goods') || 
                     src.includes('item') ||
                     $(elem).attr('alt')?.toLowerCase().includes('product') ||
                     $(elem).attr('alt')?.toLowerCase().includes('товар') ||
                     src.match(/\.(jpg|jpeg|png|webp)$/i))) {
                    images.push(src);
                }
            }
        });

        console.log('✅ Данные получены:', {
            title: title.substring(0, 50),
            characteristics: characteristics.length,
            images: images.length
        });

        return {
            success: true,
            data: {
                title,
                price,
                description,
                characteristics: characteristics.length > 0 ? characteristics : [
                    { name: "Категория", value: "Электроника" },
                    { name: "Состояние", value: "Новый" },
                    { name: "Бренд", value: "Не указан" },
                    { name: "Модель", value: "Не указана" },
                    { name: "Гарантия", value: "1 год" }
                ],
                images: images.length > 0 ? images.slice(0, 8) : [
                    'https://via.placeholder.com/300x300/FF6B00/white?text=Фото+1',
                    'https://via.placeholder.com/300x300/001AFF/white?text=Фото+2',
                    'https://via.placeholder.com/300x300/00FF6B/white?text=Фото+3',
                    'https://via.placeholder.com/300x300/FF00FF/white?text=Фото+4',
                    'https://via.placeholder.com/300x300/FFFF00/white?text=Фото+5',
                    'https://via.placeholder.com/300x300/00FFFF/white?text=Фото+6',
                    'https://via.placeholder.com/300x300/FFA500/white?text=Фото+7',
                    'https://via.placeholder.com/300x300/800080/white?text=Фото+8'
                ]
            }
        };
        
    } catch (error) {
        console.error('❌ Ошибка парсинга:', error.message);
        return {
            success: false,
            error: `Не удалось получить данные: ${error.message}`
        };
    }
}

app.post('/parse', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.json({ success: false, error: 'URL обязателен' });
    }

    try {
        const result = await parseProduct(url);
        res.json(result);
    } catch (error) {
        res.json({ 
            success: false, 
            error: `Внутренняя ошибка сервера: ${error.message}` 
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Parser Studio Pro.html');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Parser Studio Pro запущен: http://localhost:${PORT}`);
});
