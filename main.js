function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"'`=\/]/g, function(s) {
    return ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#96;",
      "=": "&#61;",
      "/": "&#47;"
    })[s];
  });
}
let lastAction = {};
function canProceed(action, minInterval = 1200) {
  const now = Date.now();
  if (!lastAction[action] || now - lastAction[action] > minInterval) {
    lastAction[action] = now;
    return true;
  }
  return false;
}
function isValidCategory(cat) {
  return ["🍯 Сиропы", "🥕 Ингредиенты", "☕ Кофе", "📦 Прочее"].includes(cat);
}
function isValidName(name) {
  return name && name.length <= 60 && !/[<>&]/.test(name);
}
function isValidTob(tob) {
  return tob && /^\d{6}$/.test(tob);
}
function isValidShelf(s) {
  return s && /^\d+$/.test(s) && Number(s) > 0 && Number(s) <= 365;
}
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
const backend = "https://web-production-2c7db.up.railway.app";
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
window.showStatsPage = showStatsPage;

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
function msg(m, type=''){ showPage(addBackButton(`<div class="${type} result">${escapeHtml(m)}</div>`)); }
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
      <div class="welcome-greet">${escapeHtml(welcomeGreeting())},<br>${USER ? escapeHtml(USER.username) : ""}!</div>
      ${USER && USER.bar_name ? `<span class="welcome-bar">Бар: ${escapeHtml(USER.bar_name)}</span>` : ""}
    </div>
    <div class="menu fadeIn" id="menuBlock">
      <button class="menu-btn" onclick="showAddPage()">Добавить позицию</button>
      <button class="menu-btn" onclick="showExpiredPage()">Проверить сроки</button>
      <button class="menu-btn" onclick="showSearchPage()">Поиск</button>
      <button class="menu-btn" onclick="showStatsPage()">Статистика бара</button>
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
  setTimeout(()=>document.getElementById('statBlock').classList.add('fadeIn'),50);
  fetch(`${backend}/search`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, query: ""})
  })
  .then(r => r.json())
  .then(data => {
    if (!data.ok) {
      document.getElementById('statBlock').innerHTML = `<div class="error">Ошибка: ${escapeHtml(data.error)}</div>`;
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
    document.getElementById('statBlock').classList.add('fadeIn');
  });
}
function msTimeNow() {
  const now = new Date();
  const msOffset = 3 * 60 * 60 * 1000;
  return new Date(now.getTime() + msOffset);
}
function msDateStrToDate(dateStr) {
  return new Date(new Date(dateStr).getTime() + 3 * 60 * 60 * 1000);
}
function msDaysBetween(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return '-';
  const d1 = msDateStrToDate(dateStr1);
  const d2 = msDateStrToDate(dateStr2);
  return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
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
          <option value="☕ Кофе">☕ Кофе</option>
          <option value="📦 Прочее">📦 Прочее</option>
        </select>
      </div>
      <div class="status-toggle-bar" id="statusToggleBar">
        <button type="button" class="status-toggle-btn opened selected" id="btnOpened">Открыто</button>
        <button type="button" class="status-toggle-btn closed" id="btnClosed">Закрыто</button>
      </div>
      <div class="field-row">
        <label class="field-label" for="tob">TOB (6 цифр)</label>
        <input name="tob" id="tob" maxlength="6" pattern="\\d{6}" required placeholder="123456" autocomplete="off" inputmode="numeric">
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
  let openedItemName = '';
  const tobInput = document.getElementById('tob');
  const tobWarning = document.getElementById('tobWarning');
  const nameInput = document.getElementById('name');
  const shelfInput = document.getElementById('shelf_life_days');
  const dateInput = document.getElementById('opened_at');
  const catInput = document.getElementById('category');
  const submitBtn = document.getElementById('addSubmitBtn');
  tobInput.addEventListener('keydown', function(e){
    if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
  });
  tobInput.addEventListener('input', function(e){
    this.value = this.value.replace(/\D/g, '').slice(0,6);
  });

  function validateForm() {
    let allOk = true;
    if (!isValidCategory(catInput.value)) allOk = false;
    if (!isValidTob(tobInput.value)) allOk = false;
    if (!isValidName(nameInput.value.trim())) allOk = false;
    if (!isValidShelf(shelfInput.value)) allOk = false;
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
    nameInput.readOnly = false;
    nameInput.value = '';
    openedItemName = '';
    if (tobVal.length === 6) {
      let exists = allItems.find(x => x.tob === tobVal && x.opened == 1);
      if (exists) {
        openTobExists = true;
        nameInput.value = exists.name;
        nameInput.readOnly = true;
        openedItemName = exists.name;
        tobWarning.innerHTML = `<span class="tob-warning">Добавление открытой позиции с этим TOB запрещено. Сначала закройте или удалите открытую позицию с этим TOB.</span>`;
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
    if (!isValidCategory(d.category) || !isValidTob(d.tob) || !isValidName(d.name) || !isValidShelf(d.shelf_life_days)) {
      msg("Некорректные данные, проверьте поля.", "error");
      return;
    }
    if (!canProceed("add", 1200)) return;
    if (opened && openTobExists) return;
    let req = {
      user_id: userId,
      category: d.category,
      tob: d.tob,
      name: d.name,
      shelf_life_days: d.shelf_life_days,
      opened: d.opened,
      opened_at: d.opened_at
    };
    let url = `${backend}/add`;
    let resp = await fetch(url, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(req)
    });
    let data = await resp.json();
    if (data.ok) {
      vibrate();
      showCheckAnim();
      setTimeout(() => {
        msg("Позиция добавлена!", "success");
      }, 1000);
    } else {
      msg("Ошибка: " + data.error, "error");
    }
  };
}
function renderCard(r, actions = true) {
  let badgeCol = `<div class="card-header-col">
    <div class="card-badge category-badge">${escapeHtml(r.category)}</div>
    <div class="card-status-badge ${r.opened == 1 ? "opened" : "closed"}">${r.opened == 1 ? "Открыто" : "Закрыто"}</div>
  </div>`;
  let title = `<div class="card-title" title="${escapeHtml(r.name)}">${escapeHtml(r.name)}</div>`;
  let rows = `
    <div class="card-row"><b>TOB:</b> ${escapeHtml(r.tob)}</div>
    <div class="card-row"><b>Открыто:</b> ${escapeHtml(r.opened_at)}</div>
    <div class="card-row"><b>Годен до:</b> ${escapeHtml(r.expiry_at)}</div>
  `;
  let buttons = "";
  if (actions) {
    if (r.opened == 1) {
      buttons = `<div class="card-actions-bottom">
        <button class="editbtn" onclick="openReopenForm('${encodeURIComponent(JSON.stringify(r))}');return false;">Изменить</button>
        <button class="deletebtn" onclick="showDeleteModal('${encodeURIComponent(JSON.stringify(r))}')">Удалить</button>
      </div>`;
    } else {
      buttons = `<div class="card-actions-bottom">
        <button class="openbtn" onclick="showOpenModal('${encodeURIComponent(JSON.stringify(r))}')">Открыть</button>
        <button class="editbtn" onclick="openReopenForm('${encodeURIComponent(JSON.stringify(r))}');return false;">Изменить</button>
        <button class="deletebtn" onclick="showDeleteModal('${encodeURIComponent(JSON.stringify(r))}')">Удалить</button>
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
    { value: "🍯 Сиропы", label: "🍯 Сиропы", icon: "" },
    { value: "🥕 Ингредиенты", label: "🥕 Ингредиенты", icon: "" },
    { value: "☕ Кофе", label: "☕ Кофе", icon: "" },
    { value: "📦 Прочее", label: "📦 Прочее", icon: "" }
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
      btn.innerHTML = cat.label;
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
    if (!data.ok) return resultsDiv.innerHTML = `<div class="error">Ошибка: ${escapeHtml(data.error)}</div>`;
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
function showDeleteModal(rJson) {
  let r = typeof rJson === "string" ? JSON.parse(decodeURIComponent(rJson)) : rJson;
  closeModal();
  let overlay = document.createElement('div');
  overlay.className = 'modal-overlay show-blur';
  overlay.innerHTML = `
    <div class="modal-dialog modal-delete">
      <div class="modal-title">
        <span>Вы уверены, что хотите удалить </span>
        <span class="modal-name-box">${escapeHtml(r.name)}</span>?
      </div>
      <div class="modal-buttons-row">
        <button class="modal-btn deletebtn" onclick="deleteItem('${encodeURIComponent(JSON.stringify(r))}')">Удалить</button>
        <button class="modal-btn cancelbtn" onclick="closeModal()">Отмена</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('visible'), 10);
  ensureTheme();
}
async function deleteItem(rJson) {
  if (!canProceed("delete", 1200)) return;
  let r = typeof rJson === "string" ? JSON.parse(decodeURIComponent(rJson)) : rJson;
  let overlay = document.querySelector('.modal-overlay.show-blur');
  let dialog = overlay ? overlay.querySelector('.modal-dialog.modal-delete') : null;
  if (dialog) {
    dialog.classList.add('success-check');
    dialog.innerHTML = `<div class="check-anim"><svg viewBox="0 0 110 110"><polyline points="30,58 50,80 82,36"/></svg></div>`;
    vibrate();
  }
  try {
    let resp = await fetch(`${backend}/delete`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId, id: r.id})
    });
    let data = await resp.json();
    if (!data.ok && dialog) {
      dialog.innerHTML = `<div class="error" style="padding:22px;">Ошибка: ${escapeHtml(data.error || "Ошибка удаления")}</div>`;
    } else {
      setTimeout(() => {
        closeModal();
        showSearchPage();
      }, 1000);
    }
  } catch (e) {
    if (dialog) {
      dialog.innerHTML = `<div class="error" style="padding:22px;">Ошибка: ${escapeHtml(e.message || "Ошибка сети")}</div>`;
    }
  }
}
async function findOpenedByTOB(tob) {
  let resp = await fetch(`${backend}/search`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, query: tob})
  });
  let data = await resp.json();
  return (data.results || []).find(x => x.tob === tob && x.opened == 1);
}
function showOpenModal(rJson) {
  let r = typeof rJson === "string" ? JSON.parse(decodeURIComponent(rJson)) : rJson;
  closeModal();
  findOpenedByTOB(r.tob).then(opened => {
    let overlay = document.createElement('div');
    overlay.className = 'modal-overlay show-blur';
    if (opened) {
      let days = msDaysBetween(opened.opened_at, opened.expiry_at);
      overlay.innerHTML = `
        <div class="modal-dialog modal-delete">
          <div class="modal-title">
            <span class="modal-name-box">${escapeHtml(opened.name)}</span>
            <div style="font-size:0.97em;color:#888;margin-top:5px;">Срок годности открытой: ${days !== '-' ? days + ' дн.' : '-'}</div>
          </div>
          <div class="modal-buttons-row">
            <button class="modal-btn editbtn" onclick="openReopenForm('${encodeURIComponent(JSON.stringify(r))}')">Изменить</button>
            <button class="modal-btn openbtn" onclick="autoOpen('${encodeURIComponent(JSON.stringify(r))}')">Открыть</button>
          </div>
          <button class="modal-btn cancel-full" onclick="closeModal()">Отмена</button>
        </div>
      `;
    } else {
      overlay.innerHTML = `
        <div class="modal-dialog modal-delete">
          <button class="modal-btn openbtn" style="width:100%;margin-bottom:12px;" onclick="openReopenForm('${encodeURIComponent(JSON.stringify(r))}', true)">Изменить и открыть</button>
          <button class="modal-btn cancel-full" onclick="closeModal()">Отмена</button>
        </div>
      `;
    }
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('visible'), 10);
    ensureTheme();
  });
}
function closeModal() {
  let overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  setTimeout(() => overlay.remove(), 370);
}
async function autoOpen(rJson) {
  let r = typeof rJson === "string" ? JSON.parse(decodeURIComponent(rJson)) : rJson;
  let overlay = document.querySelector('.modal-overlay.show-blur');
  let dialog = overlay ? overlay.querySelector('.modal-dialog') : null;
  let msNow = msTimeNow();
  let today = msNow.toISOString().slice(0,10);
  let opened = await findOpenedByTOB(r.tob);
  let expiry_at = r.expiry_at;
  if (opened) {
    expiry_at = opened.expiry_at;
    await fetch(`${backend}/delete`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId, id: opened.id})
    });
  }
  await fetch(`${backend}/update`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      user_id: userId,
      id: r.id,
      opened: 1,
      opened_at: today,
      expiry_at: expiry_at
    })
  });
  if (dialog) {
    dialog.classList.add('success-check');
    dialog.innerHTML = `<div class="check-anim"><svg viewBox="0 0 110 110"><polyline points="30,58 50,80 82,36"/></svg></div>`;
    vibrate();
  }
  setTimeout(() => {
    closeModal();
    showSearchPage();
  }, 1000);
}
function openReopenForm(rJson, openAfterEdit = false) {
  let r = typeof rJson === "string" ? JSON.parse(decodeURIComponent(rJson)) : rJson;
  setPageTitle('Редактировать позицию');
  showPage(addBackButton(`
    <form id="editf" class="beautiful-form" autocomplete="off" style="max-width:430px;">
      <div class="field-row">
        <label class="field-label">TOB (нельзя изменить)</label>
        <input value="${escapeHtml(r.tob)}" readonly style="background:#eaf2ff;color:#888;">
      </div>
      <div class="field-row">
        <label class="field-label" for="edit_name">Название</label>
        <input name="edit_name" id="edit_name" required value="${escapeHtml(r.name)}">
      </div>
      <div class="field-row">
        <label class="field-label" for="edit_category">Категория</label>
        <select name="edit_category" id="edit_category" required>
          <option value="🍯 Сиропы" ${r.category === "🍯 Сиропы"?"selected":""}>🍯 Сиропы</option>
          <option value="🥕 Ингредиенты" ${r.category === "🥕 Ингредиенты"?"selected":""}>🥕 Ингредиенты</option>
          <option value="☕ Кофе" ${r.category === "☕ Кофе"?"selected":""}>☕ Кофе</option>
          <option value="📦 Прочее" ${r.category === "📦 Прочее"?"selected":""}>📦 Прочее</option>
        </select>
      </div>
      <div class="field-row">
        <label class="field-label" for="edit_shelf_life_days">Срок хранения (дней)</label>
        <input name="edit_shelf_life_days" id="edit_shelf_life_days" type="number" min="1" required value="${escapeHtml(""+r.shelf_life_days)}">
      </div>
      <div class="field-row">
        <label class="field-label" for="edit_opened_at">Дата открытия</label>
        <input name="edit_opened_at" id="edit_opened_at" type="date" required value="${escapeHtml(r.opened_at)}">
      </div>
      <div class="btns">
        <button type="submit" id="editSubmitBtn">Сохранить</button>
      </div>
    </form>
  `));
  ensureTheme();
  document.getElementById('editf').onsubmit = async function(e) {
    e.preventDefault();
    let d = Object.fromEntries(new FormData(this));
    let req = {
      user_id: userId,
      id: r.id,
      category: d.edit_category,
      name: d.edit_name,
      shelf_life_days: d.edit_shelf_life_days,
      opened_at: d.edit_opened_at
    };
    if (!isValidCategory(req.category) || !isValidName(req.name) || !isValidShelf(req.shelf_life_days)) {
      msg("Некорректные данные, проверьте поля.", "error");
      return;
    }
    if (!canProceed("edit", 1200)) return;
    await fetch(`${backend}/update`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(req)
    });
    vibrate();
    if (openAfterEdit) {
      autoOpen(encodeURIComponent(JSON.stringify({...r, ...req})));
    } else {
      showSearchPage();
    }
  };
}
function showExpiredPage() {
  setPageTitle('Проверка сроков');
  showPage(addBackButton(`
    <div class="beautiful-form" style="gap:12px;max-width:440px;">
      <div class="filter-bar-wrap" style="margin-bottom:0;">
        <div class="filter-bar-section" id="expiredDayFilter"></div>
      </div>
      <div id="expiredTitle" style="text-align:center;color:#aaa;font-size:1.07em;">Загрузка...</div>
      <div id="expiredCards"></div>
    </div>
  `));
  ensureTheme();

  let filter = 'today';
  renderDayFilter();
  fetchAndRender();

  function renderDayFilter() {
    const bar = document.getElementById('expiredDayFilter');
    bar.innerHTML = '';
    [['today', 'Сегодня и ранее'], ['tomorrow','Завтра']].forEach(([val, label]) => {
      const btn = document.createElement('button');
      btn.type = "button";
      btn.className = "filter-btn" + (filter === val ? " selected" : "");
      btn.innerHTML = label;
      btn.onclick = () => {
        filter = val;
        renderDayFilter();
        fetchAndRender();
      };
      bar.appendChild(btn);
    });
  }

  function fetchAndRender() {
    const title = document.getElementById('expiredTitle');
    const cardsDiv = document.getElementById('expiredCards');
    title.innerHTML = "Загрузка...";
    cardsDiv.innerHTML = "";
    let msNow = msTimeNow();
    let dateToCheck = new Date(msNow);
    if (filter === 'tomorrow') {
      dateToCheck.setDate(dateToCheck.getDate() + 1);
    }
    let y = dateToCheck.getFullYear();
    let m = ('0' + (dateToCheck.getMonth()+1)).slice(-2);
    let d = ('0' + dateToCheck.getDate()).slice(-2);
    let checkDate = `${y}-${m}-${d}`;

    fetch(backend+"/expired",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:userId})})
      .then(r=>r.json())
      .then(data=>{
        if(!data.ok) {
          title.innerHTML = "Ошибка: "+escapeHtml(data.error);
          cardsDiv.innerHTML = "";
          return;
        }
        let filtered;
        if (filter === 'today') {
          filtered = (data.results||[]).filter(x=>x.expiry_at && x.expiry_at <= checkDate);
        } else {
          filtered = (data.results||[]).filter(x=>x.expiry_at === checkDate);
        }
        if(!filtered.length) {
          title.innerHTML = filter === 'today'
            ? "Нет позиций, у которых срок истекает сегодня или ранее!"
            : "Нет позиций, которые просрочатся завтра!";
          title.className = "success";
          cardsDiv.innerHTML = "";
          return;
        }
        title.innerHTML = filter === 'today'
          ? "Сегодня и ранее истекают:"
          : "Завтра истекают:";
        title.className = "";
        let cards = `<div class="card-list">`;
        filtered.forEach(x=>{
          cards += renderCard(x, false);
        });
        cards += `</div>`;
        cardsDiv.innerHTML = cards;
        ensureTheme();
      });
  }
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

