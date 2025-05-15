document.addEventListener(\'touchstart\', function preventZoom(e) {
  if(e.touches.length > 1) e.preventDefault();
}, { passive: false });
let lastTouch = 0;
document.addEventListener(\'touchend\', function(e){
  const now = Date.now();
  if(now - lastTouch <= 350){
    e.preventDefault();
  }
  lastTouch = now;
}, { passive: false });

const themeBtn = document.getElementById(\'themeToggle\');
const themeText = document.getElementById(\'themeText\');
function ensureTheme() {
  let theme = localStorage.getItem(\'theme\');
  if(!theme) {
    if(window.matchMedia && window.matchMedia(\'(prefers-color-scheme: dark)\').matches) theme = \'dark\';
    else theme = \'light\';
  }
  document.body.classList.toggle(\'dark\', theme === \'dark\');
  themeText.textContent = theme === \'dark\' ? "Светлая тема" : "Тёмная тема";
}
function setTheme(dark) {
  localStorage.setItem(\'theme\', dark ? \'dark\' : \'light\');
  ensureTheme();
}
themeBtn.addEventListener(\'click\', () => setTheme(!document.body.classList.contains(\'dark\')));
ensureTheme();

let tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
let userId = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : null;
let username = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? (tg.initDataUnsafe.user.username||tg.initDataUnsafe.user.first_name) : "";
let userPhoto = tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.photo_url ? tg.initDataUnsafe.user.photo_url : "";
const backend = "https://bar-backend-production.up.railway.app";
const botLink = "https://t.me/BarHelperAB_bot";

function forceExpand() {
  if (tg && tg.expand) tg.expand();
}
if (tg && tg.expand) tg.expand();
if (userPhoto) {
  const avatar = document.getElementById(\'userAvatar\');
  avatar.src = userPhoto;
  avatar.style.display = \'block\';
}
document.getElementById(\'wrap\').addEventListener(\'touchstart\', function(e) {
  if (!e.target.closest(\'input, textarea, select, button\')) {
    const active = document.activeElement;
    if (active && (active.tagName === \'INPUT\' || active.tagName === \'TEXTAREA\' || active.tagName === \'SELECT\')) {
      active.blur();
    }
  }
});

if (!userId) {
  document.getElementById(\'main\').innerHTML = `
    <div style=\"padding:22px 0;text-align:center\" class=\"error\">
      Откройте сайт через Telegram-бота, чтобы пользоваться баром.<br><br>
      <a href=\"${botLink}\" style=\"color:#007aff;font-weight:bold\" target=\"_blank\">Открыть бота</a>
    </div>`;
  throw new Error("Not in Telegram Mini App");
}

window.showMenu = showMenu;
window.showAddPage = showAddPage;
window.showExpiredPage = showExpiredPage;
window.showSearchPage = showSearchPage;
// window.showEditPage = showEditPage; // Removed as per request
// window.openReopenForm = openReopenForm; // Removed as per request
window.confirmDelete = confirmDelete;
window.deleteItem = deleteItem;
window.openCardActionsModal = openCardActionsModal;
window.showStatsPage = showStatsPage;
// window.showExportPage = showExportPage; // Removed as per request

function setPageTitle(title) {
  document.getElementById(\'pageTitle\').innerHTML = title;
}
function showPage(contentHtml) {
  const el = document.getElementById("main");
  el.innerHTML = `<div class=\"page-anim\">${contentHtml}</div>`;
  ensureTheme();
  window.scrollTo({top: 0, behavior: \'smooth\'});
  forceExpand();
}
function addBackButton(html) {
  return `<button class=\"backbtn\" onclick=\"showMenu()\">Назад</button>` + html;
}
function msg(m, type=\'\'){ showPage(addBackButton(`<div class=\"${type} result\">${m}</div>`)); }
let USER = null;
function welcomeGreeting() {
  const now = new Date();
  const h = now.getHours();
  if (h >= 5 && h < 12) return "Доброе утро";
  if (h >= 12 && h < 18) return "Добрый день";
  if (h >= 18 && h < 23) return "Добрый вечер";
  return "Доброй ночи";
}
function showMenu() {
  setPageTitle(\'Ингредиенты <span style="color:#13c1e3;font-size:0.93em;">бара</span>\');
  showPage(`
    <div class=\"welcome-block\">
      <div class=\"welcome-greet\">${welcomeGreeting()},<br>${USER ? USER.username : ""}!</div>
      ${USER && USER.bar_name ? `<span class=\"welcome-bar\">Бар: ${USER.bar_name}</span>` : ""}
    </div>
    <div class=\"menu fadeIn\" id=\"menuBlock\">
      <button class=\"menu-btn\" onclick=\"showAddPage()\"><span class=\"menu-icon\"></span> Добавить позицию</button>
      <button class=\"menu-btn\" onclick=\"showExpiredPage()\"><span class=\"menu-icon\"></span> Проверить сроки</button>
      <button class=\"menu-btn\" onclick=\"showSearchPage()\"><span class=\"menu-icon\"></span> Поиск</button>
      <button class=\"menu-btn\" onclick=\"showStatsPage()\"><span class=\"menu-icon\"></span> Статистика бара</button>
    </div>
  `);
  ensureTheme();
}
function vibrate(ms = 30) {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(ms);
  }
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(\'light\');
    } catch (e) {}
  }
}
function scrollInputIntoView(input) {
  setTimeout(() => {
    if (input && typeof input.scrollIntoView === "function") {
      input.scrollIntoView({behavior: "smooth", block: "center"});
    }
  }, 120);
}
document.body.addEventListener(\'focusin\', function(e) {
  if (e.target.tagName === \'INPUT\' || e.target.tagName === \'TEXTAREA\' || e.target.tagName === \'SELECT\') {
    scrollInputIntoView(e.target);
  }
});

function showStatsPage() {
  setPageTitle(\'Статистика бара\');
  showPage(addBackButton(`<div class=\"stat-block\" id=\"statBlock\"><div style=\"text-align:center;color:#aaa;\">Загрузка...</div></div>`));
  fetch(`${backend}/search`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, query: ""})
  })
  .then(r => r.json())
  .then(data => {
    if (!data.ok) {
      document.getElementById(\'statBlock\').innerHTML = `<div class=\"error\">Ошибка: ${data.error}</div>`;
      return;
    }
    let total = data.results.length;
    let opened = data.results.filter(x=>x.opened==1).length;
    let closed = data.results.filter(x=>x.opened==0).length;
    let expired = data.results.filter(x=>x.expiry_at && new Date(x.expiry_at) < new Date()).length;
    document.getElementById(\'statBlock\').innerHTML = `
      <div class=\"stat-row\"><span class=\"stat-label\">Всего позиций:</span> <span class=\"stat-value blue\">${total}</span></div>
      <div class=\"stat-row\"><span class=\"stat-label\">Открытых:</span> <span class=\"stat-value\">${opened}</span></div>
      <div class=\"stat-row\"><span class=\"stat-label\">Закрытых:</span> <span class=\"stat-value gray\">${closed}</span></div>
      <div class=\"stat-row\"><span class=\"stat-label\">Просрочено:</span> <span class=\"stat-value red\">${expired}</span></div>
    `;
  });
}

// function showExportPage() { ... } // Removed as per request
// function exportPositions(type) { ... } // Removed as per request

function showAddPage() {
  setPageTitle(\'Добавить позицию\');
  showPage(addBackButton(`
    <form id=\"addf\" class=\"beautiful-form\" autocomplete=\"off\">
      <div class=\"field-row\">
        <label class=\"field-label\" for=\"category\">Категория</label>
        <select name=\"category\" id=\"category\" required>
          <option value=\"🍯 Сиропы\">🍯 Сиропы</option>
          <option value=\"🥕 Ингредиенты\">🥕 Ингредиенты</option>
          <option value=\"📦 Прочее\">📦 Прочее</option>
        </select>
      </div>
      <div class=\"status-toggle-bar\" id=\"statusToggleBar\">
        <button type=\"button\" class=\"status-toggle-btn opened selected\" id=\"btnOpened\">Открыто</button>
        <button type=\"button\" class=\"status-toggle-btn closed\" id=\"btnClosed\">Закрыто</button>
      </div>
      <div class=\"field-row\">
        <label class=\"field-label\" for=\"tob\">TOB (6 цифр)</label>
        <input name=\"tob\" id=\"tob\" maxlength=\"6\" pattern=\"\\\\d{6}\" required placeholder=\"123456\" autocomplete=\"off\">
        <div id=\"tobWarning\" style=\"display:none\"></div>
      </div>
      <div class=\"field-row\">
        <label class=\"field-label\" for=\"name\">Название</label>
        <input name=\"name\" id=\"name\" required placeholder=\"Название позиции\">
      </div>
      <div class=\"field-row\">
        <label class=\"field-label\" for=\"shelf_life_days\">Срок хранения (дней)</label>
        <input name=\"shelf_life_days\" id=\"shelf_life_days\" type=\"number\" min=\"1\" required placeholder=\"30\">
      </div>
      <div class=\"field-row\">
        <label class=\"field-label\" for=\"opened_at\">Дата открытия</label>
        <input name=\"opened_at\" id=\"opened_at\" type=\"date\" required>
      </div>
      <div class=\"btns\">
        <button type=\"submit\" id=\"addSubmitBtn\" disabled>Добавить</button>
      </div>
    </form>
  `));
  ensureTheme();
  setTimeout(() => {
    let inputs = document.querySelectorAll(\".beautiful-form input, .beautiful-form select\");
    inputs.forEach(inp => {
      inp.addEventListener(\'focus\', function() {
        scrollInputIntoView(this);
      });
    });
  }, 100);

  let opened = true;
  const btnOpened = document.getElementById(\'btnOpened\');
  const btnClosed = document.getElementById(\'btnClosed\');
  function updateStatusButtons() {
    if (opened) {
      btnOpened.classList.add("selected", "opened");
      btnClosed.classList.remove("selected", "closed");
    } else {
      btnOpened.classList.remove("selected", "opened");
      btnClosed.classList.add("selected", "closed");
    }
  }
  btnOpened.onclick = function() {
    opened = true;
    updateStatusButtons();
    checkTob(); // Call checkTob which calls validateForm
  };
  btnClosed.onclick = function() {
    opened = false;
    updateStatusButtons();
    validateForm(); // Directly validate as TOB check might not be relevant for closed items
  };
  updateStatusButtons();

  let allItems = [];
  let fetchedItems = false;
  let openTobExists = false;
  const tobInput = document.getElementById(\'tob\');
  const tobWarning = document.getElementById(\'tobWarning\');
  const nameInput = document.getElementById(\'name\');
  const shelfInput = document.getElementById(\'shelf_life_days\');
  const dateInput = document.getElementById(\'opened_at\');
  const catInput = document.getElementById(\'category\');
  const submitBtn = document.getElementById(\'addSubmitBtn\');

  function validateForm() {
    let allOk = true;
    if (!catInput.value) allOk = false;
    if (!tobInput.value.match(/^\d{6}$/)) allOk = false;
    if (!nameInput.value.trim()) allOk = false;
    if (!shelfInput.value || parseInt(shelfInput.value) < 1) allOk = false;
    if (!dateInput.value) allOk = false;
    if (opened && openTobExists) allOk = false;
    submitBtn.disabled = !allOk;
  }

  async function fetchItemsOnce() {
    if (fetchedItems) {
      validateForm(); // If already fetched, just validate
      return;
    }
    try {
        let resp = await fetch(`${backend}/search`, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({user_id: userId, query: ""})
        });
        let data = await resp.json();
        if (data.ok && Array.isArray(data.results)) {
            allItems = data.results;
        } else {
            console.error("Error fetching items or no items found:", data.error);
            allItems = []; // Ensure allItems is an array even on error
        }
    } catch (error) {
        console.error("Network or other error fetching items:", error);
        allItems = []; // Ensure allItems is an array on fetch failure
    }
    fetchedItems = true;
    validateForm(); // Validate form after fetching is complete (success or fail)
  }

  function checkTob() {
    let tobVal = tobInput.value;
    openTobExists = false;
    tobWarning.style.display = "none";
    tobWarning.innerHTML = "";
    if (tobVal.length === 6) {
      // Ensure allItems is available before trying to find in it
      if (fetchedItems) { 
        let exists = allItems.find(x => x.tob === tobVal && x.opened == 1);
        if (exists) {
          openTobExists = true;
          tobWarning.innerHTML = `<span class=\"tob-warning\">Позиция с этим TOB уже <b>открыта</b>. Можете добавить только закрытую позицию, либо сначала закройте открытую.</span>`;
          tobWarning.style.display = "block";
        }
      } else {
        // If items not fetched yet, we can\'t reliably check TOB. 
        // fetchItemsOnce will call validateForm after fetching.
      }
    }
    validateForm();
  }

  // Initial call to fetch items and validate
  fetchItemsOnce(); 

  tobInput.addEventListener(\'input\', checkTob);
  nameInput.addEventListener(\'input\', validateForm);
  shelfInput.addEventListener(\'input\', validateForm);
  dateInput.addEventListener(\'input\', validateForm);
  catInput.addEventListener(\'change\', validateForm);

  document.getElementById(\'addf\').onsubmit = async function(e){
    e.preventDefault();
    let d = Object.fromEntries(new FormData(this));
    d.opened = opened ? 1 : 0;
    // Re-check TOB before submitting, especially if items were fetched after initial input
    if (opened) {
        let currentTobVal = tobInput.value;
        let stillExists = allItems.find(x => x.tob === currentTobVal && x.opened == 1);
        if (stillExists) {
            openTobExists = true; // Update status
            tobWarning.innerHTML = `<span class=\"tob-warning\">Позиция с этим TOB уже <b>открыта</b>. Нельзя добавить.</span>`;
            tobWarning.style.display = "block";
            validateForm(); // Re-validate to disable button if needed
            return; // Prevent submission
        }
    }

    let resp = await fetch(`${backend}/add`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId, ...d})
    });
    let data = await resp.json();
    if (data.ok) {
      vibrate();
      msg("Позиция добавлена!", "success");
      fetchedItems = false; // Reset for next add operation to re-fetch
    } else {
      msg("Ошибка: " + data.error, "error");
    }
  };
}

function renderCard(r, actions = true) { // r should contain \'id\' from backend
  let badgeCol = `<div class=\"card-header-col\">
    <div class=\"card-badge\">${r.category}</div>
    <div class=\"card-status-badge ${r.opened == 1 ? "opened" : "closed"}\">${r.opened == 1 ? "Открыто" : "Закрыто"}</div>
  </div>`;
  let title = `<div class=\"card-title\" title=\"${r.name}\">${r.name}</div>`;
  let rows = `
    <div class=\"card-row\"><b>TOB:</b> ${r.tob}</div>
    <div class=\"card-row\"><b>Открыто:</b> ${r.opened_at}</div>
    <div class=\"card-row\"><b>Годен до:</b> ${r.expiry_at}</div>
  `;
  let buttons = "";
  if (actions) {
    if (r.opened == 1) {
      buttons = `<div class=\"card-actions-bottom\">
        <button class=\"deletebtn\" onclick=\"confirmDelete(\'${encodeURIComponent(JSON.stringify(r))}\')\">Удалить</button>
      </div>`;
    } else {
      buttons = `<div class=\"card-actions-bottom\">
        <button class=\"openbtn\" onclick=\"openCardActionsModal(\'${encodeURIComponent(JSON.stringify(r))}\')\">Открыть</button>
        <button class=\"deletebtn\" onclick=\"confirmDelete(\'${encodeURIComponent(JSON.stringify(r))}\')\">Удалить</button>
      </div>`;
    }
  }
  return `<div class=\"item-card\">${badgeCol}${title}${rows}${buttons}</div>`;
}

function showSearchPage() {
  setPageTitle(\'Поиск\');
  showPage(addBackButton(`
    <div id=\"searchBlock\" class=\"beautiful-form\" style=\"gap:10px;max-width:440px;\">
      <input id=\"searchInput\" type=\"text\" placeholder=\"Поиск по TOB или названию\" style=\"margin-bottom:7px;\">
      <div class=\"filter-bar-wrap\">
        <div class=\"filter-bar-section\" id=\"categoryFilterBar\"></div>
        <div class=\"filter-bar-section\" id=\"statusFilterBar\"></div>
      </div>
      <div id=\"searchResults\" style=\"min-height:90px;\"></div>
    </div>
  `));
  ensureTheme();

  const categories = [
    { value: "", label: "Все категории", icon: "" },
    { value: "🍯 Сиропы", label: "🍯 Сиропы", icon: "🍯" },
    { value: "🥕 Ингредиенты", label: "🥕 Ингредиенты", icon: "🥕" },
    { value: "📦 Прочее", label: "📦 Прочее", icon: "📦" }
  ];
  const statuses = [
    { value: "", label: "Все статусы" },
    { value: "opened", label: "Открыто" },
    { value: "closed", label: "Закрыто" }
  ];

  let currentCategory = "";
  let currentStatus = "";
  let allItems = [];
  let fetchedItems = false;

  const searchInput = document.getElementById(\'searchInput\');
  const resultsDiv = document.getElementById(\'searchResults\');
  const categoryFilterBar = document.getElementById(\'categoryFilterBar\');
  const statusFilterBar = document.getElementById(\'statusFilterBar\');

  function renderFilters() {
    categoryFilterBar.innerHTML = categories.map(cat => 
      `<button class=\"filter-btn ${cat.value === currentCategory ? \'active\' : \'\'}\" data-value=\"${cat.value}\">${cat.label}</button>`
    ).join(\'\');
    statusFilterBar.innerHTML = statuses.map(stat => 
      `<button class=\"filter-btn ${stat.value === currentStatus ? \'active\' : \'\'}\" data-value=\"${stat.value}\">${stat.label}</button>`
    ).join(\'\');

    categoryFilterBar.querySelectorAll(\'button\').forEach(btn => {
      btn.onclick = () => { currentCategory = btn.dataset.value; renderFilters(); performSearch(); };
    });
    statusFilterBar.querySelectorAll(\'button\').forEach(btn => {
      btn.onclick = () => { currentStatus = btn.dataset.value; renderFilters(); performSearch(); };
    });
  }

  async function fetchItemsAndSearch() {
    if (!fetchedItems) {
      resultsDiv.innerHTML = `<div style=\"text-align:center;color:#aaa;padding:10px;\">Загрузка списка...</div>`;
      try {
        let resp = await fetch(`${backend}/search`, {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({user_id: userId, query: ""})
        });
        let data = await resp.json();
        if (data.ok && Array.isArray(data.results)) {
          allItems = data.results;
        } else {
          allItems = [];
          resultsDiv.innerHTML = `<div class=\"error\">Ошибка загрузки: ${data.error || \'Не удалось получить данные\'}</div>`;
        }
      } catch (e) {
        allItems = [];
        resultsDiv.innerHTML = `<div class=\"error\">Сетевая ошибка при загрузке.</div>`;
      }
      fetchedItems = true;
    }
    performSearch();
  }

  function performSearch() {
    let query = searchInput.value.toLowerCase();
    let filtered = allItems.filter(item => {
      let nameMatch = item.name.toLowerCase().includes(query);
      let tobMatch = item.tob.includes(query);
      let categoryMatch = currentCategory ? item.category === currentCategory : true;
      let statusMatch = true;
      if (currentStatus === "opened") statusMatch = item.opened == 1;
      else if (currentStatus === "closed") statusMatch = item.opened == 0;
      return (nameMatch || tobMatch) && categoryMatch && statusMatch;
    });
    if (filtered.length) {
      resultsDiv.innerHTML = filtered.map(r => renderCard(r)).join(\'\');
    } else {
      resultsDiv.innerHTML = `<div style=\"text-align:center;color:#aaa;padding:10px;\">Ничего не найдено.</div>`;
    }
    ensureTheme();
  }

  searchInput.addEventListener(\'input\', performSearch);
  renderFilters();
  fetchItemsAndSearch();
}

function showExpiredPage() {
  setPageTitle(\'Проверка сроков\');
  showPage(addBackButton(`<div id=\"expiredResults\"><div style=\"text-align:center;color:#aaa;padding:10px;\">Загрузка...</div></div>`));
  fetch(`${backend}/search`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, query: ""})
  })
  .then(r => r.json())
  .then(data => {
    if (!data.ok) {
      document.getElementById(\'expiredResults\').innerHTML = `<div class=\"error\">Ошибка: ${data.error}</div>`;
      return;
    }
    let expired = data.results.filter(x=>x.expiry_at && new Date(x.expiry_at) < new Date());
    let soon = data.results.filter(x=>{
      if (!x.expiry_at) return false;
      let expDate = new Date(x.expiry_at);
      let today = new Date();
      let diff = (expDate - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3;
    });
    let html = "";
    if (expired.length) {
      html += `<h2>Просрочено</h2>` + expired.map(r => renderCard(r)).join(\'\');
    } else {
      html += `<h2>Просроченных позиций нет</h2>`;
    }
    if (soon.length) {
      html += `<h2 style=\"margin-top:20px;\">Скоро истекает (3 дня)</h2>` + soon.map(r => renderCard(r)).join(\'\');
    }
    document.getElementById(\'expiredResults\').innerHTML = html || `<div style=\"text-align:center;color:#aaa;padding:10px;\">Нет позиций для отображения.</div>`;
    ensureTheme();
  });
}

function openCardActionsModal(itemJson) {
  vibrate();
  const item = JSON.parse(decodeURIComponent(itemJson));
  const modalHtml = `
    <div class=\"modal-backdrop\" onclick=\"this.remove()\">
      <div class=\"modal-content\" onclick=\"event.stopPropagation()\">
        <h3>${item.name}</h3>
        <p>TOB: ${item.tob}</p>
        <p>Статус: ${item.opened == 1 ? \'Открыто\' : \'Закрыто\'}</p>
        ${item.opened == 0 ? `<button class=\"modal-btn open-action\" data-itemid=\'${item.id}\'>Открыть позицию</button>` : \'\'}
        <button class=\"modal-btn delete-action\" data-itemid=\'${item.id}\'>Удалить позицию</button>
        <button class=\"modal-btn cancel-action\" onclick=\"this.closest(\".modal-backdrop\").remove()\">Отмена</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML(\'beforeend\', modalHtml);
  const modal = document.body.lastElementChild;
  if (item.opened == 0) {
    modal.querySelector(\".open-action\").onclick = async () => {
      let resp = await fetch(`${backend}/open/${item.id}`, { // Use item.id
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({user_id: userId})
      });
      let data = await resp.json();
      if (data.ok) {
        msg("Позиция открыта!", "success");
      } else {
        msg("Ошибка: " + data.error, "error");
      }
      modal.remove();
    };
  }
  modal.querySelector(\".delete-action\").onclick = () => {
    modal.remove();
    confirmDelete(itemJson); // Pass original itemJson which includes id
  };
}

function confirmDelete(itemJson) {
  vibrate();
  const item = JSON.parse(decodeURIComponent(itemJson));
  const modalHtml = `
    <div class=\"modal-backdrop\" onclick=\"this.remove()\">
      <div class=\"modal-content\" onclick=\"event.stopPropagation()\">
        <h3>Удалить позицию?</h3>
        <p><b>${item.name}</b> (TOB: ${item.tob})</p>
        <p>Это действие нельзя будет отменить.</p>
        <button class=\"modal-btn delete-confirm\" data-itemid=\'${item.id}\'>Да, удалить</button>
        <button class=\"modal-btn cancel-action\" onclick=\"this.closest(\".modal-backdrop\").remove()\">Отмена</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML(\'beforeend\', modalHtml);
  const modal = document.body.lastElementChild;
  modal.querySelector(\".delete-confirm\").onclick = () => {
    modal.remove();
    deleteItem(item.id); // Pass only item.id
  };
}

async function deleteItem(itemId) { // Expecting just the ID now
  let resp = await fetch(`${backend}/delete`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, id: itemId })
  });
  let data = await resp.json();
  if (data.ok) {
    msg("Позиция удалена!", "success");
  } else {
    msg("Ошибка: " + data.error, "error");
  }
}

async function fetchUser(){
  let r = await fetch(`${backend}/user/${userId}`);
  let d = await r.json();
  if(d.ok) USER = d.user;
  else USER = {username: username || "Гость"};
  showMenu();
}
fetchUser();

