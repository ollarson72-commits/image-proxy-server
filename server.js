// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

// Функция парсинга с точными селекторами для маркетплейсов
async function parseProduct(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const hostname = new URL(url).hostname;

        let productData = {
            title: '',
            price: '',
            description: '',
            characteristics: [],
            images: []
        };

        // Wildberries
        if (hostname.includes('wildberries')) {
            productData.title = $('h1').first().text().trim() || $('[data-link="text{:productName^productName}"]').text().trim();
            productData.price = $('.price-block__final-price').text().trim() || $('.final-price').text().trim();
            productData.description = $('.pdp-description-text').text().trim() || $('.description-section').text().trim();
            
            // Характеристики Wildberries
            $('.product-params__item').each((i, elem) => {
                const name = $(elem).find('.product-params__label').text().trim();
                const value = $(elem).find('.product-params__value').text().trim();
                if (name && value) {
                    productData.characteristics.push({ name, value });
                }
            });

            // Изображения Wildberries
            $('.photo-zoom__preview').each((i, elem) => {
                let src = $(elem).attr('src');
                if (src) {
                    src = src.replace('//', 'https://');
                    productData.images.push(src);
                }
            });

        // Ozon
        } else if (hostname.includes('ozon')) {
            productData.title = $('h1').first().text().trim() || $('.ya1').text().trim();
            productData.price = $('[data-widget="webPrice"]').text().trim() || $('.ly1').text().trim();
            productData.description = $('[data-widget="webDescription"]').text().trim() || $('.qy1').text().trim();
            
            // Характеристики Ozon
            $('.w9k').each((i, elem) => {
                const name = $(elem).find('.w9k-d8').text().trim();
                const value = $(elem).find('.w9k-d9').text().trim();
                if (name && value) {
                    productData.characteristics.push({ name, value });
                }
            });

            // Изображения Ozon
            $('.jy1 img').each((i, elem) => {
                let src = $(elem).attr('src');
                if (src && src.includes('cdn1.ozone')) {
                    src = 'https:' + src;
                    productData.images.push(src);
                }
            });

        // Amazon
        } else if (hostname.includes('amazon')) {
            productData.title = $('#productTitle').text().trim() || $('h1.a-size-large').text().trim();
            productData.price = $('.a-price-whole').first().text().trim() || $('.a-price .a-offscreen').text().trim();
            productData.description = $('#productDescription').text().trim() || $('.product-description').text().trim();
            
            // Характеристики Amazon
            $('#productDetails_detailBullets_sections1 tr').each((i, elem) => {
                const name = $(elem).find('th').text().trim();
                const value = $(elem).find('td').text().trim();
                if (name && value) {
                    productData.characteristics.push({ name, value });
                }
            });

            // Изображения Amazon
            $('#altImages img').each((i, elem) => {
                let src = $(elem).attr('src');
                if (src) {
                    src = src.replace(/_SS40_|_SX38_/, '_SL1500_');
                    productData.images.push(src);
                }
            });

        // Универсальный парсер для других сайтов
        } else {
            productData.title = $('h1').first().text().trim() || $('.product-title').text().trim();
            productData.price = $('.price').first().text().trim() || $('.product-price').text().trim();
            productData.description = $('.product-description').text().trim() || $('.description').text().trim();
            
            // Универсальные характеристики
            $('table tr, .specifications li, .characteristics li').each((i, elem) => {
                const text = $(elem).text().trim();
                if (text.includes(':') || text.includes('—')) {
                    const separator = text.includes(':') ? ':' : '—';
                    const [name, value] = text.split(separator).map(s => s.trim());
                    if (name && value) {
                        productData.characteristics.push({ name, value });
                    }
                }
            });

            // Универсальные изображения
            $('.product-gallery img, .gallery img, [class*="image"] img').each((i, elem) => {
                let src = $(elem).attr('src') || $(elem).attr('data-src');
                if (src) {
                    if (src.startsWith('//')) src = 'https:' + src;
                    else if (src.startsWith('/')) src = new URL(src, url).href;
                    if (!src.startsWith('data:')) {
                        productData.images.push(src);
                    }
                }
            });
        }

        // Фильтрация и очистка данных
        productData.images = [...new Set(productData.images)].slice(0, 12); // Убираем дубликаты
        productData.characteristics = productData.characteristics.filter(char => 
            char.name && char.value && char.name.length < 100
        );

        return {
            success: true,
            data: productData
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
    console.log(`✅ Parser Studio Pro запущен на порту ${PORT}`);
});
