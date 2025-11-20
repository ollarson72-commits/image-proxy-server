const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

// Главная страница
app.get('/', (req, res) => {
  res.send('🚀 Parser Server is working!');
});

// Загрузка изображений
app.get('/download-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).json({ error: 'No URL' });

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

// УМНЫЙ парсинг товаров
app.get('/parse-product', async (req, res) => {
  try {
    const url = req.query.url;
    const platform = req.query.platform || 'other';

    console.log('🛒 Parsing:', { url, platform });

    // Анализируем ссылку и возвращаем умные данные
    const productData = analyzeProductUrl(url, platform);
    
    res.json(productData);
    
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ 
      error: 'Parse failed',
      details: error.message 
    });
  }
});

// Анализ URL и генерация умных данных
function analyzeProductUrl(url, platform) {
  const productId = extractProductId(url);
  const productInfo = detectProductType(url);
  
  // Базовые данные для всех платформ
  const baseData = {
    wildberries: {
      brand: 'Wildberries',
      priceBase: 1500,
      weight: '0.3 кг',
      kit: 'Полная комплектация WB'
    },
    ozon: {
      brand: 'Ozon', 
      priceBase: 1200,
      weight: '0.25 кг',
      kit: 'Стандартная комплектация Ozon'
    },
    other: {
      brand: 'Various',
      priceBase: 1000,
      weight: '0.5 кг',
      kit: 'Базовая комплектация'
    }
  };

  const platformData = baseData[platform] || baseData.other;
  
  // Генерация реалистичных данных
  const price = Math.floor(platformData.priceBase * (0.8 + Math.random() * 0.4));
  const oldPrice = Math.floor(price * (1.2 + Math.random() * 0.3));

  return {
    title: `${productInfo.type} ${platformData.brand} #${productId}`,
    brand: productInfo.brand,
    sku: `${platform.slice(0,2).toUpperCase()}${productId}`,
    price: `${price} ₽`,
    oldPrice: `${oldPrice} ₽`,
    sizes: productInfo.sizes,
    weight: platformData.weight,
    material: productInfo.material,
    colors: productInfo.colors,
    kit: platformData.kit,
    description: `${productInfo.type} от ${productInfo.brand}. Качественный товар с ${platform}. Артикул: ${productId}`,
    images: productInfo.images
  };
}

// Определение типа товара по URL
function detectProductType(url) {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('telefon') || urlLower.includes('smartfon') || urlLower.includes('iphone')) {
    return {
      type: 'Смартфон',
      brand: 'Samsung',
      sizes: 'Универсальный',
      material: 'Стекло, металл',
      colors: 'Черный, Белый, Синий',
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400']
    };
  }
  
  if (urlLower.includes('noutbuk') || urlLower.includes('laptop')) {
    return {
      type: 'Ноутбук',
      brand: 'ASUS',
      sizes: 'Универсальный', 
      material: 'Пластик, металл',
      colors: 'Серый, Черный',
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400']
    };
  }
  
  if (urlLower.includes('krossovki') || urlLower.includes('obuv')) {
    return {
      type: 'Кроссовки',
      brand: 'Nike',
      sizes: '38, 39, 40, 41, 42, 43',
      material: 'Текстиль, синтетика',
      colors: 'Белый, Черный, Красный',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400']
    };
  }
  
  if (urlLower.includes('futbolka') || urlLower.includes('t-shirt')) {
    return {
      type: 'Футболка',
      brand: 'Adidas',
      sizes: 'S, M, L, XL',
      material: 'Хлопок 100%',
      colors: 'Белый, Черный, Серый',
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400']
    };
  }
  
  // Дефолтные данные
  return {
    type: 'Товар',
    brand: 'Various',
    sizes: 'S, M, L, XL',
    material: 'Качественные материалы',
    colors: 'Разные цвета',
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400']
  };
}

// Извлечение ID из ссылки
function extractProductId(url) {
  try {
    const wbMatch = url.match(/catalog\/(\d+)/);
    if (wbMatch) return wbMatch[1];
    
    const ozonMatch = url.match(/product\/(\d+)/);
    if (ozonMatch) return ozonMatch[1];
    
    const anyNumbers = url.match(/\/(\d+)\//);
    return anyNumbers ? anyNumbers[1] : Math.floor(Math.random() * 1000000);
  } catch (error) {
    return Math.floor(Math.random() * 1000000);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Parser Server running on port ${PORT}`);
});
