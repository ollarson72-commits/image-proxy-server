const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

// Главная страница - проверка что сервер работает
app.get('/', (req, res) => {
  res.send('Image Proxy Server is running!');
});

// Наш прокси для загрузки изображений
app.get('/download-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    console.log('Downloading image:', imageUrl);
    
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
    
    console.log('Image downloaded successfully');
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to download image',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Image proxy server running on port ${PORT}`);
  console.log(`📍 Test URL: http://localhost:${PORT}/`);
  console.log(`📷 Image proxy: http://localhost:${PORT}/download-image?url=IMAGE_URL`);
});
