const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Proxy endpoint for playlist items
app.get('/api/playlist', async (req, res) => {
  try {
    const { playlistId, nextPageToken } = req.query;
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        part: 'contentDetails',
        maxResults: 50,
        playlistId,
        key: process.env.YOUTUBE_API_KEY,
        pageToken: nextPageToken || ''
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for video durations
app.get('/api/videos', async (req, res) => {
  try {
    const { videoIds } = req.query;
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails',
        id: videoIds,
        key: process.env.YOUTUBE_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));