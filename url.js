const STORAGE_KEY = "urlHistory";
const form = document.getElementById("url-form");
const urlInput = document.getElementById("url-input");
const validateBtn = document.getElementById("validate-btn");
const message = document.getElementById("message");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const list = document.getElementById("history-list");
const emptyState = document.getElementById("empty-state");
const count = document.getElementById("count");


let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = "message " + (type || "");
}


function validateUrl(value) {
  if (value === "") {
    showMessage("Please enter a URL.", "error");
    return false;
  }
  try {
    const u = new URL(value);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
  } catch (e) {
    showMessage("Invalid URL. Use http:// or https://", "error");
    return false;
  }
  showMessage("URL is valid.", "success");
  return true;
}


function generateShortCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return history.some(e => e.code === code) ? generateShortCode() : code;
}


function copyLink(text, btn) {
  navigator.clipboard.writeText(text).then(function () {
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = "Copy"), 1500);
  });
}


function deleteEntry(id) {
  history = history.filter(e => e.id !== id);
  save();
  render();
}


function render() {
  const term = searchInput.value.trim().toLowerCase();
  let items = history.filter(e =>
    e.url.toLowerCase().includes(term) || e.code.toLowerCase().includes(term)
  );
  items.sort((a, b) => sortSelect.value === "oldest" ? a.id - b.id : b.id - a.id);

  list.innerHTML = "";
  count.textContent = history.length ? `Showing ${items.length} of ${history.length}` : "";

  if (items.length === 0) {
    emptyState.style.display = "block";
    emptyState.textContent = history.length ? "No results found." : "No shortened URLs yet.";
    return;
  }
  emptyState.style.display = "none";

  items.forEach(function (e) {
    const li = document.createElement("li");
    li.className = "history-item";

    const original = document.createElement("div");
    original.className = "original-url";
    original.textContent = e.url;

    const short = document.createElement("div");
    short.className = "short-url";
    short.textContent = "https://short.ly/" + e.code;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => copyLink(short.textContent, copyBtn));

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteEntry(e.id));

    li.append(original, short, copyBtn, delBtn);
    list.appendChild(li);
  });
}


form.addEventListener("submit", function (event) {
  event.preventDefault();
  const url = urlInput.value.trim();
  if (!validateUrl(url)) return;

  if (history.some(e => e.url === url)) {
    showMessage("This URL is already in your history.", "error");
    return;
  }

  history.push({ id: Date.now(), url: url, code: generateShortCode() });
  save();
  render();
  urlInput.value = "";
  showMessage("Short URL created!", "success");
});

validateBtn.addEventListener("click", () => validateUrl(urlInput.value.trim()));
searchInput.addEventListener("input", render);
sortSelect.addEventListener("change", render);

render();