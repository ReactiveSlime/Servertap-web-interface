async function fetchData() {
    try {
        const response = await fetch('/server-data'); // Fetch server data from your Node.js server
        const data = await response.json(); // Parse the JSON response

        // Update HTML elements with server data
        document.getElementById('motd').innerText = data.motd;
        document.getElementById('weather').innerText = data.weather;
        document.getElementById('tps').innerText = data.tps;
        document.getElementById('uptime').innerText = data.uptime;
        document.getElementById('onlinePlayers').innerText = ''; // Clear previous content

        // Display online players
        const onlinePlayersContainer = document.getElementById('onlinePlayers');

        if (data.onlinePlayers && data.onlinePlayers.length > 0) {
            data.onlinePlayers.forEach(player => {
                const playerDiv = document.createElement('div');
                playerDiv.classList.add('player');

                const playerUUID = player.uuid;
                const playerName = player.displayName;
                const playerLocation = `X: ${player.location[0].toFixed(1)} Y: ${player.location[1].toFixed(1)} Z: ${player.location[2].toFixed(1)}`;
                const playerHealth = Math.ceil(player.health);
                const playerHunger = Math.ceil(player.hunger);
                const playerLink = `/player.html?uuid=${playerUUID}`; // Constructing the URL

                const playerNameLink = document.createElement('a');
                playerNameLink.href = playerLink;
                playerNameLink.target = '_blank';
                playerNameLink.classList.add('player-name');
                playerNameLink.innerText = playerName;

                playerNameLink.addEventListener('click', async (event) => {
                    event.preventDefault();

                    try {
                        const playerInfoResponse = await fetch(`/player-info/${playerUUID}`);
                        const playerInfo = await playerInfoResponse.json();
                        console.log('Player Info:', playerInfo);
                        // Handle displaying player info as needed
                    } catch (error) {
                        console.error('Failed to fetch player info:', error);
                    }
                });

                playerDiv.appendChild(playerNameLink);

                playerDiv.innerHTML += `
                    <img class="player-avatar" src="https://mineskin.eu/avatar/${playerUUID}" width="64px" alt="Minecraft player head"/>
                    <div class="player-location">${playerLocation}</div>
                    <div class="player-health">Health ${playerHealth} ❤️</div>
                    <div class="player-hunger">Hunger ${playerHunger} 🍗</div>
                `;

                onlinePlayersContainer.appendChild(playerDiv);
            });
        } else {
            onlinePlayersContainer.innerText = 'No players online';
        }

        // Calculate memory usage percentage and update memory bar width and color
        const memoryUsagePercentage = (data.freeMemoryGB / data.maxMemoryGB) * 100;
        document.getElementById('memoryFill').style.width = `${memoryUsagePercentage}%`;

        // Calculate color based on memory usage percentage (green to red gradient)
        const green = Math.min(255, Math.floor(255 * (100 - memoryUsagePercentage) / 100));
        const red = Math.min(255, Math.floor(255 * (memoryUsagePercentage) / 100));
        const color = `rgb(${red}, ${green}, 0)`;

        // Update memory bar color
        document.getElementById('memoryFill').style.backgroundColor = color;
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

// Call the fetchData function when the page loads
window.onload = function () {
    fetchData();
    // Set an interval to update the data every 5 seconds
    setInterval(fetchData, 1000);
};
