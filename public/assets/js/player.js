// Fetch player info using UUID from the server
async function fetchPlayerInfo(uuid) {
    try {
        const response = await fetch(`/player?uuid=${uuid}`);
        const playerInfo = await response.json();

        // Display the fetched player info
        displayPlayerInfo(playerInfo);
    } catch (error) {
        console.error('Error fetching player info:', error);
    }
}

// Display player info on the HTML page
function displayPlayerInfo(playerInfo) {
    const playerInfoDiv = document.getElementById('playerInfo');

    // Create HTML elements to display player info
    const playerName = document.createElement('h1');
    playerName.textContent = `Player Name: ${playerInfo.displayName}`;

    const playerHealth = document.createElement('p');
    playerHealth.textContent = `Health: ${Math.ceil(playerInfo.health)}`;

    const playerHunger = document.createElement('p');
    playerHunger.textContent = `Hunger: ${Math.ceil(playerInfo.hunger)}`;

    // Get player location coordinates
    const [x, y, z] = playerInfo.location;

    const playerLocation = document.createElement('p');
    playerLocation.textContent = `Location: X: ${x.toFixed(1)}, Y: ${y.toFixed(1)}, Z: ${z.toFixed(1)}`;

    // Append player info elements to the div
    playerInfoDiv.appendChild(playerName);
    playerInfoDiv.appendChild(playerHealth);
    playerInfoDiv.appendChild(playerHunger);
    playerInfoDiv.appendChild(playerLocation);
}


// Fetch player info when the page loads
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const uuid = urlParams.get('uuid');

    if (uuid) {
        fetchPlayerInfo(uuid);
    } else {
        console.error('UUID not provided in the URL');
    }
};
