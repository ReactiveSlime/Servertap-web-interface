let validUUID = false; // Flag to track UUID validation

// Get the server IP and Dynmap bool from the .env file
fetch('/config')
  .then(response => response.json())
  .then(config => {
    serverIP = config.server_IP
    dynmap = config.dynmap
    dynmapPort = config.dynmapPort
    dynmapProtocol = config.dynmapProtocol
  })
  .catch(error => console.error('Error fetching config data:', error));


async function fetchPlayerInfo(uuid) {
    try {
        const response = await fetch(`/mojang-api?uuid=${uuid}`);
        const playerInfo = await response.json();

        // Check if UUID is valid (only check once)
        if (!validUUID && playerInfo.valid) {
            validUUID = true;
            displayPlayerInfo(playerInfo);
        } else if (!playerInfo.valid) {
            console.error('Invalid UUID');
        }

        // Always update player info
        const playerResponse = await fetch(`/player?uuid=${uuid}`);
        const playerData = await playerResponse.json();
        displayPlayerInfo(playerData);
    } catch (error) {
        console.error('Error fetching player info:', error);
    }
}

function displayPlayerInfo(playerInfo) {
    const playerInfoDiv = document.getElementById('playerInfo');
    playerInfoDiv.innerHTML = ''; // Clear previous content

    const playerName = `Player Name: ${playerInfo.displayName}`;
    const playerHealth = `Health: ${Math.ceil(playerInfo.health)} ❤️`;
    const playerHunger = `Hunger: ${Math.ceil(playerInfo.hunger)} 🍗`;

    // Check if playerInfo.location exists before attempting to destructure
    const playerLocation = playerInfo.location ? `Location: X: ${playerInfo.location[0].toFixed(1)}, Y: ${playerInfo.location[1].toFixed(1)}, Z: ${playerInfo.location[2].toFixed(1)}` : 'Location: Unknown';

    const usernameDiv = document.getElementById('player-name');
    usernameDiv.textContent = playerName;

    let dimensionText;
    let dimensionMap;
    const playerDimension = playerInfo.dimension;
    switch (playerDimension) {
        case "NORMAL":
            dimensionText = "Overworld";
            dimensionMap = "world";
            break;
        case "NETHER":
            dimensionText = "Nether";
            dimensionMap = "world_nether";
            break;
        case "THE_END":
            dimensionText = "End";
            dimensionMap = "world_the_end";
            break;
        default:
            dimensionText = "Unknown";
            dimensionMap = "Unknown";
    }

    playerInfoDiv.innerHTML += `
    <div class="player-dimension">In The ${dimensionText} Dimension</div>
    <div class="player-health">${playerHealth}</div>
    <div class="player-hunger">${playerHunger}</div>
    <div class="player-location">${playerLocation}</div>
    <div class="player-map"></div>
    `;

    // Code to display the player's location using dynmap
    if (dynmap) {
        const playerLocationX = playerInfo.location[0].toFixed(0);
        const playerLocationY = playerInfo.location[1].toFixed(0);
        const playerLocationZ = playerInfo.location[2].toFixed(0);
        const mapURL = `${dynmapProtocol}://${serverIP}:${dynmapPort}/?worldname=${dimensionMap}&mapname=flat&zoom=0&x=${playerLocationX}&y=${playerLocationY}&z=${playerLocationZ}`;

        const mapLink = document.createElement('a');
        mapLink.href = mapURL;
        mapLink.textContent = 'View on Dynmap';
        mapLink.target = '_blank'; // Open link in a new tab

        // Get the player-map div and append the link
        const playerMapDiv = document.querySelector('.player-map');
        playerMapDiv.appendChild(mapLink);
    }
}




window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const uuid = urlParams.get('uuid');

    if (uuid) {
        fetchPlayerInfo(uuid);

        setInterval(() => {
            fetchPlayerInfo(uuid);
        }, 1000);
    } else {
        console.error('UUID not provided in the URL');
    }
};
