document.addEventListener('touchstart', function preventZoom(e) {
  if(e.touches.length > 1) e.preventDefault();
}, { passive: false });
let lastTouch = 0;
document.addEventListener('touchend', function(e){
  const now = Date.now();
  if(now - lastTouch <= 350){
    e.preventDefault();
  }
  lastTouch = now;
}, { passive: false });

const themeBtn = document.getElementById('themeToggle');
const themeText = document.getElementById('themeText');
function ensureTheme() {
  let theme = localStorage.getItem('theme');
  if(!theme) {
    if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark';
    else theme = 'light';
  }
  document.body.classList.toggle('dark', theme === 'dark');
  themeText.textContent = theme === 'dark' ? "Светлая тема" : "Тёмная тема";
}
function setTheme(dark) {
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  ensureTheme();
}
themeBtn.addEventListener('click', () => setTheme(!document.body.classList.contains('dark')));
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
  const avatar = document.getElementById('userAvatar');
  avatar.src = userPhoto;
  avatar.style.display = 'block';
}
document.getElementById('wrap').addEventListener('touchstart', function(e) {
  if (!e.target.closest('input, textarea, select, button')) {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
      active.blur();
    }
  }
});

if (!userId) {
  document.getElementById('main').innerHTML = `
    <div style="padding:22px 0;text-align:center" class="error">
      Откройте сайт через Telegram-бота, чтобы пользоваться баром.<br><br>
      <a href="${botLink}" style="color:#007aff;font-weight:bold" target="_blank">Открыть бота</a>
    </div>`;
  throw new Error("Not in Telegram Mini App");
}

window.showMenu = showMenu;
window.showAddPage = showAddPage;
window.showExpiredPage = showExpiredPage;
window.showSearchPage = showSearchPage;
window.openReopenForm = openReopenForm;
window.confirmDelete = confirmDelete;
window.deleteItem = deleteItem;
window.openCardActionsModal = openCardActionsModal;
window.showStatsPage = showStatsPage;
window.showExportPage = showExportPage;

