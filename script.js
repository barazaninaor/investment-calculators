function toggleCalculator() {
    const type = document.getElementById("calculatorType").value;
    document.querySelectorAll('.calc-section').forEach(div => div.style.display = 'none');
    
    if (type === "value") {
        document.getElementById("valueCalc").style.display = "block";
        document.getElementById("pageTitle").innerText = "Value Calculator";
    } else if (type === "yield") {
        document.getElementById("yieldCalc").style.display = "block";
        document.getElementById("pageTitle").innerText = "Yield Calculator";
    } else if (type === "channels") {
        document.getElementById("channelsCalc").style.display = "block";
        document.getElementById("pageTitle").innerText = "Channels Calculator";
        if (document.getElementById("channelsContainer").children.length === 0) {
            initChannels();
        }
    }
}

function initChannels() {
    const container = document.getElementById("channelsContainer");
    container.innerHTML = "";
    addChannelRow("Cash");
    addChannelRow("Bonds");
    addChannelRow("Stocks");
}

function formatWithCommas(value) {
    if (!value && value !== 0) return "";
    let clean = value.toString().replace(/[^0-9.]/g, "");
    let parts = clean.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts[1] !== undefined ? parts[0] + "." + parts[1].slice(0, 2) : parts[0];
}

function formatValue(input) {
    input.value = formatWithCommas(input.value);
    if(document.getElementById("channelsCalc").style.display === "block") updateAllExposures(); 
}

function parseFormattedNumber(val) {
    if (!val) return 0;
    return Number(val.toString().replace(/,/g, ""));
}

function copyToYield() {
    const mtd = document.getElementById("newMTDResult").innerText;
    const ytd = document.getElementById("newYTD").innerText;
    const itd = document.getElementById("newITD").innerText;
    const currentVal = document.getElementById("newValue").innerText;
    const prevVal = document.getElementById("value").value;

    document.getElementById("calculatorType").value = "yield";
    toggleCalculator();

    if (mtd !== "-") document.getElementById("yieldMTD").innerText = mtd;
    if (ytd !== "-") document.getElementById("yieldYTD").innerText = ytd;
    if (itd !== "-") document.getElementById("yieldITD").innerText = itd;
    if (currentVal !== "-") document.getElementById("currBal").value = currentVal;
    if (prevVal !== "") document.getElementById("prevBal").value = prevVal;
}

function copyToValue() {
    const mtd = document.getElementById("yieldMTD").innerText;
    const ytd = document.getElementById("yieldYTD").innerText;
    const itd = document.getElementById("yieldITD").innerText;
    const currentVal = document.getElementById("currBal").value;

    document.getElementById("calculatorType").value = "value";
    toggleCalculator();

    if (mtd !== "-") document.getElementById("mtd").value = mtd;
    if (ytd !== "-") document.getElementById("ytd").value = ytd;
    if (itd !== "-") document.getElementById("itd").value = itd;
    if (currentVal !== "") document.getElementById("value").value = currentVal;
}

function calculateValue() {
    const rawMtdInput = document.getElementById("mtd").value;
    const val = parseFormattedNumber(document.getElementById("value").value);
    const mtd = Number(rawMtdInput) / 100;
    if (!isNaN(val) && rawMtdInput !== "") {
        const resultValue = val * (1 + mtd);
        document.getElementById("newMTDResult").innerText = Number(rawMtdInput).toFixed(2);
        document.getElementById("newValue").innerText = resultValue.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById("newYTD").innerText = (((1 + (Number(document.getElementById("ytd").value)/100)) * (1 + mtd) - 1) * 100).toFixed(2);
        document.getElementById("newITD").innerText = (((1 + (Number(document.getElementById("itd").value)/100)) * (1 + mtd) - 1) * 100).toFixed(2);
    }
}

function recalculateValue() {
    if (document.getElementById("newValue").innerText !== "-") {
        document.getElementById("value").value = document.getElementById("newValue").innerText;
        document.getElementById("ytd").value = document.getElementById("newYTD").innerText;
        document.getElementById("itd").value = document.getElementById("newITD").innerText;
        calculateValue();
    }
}

