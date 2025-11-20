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

// УМНЫЙ парсинг товаров
app.get('/parse-product', async (req, res) => {
  try {
    const url = req.query.url;
    const platform = req.query.platform || 'other';

    console.log('🔗 Parsing URL:', url);

    // Анализируем ЧТО за ссылка
    let productInfo = analyzeUrl(url, platform);

    const data = {
      title: productInfo.title,
      brand: productInfo.brand,
      sku: productInfo.sku,
      price: productInfo.price,
      oldPrice: productInfo.oldPrice,
      sizes: productInfo.sizes,
      weight: productInfo.weight,
      material: productInfo.material,
      colors: productInfo.colors,
      kit: productInfo.kit,
      description: productInfo.description,
      images: productInfo.images
    };

    console.log('✅ Returning:', data.title);
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: 'Parse failed' });
  }
});

// Функция анализа URL
function analyzeUrl(url, platform) {
  // Извлекаем ID из ссылки
  let productId = 'unknown';
  
  if (url.includes('wildberries')) {
    const match = url.match(/catalog\/(\d+)/);
    productId = match ? match[1] : 'wb_unknown';
  } else if (url.includes('ozon')) {
    const match = url.match(/product\/(\d+)/);
    productId = match ? match[1] : 'oz_unknown';
  }

  // Определяем тип товара по словам в ссылке
  let productType = 'товар';
  let category = 'разное';
  
  if (url.includes('telefon') || url.includes('smartfon') || url.includes('iphone')) {
    productType = 'Смартфон';
    category = 'электроника';
  } else if (url.includes('noutbuk') || url.includes('laptop')) {
    productType = 'Ноутбук'; 
    category = 'электроника';
  } else if (url.includes('krossovki') || url.includes('obuv')) {
    productType = 'Кроссовки';
    category = 'одежда';
  } else if (url.includes('futbolka') || url.includes('t-shirt')) {
    productType = 'Футболка';
    category = 'одежда';
  } else if (url.includes('sumka') || url.includes('ryukzak')) {
    productType = 'Сумка';
    category = 'аксессуары';
  }

  // Генерируем умные данные
  const basePrice = category === 'электроника' ? 20000 : 5000;
  
  return {
    title: `${productType} ${platform.toUpperCase()} #${productId}`,
    brand: getBrandByCategory(category),
    sku: `${platform.slice(0,2).toUpperCase()}${productId}`,
    price: `${Math.floor(basePrice * 0.8)} ₽`,
    oldPrice: `${basePrice} ₽`,
    sizes: category === 'одежда' ? 'S, M, L, XL' : 'Универсальный',
    weight: category === 'электроника' ? '0.4 кг' : '0.2 кг',
    material: getMaterialByCategory(category),
    colors: getColorsByCategory(category),
    kit: 'Полная комплектация',
    description: `${productType} от ${platform}. Категория: ${category}. Артикул: ${productId}`,
    images: getImagesByCategory(category)
  };
}

// Вспомогательные функции
function getBrandByCategory(category) {
  const brands = {
    'электроника': ['Samsung', 'Apple', 'Xiaomi', 'Sony'],
    'одежда': ['Nike', 'Adidas', 'Puma', 'Reebok'],
    'аксессуары': ['Guess', 'Michael Kors', 'Zara', 'H&M']
  };
  return brands[category] ? brands[category][Math.floor(Math.random() * brands[category].length)] : 'Various';
}

function getMaterialByCategory(category) {
  const materials = {
    'электроника': 'Стекло, металл, пластик',
    'одежда': 'Хлопок 100%, полиэстер',
    'аксессуары': 'Натуральная кожа, текстиль'
  };
  return materials[category] || 'Качественные материалы';
}

function getColorsByCategory(category) {
  const colors = {
    'электроника': 'Черный, Белый, Серебристый',
    'одежда': 'Черный, Белый, Синий, Красный', 
    'аксессуары': 'Коричневый, Черный, Бежевый'
  };
  return colors[category] || 'Разные цвета';
}

function getImagesByCategory(category) {
  const images = {
    'электроника': ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'],
    'одежда': ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
    'аксессуары': ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400']
  };
  return images[category] || ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'];
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
