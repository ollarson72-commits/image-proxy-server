const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

// Главная страница - проверка что сервер работает
app.get('/', (req, res) => {
  res.send('🚀 Image Proxy Server is running! Use /download-image?url=... or /parse-product?url=...');
});

// Прокси для загрузки изображений
app.get('/download-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    console.log('📷 Downloading image:', imageUrl);
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'No URL provided' });
    }

    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    const imageBuffer = await response.buffer();

    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(imageBuffer);
    
    console.log('✅ Image downloaded successfully');
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to download image',
      details: error.message 
    });
  }
});

// ← НОВАЯ ФУНКЦИЯ ДЛЯ ПАРСИНГА ТОВАРОВ
app.get('/parse-product', async (req, res) => {
  try {
    const productUrl = req.query.url;
    const platform = req.query.platform || 'other';
    
    console.log('🛒 Parsing product:', { url: productUrl, platform });
    
    if (!productUrl) {
      return res.status(400).json({ error: 'No product URL provided' });
    }

    // ← ЗДЕСЬ БУДЕТ РЕАЛЬНЫЙ ПАРСИНГ
    // Пока возвращаем тестовые данные в зависимости от платформы
    const parsedData = await parseProductData(productUrl, platform);
    
    res.json(parsedData);
    console.log('✅ Product parsed successfully');
    
  } catch (error) {
    console.error('❌ Parse error:', error.message);
    res.status(500).json({ 
      error: 'Failed to parse product',
      details: error.message 
    });
  }
});

// ← ФУНКЦИЯ ДЛЯ ПАРСИНГА ДАННЫХ ТОВАРА
async function parseProductData(url, platform) {
  // Пока возвращаем тестовые данные в зависимости от платформы
  // В будущем здесь будет реальный парсинг
  
  const platformData = {
    wildberries: {
      title: `Wildberries Товар ${Math.random().toString(36).substring(7)}`,
      brand: 'WB Brand',
      sku: `WB${Math.floor(Math.random() * 1000000)}`,
      price: `${Math.floor(Math.random() * 5000) + 500} ₽`,
      oldPrice: `${Math.floor(Math.random() * 7000) + 1000} ₽`,
      sizes: 'S, M, L, XL',
      weight: '0.3 кг',
      material: 'Полиэстер 80%, Хлопок 20%',
      colors: 'Черный, Белый, Серый',
      kit: 'Товар в индивидуальной упаковке',
      description: 'Качественный товар с Wildberries с доставкой по всей России',
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300'
      ]
    },
    ozon: {
      title: `Ozon Товар ${Math.random().toString(36).substring(7)}`,
      brand: 'Ozon Brand',
      sku: `OZ${Math.floor(Math.random() * 1000000)}`,
      price: `${Math.floor(Math.random() * 3000) + 300} ₽`,
      oldPrice: `${Math.floor(Math.random() * 5000) + 800} ₽`,
      sizes: 'XS, S, M, L, XXL',
      weight: '0.4 кг',
      material: 'Хлопок 100%',
      colors: 'Синий, Красный, Зеленый',
      kit: 'Товар с гарантией от Ozon',
      description: 'Популярный товар с Ozon с быстрой доставкой',
      images: [
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300'
      ]
    },
    other: {
      title: `Товар с сайта ${Math.random().toString(36).substring(7)}`,
      brand: 'Unknown Brand',
      sku: `SKU${Math.floor(Math.random() * 1000000)}`,
      price: `${Math.floor(Math.random() * 10000) + 1000} ₽`,
      oldPrice: '',
      sizes: 'Универсальный',
      weight: '0.5 кг',
      material: 'Различные материалы',
      colors: 'Разные цвета',
      kit: 'Стандартная комплектация',
      description: 'Товар с внешнего сайта',
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300'
      ]
    }
  };

  // Возвращаем данные в зависимости от платформы
  return platformData[platform] || platformData.other;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Image proxy server running on port ${PORT}`);
  console.log(`📍 Main URL: http://localhost:${PORT}/`);
  console.log(`📷 Image proxy: http://localhost:${PORT}/download-image?url=IMAGE_URL`);
  console.log(`🛒 Product parser: http://localhost:${PORT}/parse-product?url=PRODUCT_URL&platform=wildberries`);
});
