require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const servertapPort = process.env.SERVERTAP_PORT;
const server_IP = process.env.SERVER_IP;
const key = process.env.HEADER_KEY;
const protocol = process.env.SERVERTAP_PROTOCOL
const dynmap = process.env.DYNMAP
const dynmapPort = process.env.DYNMAP_PORT
const dynmapProtocol = process.env.DYNMAP_PROTOCOL
const worldUUID = process.env.UUID
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

app.get('/config', (req, res) => {
    const configData = {
      server_IP, dynmap, dynmapPort, dynmapProtocol
    };
    res.json(configData);
  });

app.get('/server-data', async (req, res) => {
    try {
        const headers = {
            'Key': key,
        };

        // Fetch server data
        const serverResponse = await axios.get(`${protocol}://${server_IP}:${servertapPort}/v1/server`, {headers});
        const serverData = serverResponse.data;

        // Fetch player data
        const playersResponse = await axios.get(`${protocol}://${server_IP}:${servertapPort}/v1/players`, {headers});
        const playersData = playersResponse.data;


        const worldResponse = await axios.get(`${protocol}://${server_IP}:${servertapPort}/v1/worlds/${worldUUID}`, {headers});
        const worldData = worldResponse.data;

        // Combine server, player, and world data into a single object
        const combinedData = {
            motd: serverData.motd,
            weather: getWeatherStatus(worldData), // Pass worldData to getWeatherStatus function
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

app.get('/player', async (req, res) => {
    const uuid = req.query.uuid;

    try {
        const headers = {
            'Key': key,
        };
        // Make a request to your Minecraft server API with the UUID
        const response = await axios.get(`${protocol}://${server_IP}:${servertapPort}/v1/players/${uuid}`, { headers });
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

    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(uuid)) {
        return res.status(400).json({ error: 'Invalid UUID' });
    }

    const trimmedUUID = uuid.replace(/-/g, '');

    try {
        const response = await axios.get(`https://api.mojang.com/user/profile/${trimmedUUID}`);
        
        // Check if the response contains an 'id' and a 'name' (indicating a valid UUID)
        if (response.data.id && response.data.name) {
            res.json({ valid: true, playerInfo: response.data });
        } else {
            res.json({ valid: false });
        }
    } catch (error) {
        res.json({ valid: false });
    }
});

function getWeatherStatus(worldData) {
    if (worldData.storm && worldData.thundering) {
        return 'Thunder Storm';
    } else if (worldData.storm && !worldData.thundering) {
        return 'Storm';
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
const PORT = process.env.NODE_PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
