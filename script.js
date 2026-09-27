const SERVER_IP = "schmidt-stiff.tun.ply.gg";

let modsData = [];
let originalModsData = [];
let sortDirection = "asc";

document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    const ipElement = document.getElementById("server-ip");
    ipElement.textContent = SERVER_IP;

    checkServerStatus();
    loadMods();
});

function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
}

function setTheme(themeName) {
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("theme", themeName);
}

async function checkServerStatus() {
    const statusBox = document.getElementById("status-box");
    const statusDot = document.getElementById("status-dot");
    const serverState = document.getElementById("server-state");
    const serverPlayers = document.getElementById("server-players");

    try {
        const response = await fetch(
            `https://api.mcstatus.io/v2/status/java/${SERVER_IP}`,
        );
        const data = await response.json();

        statusBox.classList.remove("loading");

        if (data.online) {
            statusDot.className = "status-indicator online";
            serverState.innerHTML = `<strong>ОНЛАЙН</strong> (Версия: ${data.version.name_clean})`;
            serverPlayers.innerHTML = `Игроки: <strong>${data.players.online} / ${data.players.max}</strong>`;
        } else {
            statusDot.className = "status-indicator offline";
            serverState.innerHTML = `<strong>ОФФЛАЙН</strong>`;
            serverPlayers.innerHTML = "";
        }
    } catch (error) {
        statusBox.classList.remove("loading");
        statusDot.className = "status-indicator offline";
        serverState.innerHTML = `Ошибка получения данных`;
        console.error("Ошибка API:", error);
    }
}

async function loadMods() {
    const tbody = document.querySelector("#mods-table tbody");
    try {
        const response = await fetch("mods.json");
        modsData = await response.json();
        originalModsData = [...modsData];
        renderTable(modsData);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Не удалось загрузить список модов.</td></tr>`;
        console.error("Ошибка загрузки JSON:", error);
    }
}

function sortByType() {
    const icon = document.getElementById("sort-icon");

    sortDirection = sortDirection === "asc" ? "desc" : "asc";
    icon.textContent = sortDirection === "asc" ? "⬇️" : "⬆️";

    modsData.sort((a, b) => {
        let sideA = (a.side || "Both").toLowerCase();
        let sideB = (b.side || "Both").toLowerCase();

        if (sideA < sideB) return sortDirection === "asc" ? -1 : 1;
        if (sideA > sideB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    document.getElementById("reset-sort-btn").style.display = "inline-block";
    renderTable(modsData);
}

function resetSort() {
    modsData = [...originalModsData];
    sortDirection = "asc";
    document.getElementById("sort-icon").textContent = "↕️";
    document.getElementById("reset-sort-btn").style.display = "none";
    renderTable(modsData);
}

function renderTable(data) {
    const tbody = document.querySelector("#mods-table tbody");
    tbody.innerHTML = "";

    data.forEach((mod) => {
        const tr = document.createElement("tr");

        const side = mod.side || "Both";
        let sideClass = "";
        if (side.toLowerCase().includes("client")) sideClass = "tag-client";
        else if (side.toLowerCase().includes("server"))
            sideClass = "tag-server";
        else sideClass = "tag-both";

        let baseUrl = mod.url || mod.link;
        let finalUrl = baseUrl;

        if (baseUrl.includes("modrinth.com") && mod.version) {
            finalUrl = `${baseUrl.replace(/\/$/, "")}/version/${mod.version}`;
        }

        tr.innerHTML = `
            <td>${mod.name}</td>
            <td><code>${mod.version}</code></td>
            <td><span class="tag ${sideClass}">${side}</span></td>
            <td><a href="${finalUrl}" target="_blank" class="download-btn">Скачать</a></td>
        `;
        tbody.appendChild(tr);
    });
}
