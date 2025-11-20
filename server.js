const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Простой тестовый endpoint
app.post('/parse', async (req, res) => {
    const { url } = req.body;
    
    console.log('📨 Получен запрос для URL:', url);
    
    if (!url) {
        return res.json({ 
            success: false, 
            error: 'URL обязателен' 
        });
    }

    try {
        // ВРЕМЕННО: возвращаем тестовые данные вместо реального парсинга
        const testData = {
            success: true,
            data: {
                title: 'Тестовый товар - Смартфон Xiaomi Redmi Note 13 Pro',
                price: '25 990 ₽',
                description: 'Смартфон с AMOLED дисплеем 6.67", процессором Snapdragon 7s Gen 2 и камерой 200 МП. Отличное соотношение цены и качества.',
                characteristics: [
                    { name: 'Бренд', value: 'Xiaomi' },
                    { name: 'Модель', value: 'Redmi Note 13 Pro' },
                    { name: 'Экран', value: '6.67" AMOLED' },
                    { name: 'Процессор', value: 'Snapdragon 7s Gen 2' },
                    { name: 'Память', value: '8GB/256GB' },
                    { name: 'Камера', value: '200 МП + 8 МП + 2 МП' },
                    { name: 'Батарея', value: '5000 мАч' },
                    { name: 'Цвет', value: 'Черный' }
                ],
                images: [
                    'https://via.placeholder.com/400x400/FF6B00/white?text=Фото+1',
                    'https://via.placeholder.com/400x400/001AFF/white?text=Фото+2',
                    'https://via.placeholder.com/400x400/00FF6B/white?text=Фото+3'
                ]
            }
        };

        console.log('✅ Возвращаем тестовые данные');
        res.json(testData);

    } catch (error) {
        console.error('❌ Ошибка:', error);
        res.json({ 
            success: false, 
            error: 'Технические работы. Попробуйте позже.' 
        });
    }
});

// Корневой маршрут
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/parser.html');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`✅ Готов к работе!`);
});
