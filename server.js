const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

// Главная страница
app.get('/', (req, res) => {
  res.send('🚀 Server is working!');
});

// Загрузка изображений
app.get('/download-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({ error: 'No URL' });
    }

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Fetch failed');

    const contentType = response.headers.get('content-type');
    const buffer = await response.buffer();

    res.set('Content-Type', contentType);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

// Парсинг товаров - ПРОСТАЯ ВЕРСИЯ
app.get('/parse-product', async (req, res) => {
  try {
    const url = req.query.url;
    const platform = req.query.platform || 'other';

    // Простые данные для всех платформ
    const data = {
      title: `Товар с ${platform}`,
      brand: platform.toUpperCase(),
      sku: `${platform.toUpperCase()}${Math.floor(Math.random() * 10000)}`,
      price: `${Math.floor(Math.random() * 10000) + 500} ₽`,
      oldPrice: `${Math.floor(Math.random() * 15000) + 10000} ₽`,
      sizes: 'S, M, L, XL',
      weight: '0.3 кг',
      material: 'Качественные материалы',
      colors: 'Разные цвета',
      kit: 'Полная комплектация',
      description: `Описание товара с ${platform}. Ссылка: ${url}`,
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'
      ]
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Parse failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
