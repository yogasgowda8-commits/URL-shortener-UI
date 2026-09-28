const STORAGE_KEY = "urlShortenerHistory";

const form = document.getElementById("url-form");
const urlInput = document.getElementById("url-input");
const errorMessage = document.getElementById("error-message");
const historyList = document.getElementById("history-list");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");

let history = loadHistory();

function loadHistory() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function generateShortCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const existingCodes = history.map(function (entry) {
    return entry.shortCode;
  });
  return existingCodes.includes(code) ? generateShortCode() : code;
}

function renderHistory(filterText) {
  const term = (filterText || "").trim().toLowerCase();
  const filtered = history.filter(function (entry) {
    return (
      entry.originalUrl.toLowerCase().includes(term) ||
      entry.shortCode.toLowerCase().includes(term)
    );
  });

  historyList.innerHTML = "";

  if (history.length === 0) {
    emptyState.textContent = "No shortened URLs yet.";
    emptyState.style.display = "block";
    return;
  }

  if (filtered.length === 0) {
    emptyState.textContent = "No results match your search.";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  filtered.forEach(function (entry) {
    const li = document.createElement("li");
    li.className = "history-item";

    const originalUrlEl = document.createElement("div");
    originalUrlEl.className = "original-url";
    originalUrlEl.textContent = entry.originalUrl;

    const shortCodeEl = document.createElement("div");
    shortCodeEl.className = "short-code";
    shortCodeEl.textContent = window.location.origin + "/" + entry.shortCode;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.type = "button";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", function () {
      copyToClipboard(shortCodeEl.textContent, copyBtn);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      deleteEntry(entry.id);
    });

    li.appendChild(originalUrlEl);
    li.appendChild(shortCodeEl);
    li.appendChild(copyBtn);
    li.appendChild(deleteBtn);

    historyList.appendChild(li);
  });
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(function () {
    const original = btn.textContent;
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove("copied");
    }, 1500);
  });
}

function deleteEntry(id) {
  history = history.filter(function (entry) {
    return entry.id !== id;
  });
  saveHistory();
  renderHistory(searchInput.value);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const value = urlInput.value.trim();

  if (value === "" || !isValidUrl(value)) {
    errorMessage.textContent = "Please enter a valid URL (starting with http:// or https://).";
    return;
  }

  errorMessage.textContent = "";

  const entry = {
    id: Date.now(),
    originalUrl: value,
    shortCode: generateShortCode()
  };

  history.unshift(entry);
  saveHistory();
  renderHistory(searchInput.value);
  urlInput.value = "";
});

searchInput.addEventListener("input", function () {
  renderHistory(searchInput.value);
});

renderHistory("");