function calculateYield() {
    const open = parseFormattedNumber(document.getElementById("openBal").value);
    const yearEnd = parseFormattedNumber(document.getElementById("yearEndBal").value);
    const prev = parseFormattedNumber(document.getElementById("prevBal").value);
    const curr = parseFormattedNumber(document.getElementById("currBal").value);
    document.getElementById("yieldMTD").innerText = (prev !== 0) ? ((curr / prev - 1) * 100).toFixed(2) : "-";
    document.getElementById("yieldYTD").innerText = (yearEnd !== 0) ? ((curr / yearEnd - 1) * 100).toFixed(2) : "-";
    document.getElementById("yieldITD").innerText = (open !== 0) ? ((curr / open - 1) * 100).toFixed(2) : "-";
}

function addChannelRow(defaultName = "") {
    const container = document.getElementById("channelsContainer");
    const row = document.createElement("div");
    row.className = "channel-row";
    row.innerHTML = `
        <div class="ch-name-container">
            <input type="text" class="ch-name" value="${defaultName}" placeholder="Channel" autocomplete="off" onclick="showDropdown(this)">
            <div class="custom-dropdown">
                <div class="dropdown-item" onclick="selectOption(this, 'Cash')">Cash</div>
                <div class="dropdown-item" onclick="selectOption(this, 'Bonds')">Bonds</div>
                <div class="dropdown-item" onclick="selectOption(this, 'Stocks')">Stocks</div>
            </div>
        </div>
        <div style="flex: 1;"><input type="text" class="ch-amount" placeholder="Amt" oninput="formatValue(this)"></div>
        <span class="ch-exp-display">0%</span>
        <button class="remove-btn" onclick="this.parentElement.remove(); updateAllExposures();">X</button>
    `;
    container.appendChild(row);
}

function showDropdown(input) {
    hideAllDropdowns();
    input.nextElementSibling.style.display = "block";
}

function selectOption(item, value) {
    const input = item.parentElement.previousElementSibling;
    input.value = value;
    item.parentElement.style.display = "none";
    updateAllExposures();
}

function hideAllDropdowns() {
    document.querySelectorAll('.custom-dropdown').forEach(d => d.style.display = "none");
}

document.addEventListener("click", e => { if (!e.target.classList.contains('ch-name')) hideAllDropdowns(); });

function updateAllExposures() {
    const rows = document.querySelectorAll("#channelsContainer .channel-row");
    let total = 0;
    rows.forEach(row => total += parseFormattedNumber(row.querySelector(".ch-amount").value));
    rows.forEach(row => {
        const amt = parseFormattedNumber(row.querySelector(".ch-amount").value);
        row.querySelector(".ch-exp-display").innerText = total > 0 ? ((amt / total) * 100).toFixed(1) + "%" : "0%";
    });
}

function calculateChannels() {
    const rows = document.querySelectorAll("#channelsContainer .channel-row");
    const newTotal = parseFormattedNumber(document.getElementById("newTotalAmount").value);
    const resultsContainer = document.getElementById("resultsTableContainer");
    let totalOriginal = 0, data = [];

    rows.forEach(row => {
        const amt = parseFormattedNumber(row.querySelector(".ch-amount").value);
        totalOriginal += amt;
        data.push({ name: row.querySelector(".ch-name").value || "Unknown", amt: amt });
    });

    if (totalOriginal === 0) return;
    document.getElementById("channelsResultsArea").style.display = "block";
    resultsContainer.innerHTML = "";
    document.getElementById("totalOrigVal").innerText = totalOriginal.toLocaleString(undefined, {minimumFractionDigits: 2});

    data.forEach((item, index) => {
        const newVal = (item.amt / totalOriginal) * newTotal;
        const rowId = `res-val-${index}`;
        resultsContainer.innerHTML += `
            <div style="font-weight: bold;">${item.name}:</div>
            <div id="${rowId}">${newTotal > 0 ? newVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "-"}</div>
            <button class="copy-btn" onclick="copyValue('${rowId}', this)">Copy</button>
        `;
    });
}

function copyValue(elementId, btn) {
    let text = document.getElementById(elementId).innerText;
    if (!text || text === "-") return;
    navigator.clipboard.writeText(text.replace(/,/g, ""));
    const originalText = btn.innerText;
    btn.innerText = "Copied";
    setTimeout(() => { btn.innerText = originalText; }, 1200);
}

function resetAll() {
    document.querySelectorAll("input").forEach(input => input.value = "");
    document.querySelectorAll(".results-grid div[id]").forEach(div => div.innerText = "-");
    if(document.getElementById("totalOrigVal")) document.getElementById("totalOrigVal").innerText = "-";
    document.getElementById("channelsResultsArea").style.display = "none";
    initChannels();
    document.getElementById("calculatorType").value = "value";
    toggleCalculator();
}
