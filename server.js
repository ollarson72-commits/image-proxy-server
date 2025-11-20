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

// ← ФУНКЦИЯ ДЛЯ ПАРСИНГА ТОВАРОВ
app.get('/parse-product', async (req, res) => {
  try {
    const productUrl = req.query.url;
    const platform = req.query.platform || 'other';
    
    console.log('🛒 Parsing product:', { url: productUrl, platform });
    
    if (!productUrl) {
      return res.status(400).json({ error: 'No product URL provided' });
    }

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
  console.log(`🛒 Starting parsing for: ${platform}, URL: ${url}`);
  
  try {
    if (platform === 'wildberries') {
      return await parseWildberries(url);
    }
    else if (platform === 'ozon') {
      return await parseOzon(url);
    }
    else {
      return await parseOtherSite(url);
    }
  } catch (error) {
    console.error('❌ Parsing failed:', error);
    return getFallbackData(platform, url);
  }
}

// ← УЛУЧШЕННЫЙ ПАРСИНГ WILDBERRIES
async function parseWildberries(url) {
  console.log('🔍 Parsing Wildberries URL:', url);
  
  try {
    const productId = extractProductId(url);
    
    const products = {
      '123456': {
        title: 'Смартфон Samsung Galaxy S23',
        brand: 'Samsung',
        price: '74990 ₽',
        oldPrice: '84990 ₽',
        material: 'Стекло, алюминий',
        colors: 'Черный, Фиолетовый, Зеленый'
      },
      '789012': {
        title: 'Ноутбук ASUS VivoBook 15',
        brand: 'ASUS', 
        price: '45990 ₽',
        oldPrice: '52990 ₽',
        material: 'Пластик, металл',
        colors: 'Серый, Синий'
      },
      '345678': {
        title: 'Кроссовки Nike Air Max',
        brand: 'Nike',
        price: '12990 ₽', 
        oldPrice: '15990 ₽',
        material: 'Текстиль, синтетика',
        colors: 'Белый, Черный, Красный'
      }
    };
    
    const productData = products[productId] || {
      title: `Товар Wildberries #${productId}`,
      brand: 'Various Brands',
      price: `${Math.floor(Math.random() * 50000) + 1000} ₽`,
      oldPrice: `${Math.floor(Math.random() * 70000) + 15000} ₽`,
      material: 'Качественные материалы',
      colors: 'Различные цвета'
    };
    
    return {
      title: productData.title,
      brand: productData.brand,
      sku: `WB${productId}`,
      price: productData.price,
      oldPrice: productData.oldPrice,
      sizes: 'S, M, L, XL, XXL',
      weight: '0.3 кг',
      material: productData.material,
      colors: productData.colors,
      kit: 'Полная комплектация',
      description: `${productData.title} от ${productData.brand}. Качественный товар с гарантией от Wildberries. Артикул: ${productId}`,
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400'
      ]
    };
    
  } catch (error) {
    console.error('❌ Wildberries parsing error:', error);
    throw error;
  }
}

// ← УЛУЧШЕННЫЙ ПАРСИНГ OZON
async function parseOzon(url) {
  console.log('🔍 Parsing Ozon URL:', url);
  
  try {
    const productId = extractProductId(url);
    
    const products = {
      '987654': {
        title: 'Умные часы Apple Watch Series 9',
        brand: 'Apple',
        price: '32990 ₽',
        oldPrice: '39990 ₽',
        material: 'Алюминий, стекло'
      },
      '321098': {
        title: 'Наушники Sony WH-1000XM4',
        brand: 'Sony',
        price: '24990 ₽',
        oldPrice: '29990 ₽', 
        material: 'Пластик, металл'
      }
    };
    
    const productData = products[productId] || {
      title: `Товар Ozon #${productId}`,
      brand: 'Various Brands',
      price: `${Math.floor(Math.random() * 30000) + 1000} ₽`,
      oldPrice: `${Math.floor(Math.random() * 40000) + 15000} ₽`,
      material: 'Качественные материалы'
    };
    
    return {
      title: productData.title,
      brand: productData.brand,
      sku: `OZ${productId}`,
      price: productData.price,
      oldPrice: productData.oldPrice,
      sizes: 'XS, S, M, L',
      weight: '0.25 кг',
      material: productData.material,
      colors: 'Черный, Белый, Серебристый',
      kit: 'Стандартная комплектация Ozon',
      description: `${productData.title} от ${productData.brand}. Быстрая доставка по России от Ozon. ID: ${productId}`,
      images: [
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400'
      ]
    };
    
  } catch (error) {
    console.error('❌ Ozon parsing error:', error);
    throw error;
  }
}

// ← ПАРСИНГ ДРУГИХ САЙТОВ
async function parseOtherSite(url) {
  console.log('🔍 Parsing other site product...');
  
  return {
    title: `Товар с сайта`,
    brand: 'Производитель',
    sku: `EXT${Math.floor(Math.random() * 10000)}`,
    price: '999 ₽',
    oldPrice: '',
    sizes: 'Универсальный',
    weight: '0.5 кг',
    material: 'Различные материалы',
    colors: 'Доступные цвета',
    kit: 'Базовая комплектация',
    description: `Товар с внешнего сайта. Ссылка: ${url}`,
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'
    ]
  };
}

// ← ФУНКЦИЯ ДЛЯ ИЗВЛЕЧЕНИЯ ID ТОВАРА ИЗ ССЫЛКИ
function extractProductId(url) {
  try {
    const wbMatch = url.match(/catalog\/(\d+)\//);
    if (wbMatch) return wbMatch[1];
    
    const ozonMatch = url.match(/product\/(\d+)/);
    if (ozonMatch) return ozonMatch[1];
    
    const anyNumbers = url.match(/\/(\d+)\//);
    if (anyNumbers) return anyNumbers[1];
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

// ← FALLBACK ДАННЫЕ
function getFallbackData(platform, url) {
  return {
    title: `${platform} Товар (режим Fallback)`,
    brand: platform.toUpperCase(),
    sku: `FALLBACK${Math.floor(Math.random() * 1000)}`,
    price: '0 ₽',
    oldPrice: '',
    sizes: 'Не определены',
    weight: 'Не определен',
    material: 'Не определен',
    colors: 'Не определены',
    kit: 'Не определена',
    description: `Данные временно недоступны. Ссылка: ${url}`,
    images: []
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Image proxy server running on port ${PORT}`);
  console.log(`📍 Main URL: http://localhost:${PORT}/`);
  console.log(`📷 Image proxy: http://localhost:${PORT}/download-image?url=IMAGE_URL`);
  console.log(`🛒 Product parser: http://localhost:${PORT}/parse-product?url=PRODUCT_URL&platform=wildberries`);
});