function showCheckAnim() {
  closeModal();
  let overlay = document.createElement('div');
  overlay.className = 'modal-overlay show-blur visible';
  overlay.innerHTML = `
    <div class="modal-dialog modal-delete success-check" style="background:transparent;box-shadow:none;">
      <div class="check-anim" style="background:transparent;">
        <svg viewBox="0 0 110 110" style="width:94px;height:94px;display:block;">
          <polyline points="30,58 50,80 82,36" style="stroke:#19c37d;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;fill:none;" />
        </svg>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.classList.add('visible');
  }, 10);
  setTimeout(() => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 370);
  }, 900);
}

async function startApp() {
  showGlobalLoader(true);
  const MIN_LOAD = 1200 + Math.floor(Math.random()*500);
  let t0 = Date.now();
  showPage(`
    <div class="welcome-block">
      <div class="welcome-greet">${escapeHtml(welcomeGreeting())},<br>${USER ? escapeHtml(USER.username) : ""}!</div>
      ${USER && USER.bar_name ? `<span class="welcome-bar">Бар: ${escapeHtml(USER.bar_name)}</span>` : ""}
    </div>
  `);
  ensureTheme();
  try {
    let r = await fetch("https://web-production-2c7db.up.railway.app/userinfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    let d = await r.json();
    let dt = Date.now() - t0;
    if (dt < MIN_LOAD) await new Promise(res => setTimeout(res, MIN_LOAD - dt));
    showGlobalLoader(false);
    if (!d.ok) {
      setPageTitle('Добро пожаловать');
      showPage(`
        <div class="welcome-block">
          <div class="welcome-greet">${escapeHtml(welcomeGreeting())}, гость!</div>
          <div style="margin:16px 0 24px 0;color:#888;font-size:1.05em;">Сначала зарегистрируйтесь через Telegram-бота, чтобы пользоваться приложением.</div>
          <a href="${botLink}" target="_blank" style="display:inline-block; padding:14px 28px; background:linear-gradient(90deg,#007aff 70%,#13c1e3 100%); color:#fff; border-radius:15px; font-size:1.1em; font-weight:700; text-decoration:none; box-shadow:0 3px 16px #13c1e340; margin-bottom:9px; transition:background 0.24s;">Открыть Telegram-бота</a>
        </div>
      `);
      ensureTheme();
      return;
    }
    USER = { username: d.username, bar_name: d.bar_name };
    showMenu();
  } catch (e) {
    showGlobalLoader(false);
    setPageTitle('Ошибка');
    showPage('<div class="error">Не удалось подключиться к серверу.<br>' + escapeHtml(e) + '</div>');
    ensureTheme();
  }
}
startApp();
