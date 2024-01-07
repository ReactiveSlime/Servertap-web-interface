// Function to fetch and update server data
async function fetchData() {
    try {
        // Fetch server data from Node.js server
        const response = await fetch('/server-data');
        const data = await response.json(); // Parse the JSON response

        // Update HTML elements with server data
        updateServerInfo(data);
        updateOnlinePlayers(data.onlinePlayers);
        updateMemoryUsage(data);
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

// Update server information in the HTML elements
function updateServerInfo(data) {
    const { motd, weather, tps, uptime, onlinePlayers, freeMemoryGB, maxMemoryGB } = data;

    document.getElementById('motd').innerText = motd;
    document.getElementById('weather').innerText = weather;
    document.getElementById('tps').innerText = tps;
    document.getElementById('uptime').innerText = uptime;

    const onlinePlayersContainer = document.getElementById('onlinePlayers');
    if (onlinePlayers && onlinePlayers.length > 0) {
        updateOnlinePlayers(onlinePlayers);
    } else {
        onlinePlayersContainer.innerText = 'No players online';
    }

    updateMemoryUsage({ freeMemoryGB, maxMemoryGB });
}

// Update online players section in the HTML
function updateOnlinePlayers(players) {
    const onlinePlayersContainer = document.getElementById('onlinePlayers');
    onlinePlayersContainer.innerHTML = ''; // Clear previous content

    players.forEach(player => {
        const playerDiv = createPlayerDiv(player);
        onlinePlayersContainer.appendChild(playerDiv);
    });
}

// Create HTML elements for a single player
function createPlayerDiv(player) {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player');

    const playerLink = `/player.html?uuid=${player.uuid}`;
    const dimensionText = getDimensionText(player.dimension);

    const playerNameLink = createPlayerNameLink(player.displayName, playerLink);
    playerNameLink.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
            const playerInfoResponse = await fetch(`/player-info/${player.uuid}`);
            const playerInfo = await playerInfoResponse.json();
            console.log('Player Info:', playerInfo);
            // Handle displaying player info as needed
        } catch (error) {
            console.error('Failed to fetch player info:', error);
        }
    });

    playerDiv.appendChild(playerNameLink);
    playerDiv.innerHTML += `
        <br>
        <img class="player-avatar" src="https://mineskin.eu/avatar/${player.uuid}" width="64px" alt="Minecraft player head"/>
        <div class="player-dimension"> In The ${dimensionText} Dimension</div>
        <div class="player-location">${getPlayerLocationText(player.location)}</div>
        <div class="player-health">Health ${Math.ceil(player.health)} ❤️</div>
        <div class="player-hunger">Hunger ${Math.ceil(player.hunger)} 🍗</div>
    `;
    return playerDiv;
}

// Helper function to get dimension text
function getDimensionText(dimension) {
    switch (dimension) {
        case "NORMAL":
            return "Overworld";
        case "NETHER":
            return "Nether";
        case "THE_END":
            return "End";
        default:
            return "Unknown";
    }
}

// Helper function to create player name link
function createPlayerNameLink(playerName, playerLink) {
    const playerNameLink = document.createElement('a');
    playerNameLink.href = playerLink;
    playerNameLink.target = '_blank';
    playerNameLink.classList.add('player-name');
    playerNameLink.innerText = playerName;
    return playerNameLink;
}

// Helper function to get player location text
function getPlayerLocationText(location) {
    const [x, y, z] = location.map(coord => coord.toFixed(1));
    return `X: ${x} Y: ${y} Z: ${z}`;
}

// Update memory usage information and memory bar color
function updateMemoryUsage({ freeMemoryGB, maxMemoryGB }) {
    const memoryUsagePercentage = (freeMemoryGB / maxMemoryGB) * 100;
    document.getElementById('memoryFill').style.width = `${memoryUsagePercentage}%`;

    const green = Math.min(255, Math.floor(255 * (100 - memoryUsagePercentage) / 100));
    const red = Math.min(255, Math.floor(255 * (memoryUsagePercentage) / 100));
    const color = `rgb(${red}, ${green}, 0)`;

    document.getElementById('memoryFill').style.backgroundColor = color;
}

// Call the fetchData function when the page loads and set interval to update data every second
window.onload = function () {
    fetchData();
    setInterval(fetchData, 1000); // Update every second
};