function setPageTitle(title) {
  document.getElementById('pageTitle').innerHTML = title;
}
function showPage(contentHtml) {
  const el = document.getElementById("main");
  el.innerHTML = `<div class="page-anim">${contentHtml}</div>`;
  ensureTheme();
  window.scrollTo({top: 0, behavior: 'smooth'});
  forceExpand();
}
function addBackButton(html) {
  return `<button class="backbtn" onclick="showMenu()">Назад</button>` + html;
}
function msg(m, type=''){ showPage(addBackButton(`<div class="${type} result">${m}</div>`)); }
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
  setPageTitle('Ингредиенты <span style="color:#13c1e3;font-size:0.93em;">бара</span>');
  showPage(`
    <div class="welcome-block">
      <div class="welcome-greet">${welcomeGreeting()},<br>${USER ? USER.username : ""}!</div>
      ${USER && USER.bar_name ? `<span class="welcome-bar">Бар: ${USER.bar_name}</span>` : ""}
    </div>
    <div class="menu fadeIn" id="menuBlock">
      <button class="menu-btn" onclick="showAddPage()">Добавить позицию</button>
      <button class="menu-btn" onclick="showExpiredPage()">Проверить сроки</button>
      <button class="menu-btn" onclick="showSearchPage()">Поиск</button>
      <button class="menu-btn" onclick="showStatsPage()">Статистика бара</button>
      <button class="menu-btn" onclick="showExportPage()">Экспорт (Excel / PDF)</button>
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
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
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
document.body.addEventListener('focusin', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
    scrollInputIntoView(e.target);
  }
});

function showStatsPage() {
  setPageTitle('Статистика бара');
  showPage(addBackButton(`<div class="stat-block" id="statBlock"><div style="text-align:center;color:#aaa;">Загрузка...</div></div>`));
  fetch(`${backend}/search`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, query: ""})
  })
  .then(r => r.json())
  .then(data => {
    if (!data.ok) {
      document.getElementById('statBlock').innerHTML = `<div class="error">Ошибка: ${data.error}</div>`;
      return;
    }
    let total = data.results.length;
    let opened = data.results.filter(x=>x.opened==1).length;
    let closed = data.results.filter(x=>x.opened==0).length;
    let expired = data.results.filter(x=>x.expiry_at && new Date(x.expiry_at) < new Date()).length;
    document.getElementById('statBlock').innerHTML = `
      <div class="stat-row"><span class="stat-label">Всего позиций:</span> <span class="stat-value blue">${total}</span></div>
      <div class="stat-row"><span class="stat-label">Открытых:</span> <span class="stat-value">${opened}</span></div>
      <div class="stat-row"><span class="stat-label">Закрытых:</span> <span class="stat-value gray">${closed}</span></div>
      <div class="stat-row"><span class="stat-label">Просрочено:</span> <span class="stat-value red">${expired}</span></div>
    `;
  });
}

function showExportPage() {
  setPageTitle('Экспорт');
  showPage(addBackButton(`<div class="export-block">
    <div class="export-info">Скачать все позиции в формате Excel или PDF</div>
    <button class="export-btn" onclick="exportPositions('csv')">Скачать Excel (CSV)</button>
    <button class="export-btn" onclick="exportPositions('pdf')">Скачать PDF</button>
    <div class="export-info" style="font-size:0.93em;color:#888;">Список включает все открытые и закрытые позиции вашего бара.</div>
  </div>`));
}
function exportPositions(type) {
  fetch(`${backend}/search`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, query: ""})
  })
  .then(r => r.json())
  .then(data => {
    if (!data.ok) {
      showNotification("Ошибка экспорта: " + data.error, true);
      return;
    }
    if (type === "csv") {
      let rows = [["Категория","TOB","Название","Дата открытия","Срок хранения (дней)","Годен до","Статус"]];
      data.results.forEach(x=>{
        rows.push([
          x.category, x.tob, x.name, x.opened_at, x.shelf_life_days, x.expiry_at, x.opened==1?"Открыто":"Закрыто"
        ]);
      });
      let csv = rows.map(r=>r.map(s=>`"${s}"`).join(";")).join("\n");
      let blob = new Blob([csv], {type: "text/csv"});
      let link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "bar-export.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else if (type === "pdf") {
      let html = `<table border="1" cellpadding="6" style="font-size:12px;border-collapse:collapse;"><tr><th>Категория</th><th>TOB</th><th>Название</th><th>Дата открытия</th><th>Срок (дней)</th><th>Годен до</th><th>Статус</th></tr>`;
      data.results.forEach(x=>{
        html+=`<tr><td>${x.category}</td><td>${x.tob}</td><td>${x.name}</td><td>${x.opened_at}</td><td>${x.shelf_life_days}</td><td>${x.expiry_at}</td><td>${x.opened==1?"Открыто":"Закрыто"}</td></tr>`;
      });
      html+="</table>";
      let blob = new Blob([`<h2>Список позиций</h2>${html}`], {type: "text/html"});
      let link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "bar-export.html";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  });
}

function showAddPage() {
  setPageTitle('Добавить позицию');
  showPage(addBackButton(`
    <form id="addf" class="beautiful-form" autocomplete="off">
      <div class="field-row">
        <label class="field-label" for="category">Категория</label>
        <select name="category" id="category" required>
          <option value="🍯 Сиропы">🍯 Сиропы</option>
          <option value="🥕 Ингредиенты">🥕 Ингредиенты</option>
          <option value="📦 Прочее">📦 Прочее</option>
        </select>
      </div>
      <div class="status-toggle-bar" id="statusToggleBar">
        <button type="button" class="status-toggle-btn opened selected" id="btnOpened">Открыто</button>
        <button type="button" class="status-toggle-btn closed" id="btnClosed">Закрыто</button>
      </div>
      <div class="field-row">
        <label class="field-label" for="tob">TOB (6 цифр)</label>
        <input name="tob" id="tob" maxlength="6" pattern="\\d{6}" required placeholder="123456" autocomplete="off">
        <div id="tobWarning" style="display:none"></div>
      </div>
      <div class="field-row">
        <label class="field-label" for="name">Название</label>
        <input name="name" id="name" required placeholder="Название позиции">
      </div>
      <div class="field-row">
        <label class="field-label" for="shelf_life_days">Срок хранения (дней)</label>
        <input name="shelf_life_days" id="shelf_life_days" type="number" min="1" required placeholder="30">
      </div>
      <div class="field-row">
        <label class="field-label" for="opened_at">Дата открытия</label>
        <input name="opened_at" id="opened_at" type="date" required>
      </div>
      <div class="btns">
        <button type="submit" id="addSubmitBtn" disabled>Добавить</button>
      </div>
    </form>
  `));
  ensureTheme();
  setTimeout(() => {
    let inputs = document.querySelectorAll('.beautiful-form input, .beautiful-form select');
    inputs.forEach(inp => {
      inp.addEventListener('focus', function() {
        scrollInputIntoView(this);
      });
    });
  }, 100);

  let opened = true;
  const btnOpened = document.getElementById('btnOpened');
  const btnClosed = document.getElementById('btnClosed');
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
    validateForm();
  };
  btnClosed.onclick = function() {
    opened = false;
    updateStatusButtons();
    validateForm();
  };
  updateStatusButtons();

  let allItems = [];
  let fetchedItems = false;
  let openTobExists = false;
  const tobInput = document.getElementById('tob');
  const tobWarning = document.getElementById('tobWarning');
  const nameInput = document.getElementById('name');
  const shelfInput = document.getElementById('shelf_life_days');
  const dateInput = document.getElementById('opened_at');
  const catInput = document.getElementById('category');
  const submitBtn = document.getElementById('addSubmitBtn');

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
    if (fetchedItems) return;
    fetchedItems = true;
    let resp = await fetch(`${backend}/search`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId, query: ""})
    });
    let data = await resp.json();
    if (data.ok && Array.isArray(data.results)) {
      allItems = data.results;
    }
  }

  function checkTob() {
    let tobVal = tobInput.value;
    openTobExists = false;
    tobWarning.style.display = "none";
    tobWarning.innerHTML = "";
    if (tobVal.length === 6) {
      let exists = allItems.find(x => x.tob === tobVal && x.opened == 1);
      if (exists) {
        openTobExists = true;
        tobWarning.innerHTML = `<span class="tob-warning">Позиция с этим TOB уже <b>открыта</b>. Можете добавить только закрытую позицию, либо сначала закройте открытую.</span>`;
        tobWarning.style.display = "block";
      }
    }
    validateForm();
  }

  tobInput.addEventListener('input', async function() {
    await fetchItemsOnce();
    checkTob();
  });
  nameInput.addEventListener('input', validateForm);
  shelfInput.addEventListener('input', validateForm);
  dateInput.addEventListener('input', validateForm);
  catInput.addEventListener('change', validateForm);

  document.getElementById('addf').onsubmit = async function(e){
    e.preventDefault();
    let d = Object.fromEntries(new FormData(this));
    d.opened = opened ? 1 : 0;
    if (opened && openTobExists) return;
    let resp = await fetch(`${backend}/add`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId, ...d})
    });
    let data = await resp.json();
    if (data.ok) {
      vibrate();
      msg("Позиция добавлена!", "success");
    } else {
      msg("Ошибка: " + data.error, "error");
    }
  };
}

function renderCard(r, actions = true) {
  let badgeCol = `<div class="card-header-col">
    <div class="card-badge">${r.category}</div>
    <div class="card-status-badge ${r.opened == 1 ? "opened" : "closed"}">${r.opened == 1 ? "Открыто" : "Закрыто"}</div>
  </div>`;
  let title = `<div class="card-title" title="${r.name}">${r.name}</div>`;
  let rows = `
    <div class="card-row"><b>TOB:</b> ${r.tob}</div>
    <div class="card-row"><b>Открыто:</b> ${r.opened_at}</div>
    <div class="card-row"><b>Годен до:</b> ${r.expiry_at}</div>
  `;
  let buttons = "";
  if (actions) {
    if (r.opened == 1) {
      buttons = `<div class="card-actions-bottom">
        <button class="editbtn" onclick="openReopenForm('${encodeURIComponent(JSON.stringify(r))}');return false;">Изменить</button>
        <button class="deletebtn" onclick="confirmDelete('${encodeURIComponent(JSON.stringify(r))}');return false;">Удалить</button>
      </div>`;
    } else {
      buttons = `<div class="card-actions-bottom">
        <button class="openbtn" onclick="openCardActionsModal('${encodeURIComponent(JSON.stringify(r))}');return false;">Открыть</button>
        <button class="deletebtn" onclick="confirmDelete('${encodeURIComponent(JSON.stringify(r))}');return false;">Удалить</button>
      </div>`;
    }
  }
  return `<div class="item-card">${badgeCol}${title}${rows}${buttons}</div>`;
}

function showSearchPage() {
  setPageTitle('Поиск');
  showPage(addBackButton(`
    <div id="searchBlock" class="beautiful-form" style="gap:10px;max-width:440px;">
      <input id="searchInput" type="text" placeholder="Поиск по TOB или названию" style="margin-bottom:7px;">
      <div class="filter-bar-wrap">
        <div class="filter-bar-section" id="categoryFilterBar"></div>
        <div class="filter-bar-section" id="statusFilterBar"></div>
      </div>
      <div id="searchResults" style="min-height:90px;"></div>
    </div>
  `));
  ensureTheme();

  const categories = [
    { value: "", label: "Все категории", icon: "" },
    { value: "🍯 Сиропы", label: "Сиропы", icon: "" },
    { value: "🥕 Ингредиенты", label: "Ингредиенты", icon: "" },
    { value: "📦 Прочее", label: "Прочее", icon: "" }
  ];
  const statuses = [
    { value: "", label: "Все статусы" },
    { value: "1", label: "Открыто" },
    { value: "0", label: "Закрыто" }
  ];
  let filterCategory = "";
  let filterOpened = "";

  function renderCategoryBar() {
    const bar = document.getElementById('categoryFilterBar');
    bar.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = "button";
      btn.className = "filter-btn" + (filterCategory === cat.value ? " selected" : "");
      btn.innerHTML = (cat.icon ? cat.icon + ' ' : '') + cat.label;
      btn.onclick = () => {
        filterCategory = cat.value;
        renderCategoryBar();
        renderList();
      };
      bar.appendChild(btn);
    });
  }
  function renderStatusBar() {
    const bar = document.getElementById('statusFilterBar');
    bar.innerHTML = '';
    statuses.forEach(status => {
      const btn = document.createElement('button');
      btn.type = "button";
      btn.className = "filter-btn status" + (filterOpened === status.value ? " selected" : "");
      btn.innerHTML = status.label;
      btn.onclick = () => {
        filterOpened = status.value;
        renderStatusBar();
        renderList();
      };
      bar.appendChild(btn);
    });
  }
  renderCategoryBar();
  renderStatusBar();

  const input = document.getElementById('searchInput');
  let allItems = [];
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = `<div style="text-align:center;color:#aaa;font-size:1.07em;">Загрузка...</div>`;
  fetch(`${backend}/search`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, query: ""})
  })
  .then(r => r.json())
  .then(data => {
    if (!data.ok) return resultsDiv.innerHTML = `<div class="error">Ошибка: ${data.error}</div>`;
    allItems = data.results;
    renderList();
  });
  function renderList() {
    let filter = (input.value||"").trim().toLowerCase();
    let items = allItems;
    if (filterCategory) items = items.filter(x=>x.category === filterCategory);
    if (filterOpened !== '') items = items.filter(x=>String(x.opened)==filterOpened);
    if (filter) {
      items = items.filter(
        x => x.tob.toLowerCase().includes(filter) || x.name.toLowerCase().includes(filter)
      );
      let openedArr = items.filter(i => i.opened == 1);
      let closedArr = items.filter(i => i.opened == 0);
      closedArr.sort((a, b) => {
        let ea = new Date(a.expiry_at), eb = new Date(b.expiry_at);
        return Math.abs(ea - Date.now()) - Math.abs(eb - Date.now());
      });
      items = [...openedArr, ...closedArr];
    }
    if (!items.length) {
      resultsDiv.innerHTML = `<div style="text-align:center;color:#bbb;font-size:1.07em;margin-top:18px;">Ничего не найдено</div>`;
      return;
    }
    let cards = `<div class="card-list" style="animation:none">`;
    items.forEach(r => {
      cards += renderCard(r);
    });
    cards += `</div>`;
    resultsDiv.innerHTML = cards;
  }
  input.addEventListener('input', renderList);
}

function openCardActionsModal(rJson) {
  let r = typeof rJson === "string" ? JSON.parse(decodeURIComponent(rJson)) : rJson;
  let old = document.querySelector('.modal-overlay');
  if (old) old.classList.add('hide');
  setTimeout(() => {
    if (old) old.remove();
    let overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-title">Открыть позицию?</div>
        <div class="modal-buttons-row">
          <button class="modal-btn openbtn" onclick="autoOpen('${encodeURIComponent(JSON.stringify(r))}')">Открыть</button>
          <button class="modal-btn edit" onclick="closeDeleteModal()">Отмена</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    ensureTheme();
  }, 10);
}

async function autoOpen(rJson) {
  let r = typeof rJson === "string" ? JSON.parse(decodeURIComponent(rJson)) : rJson;
  closeDeleteModal();
  let today = new Date().toISOString().slice(0,10);

  let respSearch = await fetch(`${backend}/search`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, query: r.tob})
  });
  let dataSearch = await respSearch.json();
  let openedItem = dataSearch.ok && Array.isArray(dataSearch.results)
    ? dataSearch.results.find(x => x.tob === r.tob && x.opened == 1)
    : null;
  if (openedItem) {
    await fetch(`${backend}/delete`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId, tob: openedItem.tob, opened: 1, opened_at: openedItem.opened_at})
    });
  }
  await fetch(`${backend}/delete`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, tob: r.tob, opened: 0, opened_at: r.opened_at})
  });
  let reqAdd = {
    user_id: userId,
    category: r.category,
    tob: r.tob,
    name: r.name,
    opened_at: today,
    shelf_life_days: r.shelf_life_days,
    opened: 1
  };
  let resp = await fetch(`${backend}/add`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(reqAdd)
  });
  let data = await resp.json();
  if (data.ok) {
    showNotification("Позиция открыта!", false);
    showSearchPage();
  } else {
    showNotification("Ошибка открытия: "+data.error, true);
  }
}

function confirmDelete(rJson) {
  let r = typeof rJson === "string" ? JSON.parse(decodeURIComponent(rJson)) : rJson;
  let old = document.querySelector('.modal-overlay');
  if (old) old.classList.add('hide');
  setTimeout(() => {
    if (old) old.remove();
    let overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-title">
          Вы действительно хотите удалить <span class="delete-item-name">${r.name}</span>?
        </div>
        <div class="modal-buttons-row">
          <button class="modal-btn deletebtn" onclick="deleteItem('${encodeURIComponent(JSON.stringify(r))}')">Удалить</button>
          <button class="modal-btn edit" onclick="closeDeleteModal()">Отмена</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    ensureTheme();
  }, 10);
}
function closeDeleteModal() {
  let overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;
  overlay.classList.add('hide');
  setTimeout(() => overlay.remove(), 180);
}
async function deleteItem(rJson) {
  let r = typeof rJson === "string" ? JSON.parse(decodeURIComponent(rJson)) : rJson;
  let overlay = document.querySelector('.modal-overlay');
  if(overlay) overlay.classList.add('hide');
  setTimeout(async () => {
    if(overlay) overlay.remove();
    let resp = await fetch(`${backend}/delete`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId, tob: r.tob, opened: r.opened, opened_at: r.opened_at})
    });
    let data = await resp.json();
    if (data.ok) {
      vibrate();
      showNotification("Позиция удалена!");
      showSearchPage();
    } else {
      showNotification("Ошибка удаления: " + data.error, true);
      showSearchPage();
    }
  }, 180);
}
function showNotification(msg, isError = false) {
  let old = document.getElementById('notifOverlay');
  if (old) {
    old.classList.add('hide');
    setTimeout(()=>old.remove(),370);
  }
  let overlay = document.createElement('div');
  overlay.className = 'notif-overlay';
  overlay.id = 'notifOverlay';
  overlay.innerHTML = `<div class="notif-popup${isError?' error':''}">${msg}</div>`;
  document.body.appendChild(overlay);
  setTimeout(() => { overlay.querySelector('.notif-popup').style.opacity = 1; }, 10);
  setTimeout(() => {
    let popup = overlay.querySelector('.notif-popup');
    if (popup) popup.classList.add('hide');
    setTimeout(()=>overlay.remove(), 370);
  }, 1700);
}
function showExpiredPage() {
  setPageTitle('Проверка сроков');
  showPage(addBackButton(`<div id="expiredTitle" style="text-align:center;color:#aaa;font-size:1.07em;">Загрузка...</div><div id="expiredCards"></div>`));
  ensureTheme();
  fetch(backend+"/expired",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:userId})})
    .then(r=>r.json())
    .then(d=>{
      const title = document.getElementById('expiredTitle');
      const cardsDiv = document.getElementById('expiredCards');
      if(!d.ok) {
        title.innerHTML = "Ошибка: "+d.error;
        cardsDiv.innerHTML = "";
        return;
      }
      if(!d.results.length) {
        title.innerHTML = "Нет просроченных позиций!";
        title.className = "success";
        cardsDiv.innerHTML = "";
        return;
      }
      title.innerHTML = "Просроченные позиции:";
      title.className = "";
      let cards = `<div class="card-list">`;
      d.results.forEach(x=>{
        cards += renderCard(x, false);
      });
      cards += `</div>`;
      cardsDiv.innerHTML = cards;
      ensureTheme();
    });
}
function startApp() {
  showGlobalLoader(true);
  const MIN_LOAD = 1200 + Math.floor(Math.random()*500);
  let t0 = Date.now();
  showPage(`
    <div class="welcome-block">
      <div class="welcome-greet">${welcomeGreeting()},<br>${USER ? USER.username : ""}!</div>
      ${USER && USER.bar_name ? `<span class="welcome-bar">Бар: ${USER.bar_name}</span>` : ""}
    </div>
  `);
  ensureTheme();
  fetch("https://bar-backend-production.up.railway.app/userinfo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  }).then(r=>r.json()).then(d=>{
    let dt = Date.now() - t0;
    setTimeout(()=>{
      showGlobalLoader(false);
      if (!d.ok) {
        setPageTitle('Добро пожаловать');
        showPage(`
          <div class="welcome-block">
            <div class="welcome-greet">${welcomeGreeting()}, гость!</div>
            <div style="margin:16px 0 24px 0;color:#888;font-size:1.05em;">Сначала зарегистрируйтесь через Telegram-бота, чтобы пользоваться приложением.</div>
            <a href="${botLink}" target="_blank" style="display:inline-block; padding:14px 28px; background:linear-gradient(90deg,#007aff 70%,#13c1e3 100%); color:#fff; border-radius:15px; font-size:1.1em; font-weight:700; text-decoration:none; box-shadow:0 3px 16px #13c1e340; margin-bottom:9px; transition:background 0.24s;">Открыть Telegram-бота</a>
          </div>
        `);
        ensureTheme();
        return;
      }
      USER = { username: d.username, bar_name: d.bar_name };
      showMenu();
    }, Math.max(MIN_LOAD - dt, 0));
  });
}
function showGlobalLoader(show = true) {
  const loader = document.getElementById('globalLoader');
  const wrap = document.getElementById('wrap');
  if (show) {
    loader.style.display = 'flex';
    wrap.style.display = 'none';
    setTimeout(() => loader.style.opacity = "1", 10);
  } else {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = 'none';
      wrap.style.display = '';
    }, 370);
  }
}
function fixIOSHeight() {
  const wrap = document.getElementById('wrap');
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    wrap.style.height = window.innerHeight + 'px';
    setTimeout(() => {
      wrap.style.height = window.innerHeight + 'px';
    }, 200);
  } else {
    wrap.style.height = '';
  }
}
window.addEventListener('resize', fixIOSHeight);
window.addEventListener('focusin', fixIOSHeight);
window.addEventListener('focusout', fixIOSHeight);
window.addEventListener('orientationchange', fixIOSHeight);
fixIOSHeight();
startApp();
