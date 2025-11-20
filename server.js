// server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/parse', async (req, res) => {
    const { url } = req.body;
    
    console.log('Получен URL:', url);
    
    // Всегда возвращаем тестовые данные
    const testData = {
        success: true,
        data: {
            title: "Смартфон Xiaomi Redmi Note 13 Pro 8/256GB",
            price: "25 990 ₽",
            description: "Смартфон с AMOLED дисплеем 6.67 разрешением 2712x1220 пикселей, частотой обновления 120 Гц. Процессор Snapdragon 7s Gen 2, основная камера 200 МП с OIS, аккумулятор 5000 мАч с быстрой зарядкой 67 Вт.",
            characteristics: [
                { name: "Бренд", value: "Xiaomi" },
                { name: "Модель", value: "Redmi Note 13 Pro" },
                { name: "Экран", value: '6.67" AMOLED, 120 Гц' },
                { name: "Процессор", value: "Snapdragon 7s Gen 2" },
                { name: "Память", value: "8 ГБ ОЗУ / 256 ГБ ПЗУ" },
                { name: "Камера", value: "200 МП + 8 МП + 2 МП" },
                { name: "Батарея", value: "5000 мАч" },
                { name: "Зарядка", value: "67 Вт" }
            ],
            images: [
                "https://via.placeholder.com/400x400/FF6B00/white?text=Фото+1",
                "https://via.placeholder.com/400x400/001AFF/white?text=Фото+2",
                "https://via.placeholder.com/400x400/00FF6B/white?text=Фото+3"
            ]
        }
    };

    console.log('Возвращаем тестовые данные');
    res.json(testData);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/parser.html');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Parser Studio Pro запущен: http://localhost:${PORT}`);
});
