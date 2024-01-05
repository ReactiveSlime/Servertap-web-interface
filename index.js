require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const SERVERTAP_PORT = process.env.SERVERTAP_PORT;
const SERVER_IP = process.env.SERVER_IP;
const key = process.env.HEADER_KEY;
const Protocol = process.env.SERVERTAP_PROTOCOL

// Function to convert seconds to a readable time format (HH:MM:SS)
function secondsToHms(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// Function to convert bytes to gigabytes
function bytesToGB(bytes) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

app.get('/server-data', async (req, res) => {
    try {
        const headers = {
            'Key': key,
        };

        // Fetch server data
        const serverResponse = await axios.get(`${Protocol}://${SERVER_IP}:${SERVERTAP_PORT}/v1/server`, { headers });
        const serverData = serverResponse.data;

        // Fetch player data
        const playersResponse = await axios.get(`${Protocol}://${SERVER_IP}:${SERVERTAP_PORT}/v1/players`, { headers });
        const playersData = playersResponse.data;

        // Combine server and player data into a single object
        const combinedData = {
            motd: serverData.motd,
            weather: getWeatherStatus(), // Implement getWeatherStatus() based on weather data
            tps: serverData.tps,
            uptime: secondsToHms(serverData.health.uptime),
            freeMemoryGB: bytesToGB(serverData.health.freeMemory),
            maxMemoryGB: bytesToGB(serverData.health.maxMemory),
            onlinePlayers: playersData
        };

        res.json(combinedData);
    } catch (error) {
        console.error('Failed to fetch data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});


app.get('/players', async (req, res) => {
    try {
        const headers = {
            'Key': key,
        };

        const playersResponse = await axios.get(`${Protocol}://${SERVER_IP}/players`, { headers });
        const playersData = playersResponse.data;

        res.json(playersData);
    } catch (error) {
        console.error('Failed to fetch player data:', error);
        res.status(500).json({ error: 'Failed to fetch player data' });
    }
});

app.get('/player', async (req, res) => {
    const uuid = req.query.uuid;

    try {
        const headers = {
            'Key': key,
        };
        // Make a request to your Minecraft server API with the UUID
        const response = await axios.get(`${Protocol}://${SERVER_IP}:${SERVERTAP_PORT}/v1/players/${uuid}`, { headers });
        // Extract the player info from the response
        const playerInfo = response.data;

        // Send the player info to the client as a JSON response
        res.json(playerInfo);
    } catch (error) {
        console.error('Error fetching player info:', error);
        res.status(500).json({ error: 'Failed to fetch player info' });
    }
});

// Proxy endpoint to forward requests to Mojang API
app.get('/mojang-api', async (req, res) => {
    const { uuid } = req.query;
    const trimmedUUID = uuid.replace(/-/g, '');
  
    try {
      const response = await axios.get(`https://api.mojang.com/user/profile/${trimmedUUID}`);
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching data from Mojang API:', error.message);
      res.status(500).json({ error: 'Failed to fetch data from Mojang API' });
    }
  });

function getWeatherStatus(isStorm, isThundering) {
    if (isThundering) {
        return 'Thunder';
    } else if (isStorm) {
        return 'Rain';
    } else {
        return 'Clear';
    }
}

// Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Start the server
const PORT = process.env.NODE_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
