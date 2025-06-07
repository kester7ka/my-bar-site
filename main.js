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

const botLink = "https://t.me/BarHelperAB_bot";
let tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
let userId = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : null;
console.log('userId:', userId);
if (!userId) {
  document.getElementById('pageTitle').style.display = 'none';
  const nav = document.querySelector('.bottom-nav');
  if (nav) nav.style.display = 'none';
  document.getElementById('main').innerHTML = `
    <div class="beautiful-form" style="max-width:420px;margin:38px auto 0 auto;padding:38px 18px 34px 18px;box-shadow:0 8px 40px #7b7bff33,0 1.5px 7px #232b3340,0 1.5px 0.5px #fff2 inset;border:2px solid #7b7bff33;border-radius:32px;animation:popIn 0.7s;display:flex;flex-direction:column;align-items:center;gap:18px;">
      <div style="background:#232b33;border-radius:18px;padding:13px 18px;box-shadow:0 2px 12px #7b7bff22;display:flex;align-items:center;justify-content:center;margin-bottom:18px;">
        <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='none' viewBox='0 0 256 256'><rect width='256' height='256' fill='none'/><rect x='40' y='40' width='176' height='176' rx='28' fill='none' stroke='#7b7bff' stroke-width='16'/><path d='M80 128h96' stroke='#7b7bff' stroke-width='16' stroke-linecap='round'/><path d='M128 80v96' stroke='#7b7bff' stroke-width='16' stroke-linecap='round'/></svg>
      </div>
      <div class="welcome-greet" style="font-size:1.45em;font-weight:900;color:#7b7bff;letter-spacing:0.01em;text-align:center;margin-bottom:8px;">Добро пожаловать!</div>
      <div style="color:#b9dbff;font-size:1.08em;text-align:center;margin-bottom:10px;">Откройте сайт через Telegram-бота, чтобы пользоваться баром.</div>
      <a href="${botLink}" target="_blank" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 32px;background:linear-gradient(90deg,#7b7bff 60%,#232b33 100%);color:#fff;border-radius:16px;font-size:1.18em;font-weight:700;text-decoration:none;box-shadow:0 3px 16px #7b7bff30;margin-top:8px;transition:background 0.24s;">
        <svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' fill='none' viewBox='0 0 256 256'><path fill='#fff' d='M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z'/><path fill='#7b7bff' d='M195.88 70.12a16 16 0 0 0-16.88-3.75l-112 40A16 16 0 0 0 72 144.44l24.44 8.15l8.15 24.44A16 16 0 0 0 111.56 200a15.87 15.87 0 0 0 7.44-1.88l40-112a16 16 0 0 0-3.12-16.88ZM112 184l-8-24l24-8l8 24Zm-24-40l-24-8l112-40l-40 112Z'/></svg>
        Открыть Telegram-бота
      </a>
    </div>
  `;
  throw new Error("Not in Telegram Mini App");
}
let username = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? (tg.initDataUnsafe.user.username||tg.initDataUnsafe.user.first_name) : "";
let userPhoto = tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.photo_url ? tg.initDataUnsafe.user.photo_url : "";
const backend = "https://web-production-2c7db.up.railway.app";

function forceExpand() {
  if (tg && tg.expand) tg.expand();
}
if (tg && tg.expand) tg.expand();
document.getElementById('wrap').addEventListener('touchstart', function(e) {
  if (!e.target.closest('input, textarea, select, button')) {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
      active.blur();
    }
  }
});

let chartAnimated = false;
window.showMenu = function() {
  setPageTitle('Главная');
  showExpiredPage(true, function() {
    if (!document.querySelector('.category-chart-tile')) {
      renderCategoryChart(true);
    }
    let filler = document.getElementById('scrollFiller');
    if (!filler) {
      const mainDiv = document.getElementById('main');
      const div = document.createElement('div');
      div.id = 'scrollFiller';
      div.style.height = '30vh';
      div.style.minHeight = '120px';
      div.style.width = '100%';
      div.style.pointerEvents = 'none';
      mainDiv.appendChild(div);
    }
    setTimeout(()=>{window.scrollTo(0,1);}, 60);
  });
  showBottomNav(true);
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('nav-home').classList.add('active');
};

function showExpiredPage(isMain = false, afterRenderCb) {
  let greet = '';
  if (isMain) {
    let uname = username ? username : '';
    greet = `<div class='welcome-block' style='text-align:center;margin-bottom:18px;'>
      <div class='welcome-greet' style='font-size:2.2em;font-weight:800;letter-spacing:0.01em;'>${getGreeting()}, <span style=\"color:#7b7bff;\">${uname}</span>!</div>
    </div>`;
  }
  let content = `
    <div class=\"expired-tile beautiful-form\" id=\"expiredTile\" style=\"box-shadow:0 8px 40px #ff6b8133, 0 1.5px 7px #232b3340, 0 1.5px 0.5px #fff2 inset; border: 2px solid #ffb86b33; padding:36px 18px 32px 18px; margin-bottom:32px;\">
      <div class=\"expired-status-icon\" id=\"expiredStatusIcon\" style=\"left:24px;top:24px;width:48px;height:48px;font-size:2.2em;background:rgba(255,184,107,0.13);color:#ffb86b;box-shadow:0 2px 16px #ffb86b33;\">
        <svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' fill='none' viewBox='0 0 256 256'><path fill='currentColor' d='M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z'/><path fill='currentColor' d='M128 80a12 12 0 0 1 12 12v32a12 12 0 0 1-24 0v-32a12 12 0 0 1 12-12Zm0 88a16 16 0 1 0 0-32 16 16 0 0 0 0 32Z'/></svg>
      </div>
      <div class=\"expired-title-center\" style=\"font-size:1.45em;font-weight:900;color:#ffb86b;margin-bottom:18px;letter-spacing:0.01em;text-align:center;\">Некондиция</div>
      <div class=\"filter-bar-wrap\" style=\"margin-bottom:0;justify-content:center;\">
        <div class=\"filter-bar-section\" id=\"expiredDayFilter\"></div>
      </div>
      <div id=\"expiredTitle\" style=\"text-align:center;color:#aaa;font-size:1.07em;margin-bottom:10px;\">Загрузка...</div>
      <div id=\"expiredCards\"></div>
    </div>
  `;
  if (!isMain) content = addBackButton(content);
  showPage(greet + content);

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
    const tile = document.getElementById('expiredTile');
    const statusIcon = document.getElementById('expiredStatusIcon');
    cardsDiv.innerHTML = "";
    tile.classList.remove('has-expired');
    // Сбросить стили
    tile.style.transition = 'all 0.5s cubic-bezier(.4,0,.2,1)';
    tile.style.minHeight = '';
    tile.style.paddingTop = '';
    tile.style.paddingBottom = '';
    statusIcon.style.transition = 'all 0.5s cubic-bezier(.4,0,.2,1)';
    statusIcon.style.background = 'rgba(35,43,51,0.92)';
    statusIcon.style.color = '#fff';
    statusIcon.style.boxShadow = '0 2px 8px #232b3340';
    title.style.transition = 'color 0.5s';
    title.style.color = '#fff';
    let msNow = new Date();
    let dateToCheck = new Date(msNow.getFullYear(), msNow.getMonth(), msNow.getDate());
    if (filter === 'tomorrow') {
      dateToCheck.setDate(dateToCheck.getDate() + 1);
    }
    let y = dateToCheck.getFullYear();
    let m = ('0' + (dateToCheck.getMonth()+1)).slice(-2);
    let d = ('0' + dateToCheck.getDate()).slice(-2);
    let checkDate = `${y}-${m}-${d}`;

    secureFetch(backend+"/expired", {user_id:userId})
      .then(r=>r.json())
      .then(data=>{
        let filtered;
        if (data.ok) {
          if (filter === 'today') {
            filtered = (data.results||[]).filter(x=>x.expiry_final && x.expiry_final <= checkDate);
          } else {
            filtered = (data.results||[]).filter(x=>[
              x.expiry_final,
              x.expiry_by_opened,
              x.expiry_by_total
            ].some(dt => dt === checkDate));
          }
        } else {
          filtered = [];
        }
        if(!data.ok) {
          title.innerHTML = "Ошибка: "+escapeHtml(data.error);
          cardsDiv.innerHTML = "";
          tile.classList.remove('has-expired');
          // Сбросить стили
          tile.style.minHeight = '140px';
          tile.style.paddingTop = '28px';
          tile.style.paddingBottom = '28px';
          statusIcon.style.background = 'rgba(35,43,51,0.92)';
          statusIcon.style.color = '#fff';
          statusIcon.style.boxShadow = '0 2px 8px #232b3340';
          title.style.color = '#fff';
          if (afterRenderCb) afterRenderCb();
          return;
        }
        if(!filtered.length) {
          title.innerHTML = filter === 'today'
            ? "Нет позиций, у которых срок истекает сегодня или ранее!"
            : "Нет позиций, которые просрочатся завтра!";
          title.className = "success";
          cardsDiv.innerHTML = "";
          tile.classList.remove('has-expired');
          // Меньше и невыделенная плитка
          tile.style.minHeight = '120px';
          tile.style.paddingTop = '18px';
          tile.style.paddingBottom = '18px';
          tile.style.boxShadow = '0 1.5px 7px #232b3340, 0 1.5px 0.5px #fff2 inset';
          tile.style.border = '1.5px solid rgba(255,255,255,0.07)';
          tile.style.background = 'rgba(35,43,51,0.92)';
          statusIcon.style.background = 'rgba(35,43,51,0.92)';
          statusIcon.style.color = '#fff';
          statusIcon.style.boxShadow = '0 2px 8px #232b3340';
          title.style.color = '#fff';
          return;
        }
        // Есть карточки — выделяем плитку
        title.innerHTML = filter === 'today'
          ? "Сегодня и ранее истекают:"
          : "Завтра истекают:";
        title.className = "";
        let cards = `<div class=\"card-list\" style=\"gap:22px;\">`;
        filtered.forEach(x=>{
          cards += renderCard(x, false, true);
        });
        cards += `</div>`;
        cardsDiv.innerHTML = cards;
        setTimeout(() => {
          tile.classList.add('has-expired');
          tile.style.minHeight = '340px';
          tile.style.paddingTop = '36px';
          tile.style.paddingBottom = '32px';
          statusIcon.style.color = '#ffb86b';
          statusIcon.style.background = 'rgba(255,184,107,0.13)';
          statusIcon.style.boxShadow = '0 2px 16px #ffb86b33';
          title.style.color = '#ffb86b';
        }, 60);
        if (afterRenderCb) afterRenderCb();
      })
      .catch(e => {
        title.innerHTML = "Ошибка сети: " + escapeHtml(e.message);
        cardsDiv.innerHTML = "";
        tile.classList.remove('has-expired');
        tile.style.minHeight = '140px';
        tile.style.paddingTop = '28px';
        tile.style.paddingBottom = '28px';
        statusIcon.style.background = 'rgba(35,43,51,0.92)';
        statusIcon.style.color = '#fff';
        statusIcon.style.boxShadow = '0 2px 8px #232b3340';
        title.style.color = '#fff';
        if (afterRenderCb) afterRenderCb();
      });
  }
}
window.showAddPage = showAddPage;
window.showSearchPage = showSearchPage;
window.showStatsPage = showStatsPage;

function setPageTitle(title) {
  document.getElementById('pageTitle').innerHTML = title;
}
function showPage(contentHtml) {
  const el = document.getElementById("main");
  el.innerHTML = `<div class="page-anim">${contentHtml}</div>`;
  window.scrollTo({top: 0, behavior: 'smooth'});
  forceExpand();
}
function addBackButton(html) {
  return `<button class="backbtn" onclick="showMenu()">Назад</button>` + html;
}
function msg(m, type=''){ showPage(addBackButton(`<div class="${type} result">${escapeHtml(m)}</div>`)); }
let USER = null;
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Доброе утро';
  if (h >= 12 && h < 18) return 'Добрый день';
  if (h >= 18 && h < 23) return 'Добрый вечер';
  return 'Доброй ночи';
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
  secureFetch(`${backend}/search`, {
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
    <form id="addf" class="beautiful-form add-form-modern" autocomplete="off" style="max-width:480px;padding:38px 18px 34px 18px;box-shadow:0 8px 40px #7b7bff33, 0 1.5px 7px #232b3340, 0 1.5px 0.5px #fff2 inset;border:2px solid #7b7bff33;border-radius:32px;">
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:22px;">
        <div style="background:#232b33;border-radius:18px;padding:13px 18px;box-shadow:0 2px 12px #7b7bff22;display:flex;align-items:center;justify-content:center;">
          <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' fill='none' viewBox='0 0 256 256'><path fill='#7b7bff' d='M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z'/><path fill='#7b7bff' d='M128 80a12 12 0 0 1 12 12v32a12 12 0 0 1-24 0v-32a12 12 0 0 1 12-12Zm0 88a16 16 0 1 0 0-32 16 16 0 0 0 0 32Z'/></svg>
        </div>
        <div style="font-size:1.5em;font-weight:900;color:#7b7bff;letter-spacing:0.01em;">Добавить позицию</div>
      </div>
      <div class="field-row" style="margin-bottom:18px;">
        <label class="field-label" for="category">Категория</label>
        <div style="display:flex;align-items:center;gap:12px;background:#232b33;border-radius:14px;padding:10px 14px;box-shadow:0 1px 6px #7b7bff11;">
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='none' viewBox='0 0 256 256'><circle cx='128' cy='128' r='96' fill='none' stroke='#7b7bff' stroke-width='16'/><path d='M128 80a12 12 0 0 1 12 12v32a12 12 0 0 1-24 0v-32a12 12 0 0 1 12-12Z' fill='#7b7bff'/></svg>
          <select name="category" id="category" required style="flex:1;background:transparent;color:#fff;border:none;font-size:1.1em;outline:none;">
            <option value="🍯 Сиропы">🍯 Сиропы</option>
            <option value="🥕 Ингредиенты">🥕 Ингредиенты</option>
            <option value="☕ Кофе">☕ Кофе</option>
            <option value="📦 Прочее">📦 Прочее</option>
          </select>
        </div>
      </div>
      <div class="status-toggle-bar" id="statusToggleBar" style="margin-bottom:16px;margin-top:2px;gap:12px;">
        <button type="button" class="status-toggle-btn opened selected" id="btnOpened" style="font-size:1.1em;padding:13px 0;"><svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='none' viewBox='0 0 256 256'><circle cx='128' cy='128' r='96' fill='none' stroke='#7b7bff' stroke-width='16'/><path d='M128 80a12 12 0 0 1 12 12v32a12 12 0 0 1-24 0v-32a12 12 0 0 1 12-12Z' fill='#7b7bff'/></svg> Открыто</button>
        <button type="button" class="status-toggle-btn closed" id="btnClosed" style="font-size:1.1em;padding:13px 0;"><svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='none' viewBox='0 0 256 256'><circle cx='128' cy='128' r='96' fill='none' stroke='#ff6b81' stroke-width='16'/><path d='M128 80a12 12 0 0 1 12 12v32a12 12 0 0 1-24 0v-32a12 12 0 0 1 12-12Z' fill='#ff6b81'/></svg> Закрыто</button>
      </div>
      <div class="field-row" style="margin-bottom:18px;">
        <label class="field-label" for="tob">TOB (6 цифр)</label>
        <div style="display:flex;align-items:center;gap:12px;background:#232b33;border-radius:14px;padding:10px 14px;box-shadow:0 1px 6px #7b7bff11;">
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='none' viewBox='0 0 256 256'><rect x='32' y='48' width='192' height='160' rx='16' fill='none' stroke='#7b7bff' stroke-width='16'/><line x1='76' y1='88' x2='76' y2='168' fill='none' stroke='#7b7bff' stroke-width='12' stroke-linecap='round'/><line x1='108' y1='88' x2='108' y2='168' fill='none' stroke='#7b7bff' stroke-width='8' stroke-linecap='round'/><line x1='148' y1='88' x2='148' y2='168' fill='none' stroke='#7b7bff' stroke-width='8' stroke-linecap='round'/><line x1='180' y1='88' x2='180' y2='168' fill='none' stroke='#7b7bff' stroke-width='12' stroke-linecap='round'/></svg>
          <input name="tob" id="tob" maxlength="6" pattern="\\d{6}" required placeholder="123456" autocomplete="off" inputmode="numeric" style="flex:1;background:transparent;color:#fff;border:none;font-size:1.1em;outline:none;">
        </div>
        <div id="tobWarning" style="display:none"></div>
      </div>
      <div class="field-row" style="margin-bottom:18px;">
        <label class="field-label" for="name">Название</label>
        <div style="display:flex;align-items:center;gap:12px;background:#232b33;border-radius:14px;padding:10px 14px;box-shadow:0 1px 6px #7b7bff11;">
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='none' viewBox='0 0 256 256'><rect x='40' y='40' width='176' height='176' rx='8' fill='none' stroke='#7b7bff' stroke-width='16'/></svg>
          <input name="name" id="name" required placeholder="Название позиции" style="flex:1;background:transparent;color:#fff;border:none;font-size:1.1em;outline:none;">
        </div>
      </div>
      <div class="field-row" style="margin-bottom:18px;">
        <label class="field-label" for="manufactured_at">Дата производства</label>
        <div style="display:flex;align-items:center;gap:12px;background:#232b33;border-radius:14px;padding:10px 14px;box-shadow:0 1px 6px #7b7bff11;">
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='none' viewBox='0 0 256 256'><rect width='256' height='256' fill='none'/><rect x='40' y='40' width='176' height='176' rx='8' fill='none' stroke='#7b7bff' stroke-width='16'/><line x1='176' y1='24' x2='176' y2='56' fill='none' stroke='#7b7bff' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/><line x1='80' y1='24' x2='80' y2='56' fill='none' stroke='#7b7bff' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/><line x1='40' y1='88' x2='216' y2='88' fill='none' stroke='#7b7bff' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/></svg>
          <input name="manufactured_at" id="manufactured_at" type="date" required style="flex:1;background:transparent;color:#fff;border:none;font-size:1.1em;outline:none;">
        </div>
      </div>
      <div class="field-row" style="margin-bottom:18px;">
        <label class="field-label" for="shelf_life_days">Срок годности (дней)</label>
        <div style="display:flex;align-items:center;gap:12px;background:#232b33;border-radius:14px;padding:10px 14px;box-shadow:0 1px 6px #7b7bff11;">
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='none' viewBox='0 0 256 256'><circle cx='128' cy='128' r='96' fill='none' stroke='#7b7bff' stroke-width='16'/><polyline points='128 72 128 128 184 128' fill='none' stroke='#7b7bff' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/></svg>
          <input name="shelf_life_days" id="shelf_life_days" type="number" min="1" required placeholder="180" style="flex:1;background:transparent;color:#fff;border:none;font-size:1.1em;outline:none;">
        </div>
      </div>
      <div class="field-row" style="margin-bottom:18px;">
        <label class="field-label" for="opened_shelf_life_days">Срок после вскрытия (дней)</label>
        <div style="display:flex;align-items:center;gap:12px;background:#232b33;border-radius:14px;padding:10px 14px;box-shadow:0 1px 6px #7b7bff11;">
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='none' viewBox='0 0 256 256'><circle cx='128' cy='128' r='96' fill='none' stroke='#7b7bff' stroke-width='16'/><polyline points='128 72 128 128 184 128' fill='none' stroke='#7b7bff' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/></svg>
          <input name="opened_shelf_life_days" id="opened_shelf_life_days" type="number" min="1" required placeholder="30" style="flex:1;background:transparent;color:#fff;border:none;font-size:1.1em;outline:none;">
        </div>
      </div>
      <div class="field-row" id="openedAtRow" style="display:none;margin-bottom:18px;">
        <label class="field-label" for="opened_at">Дата вскрытия</label>
        <div style="display:flex;align-items:center;gap:12px;background:#232b33;border-radius:14px;padding:10px 14px;box-shadow:0 1px 6px #7b7bff11;">
        <div style="display:flex;align-items:center;gap:10px;">
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 256 256'><rect width='256' height='256' fill='none'/><rect x='40' y='40' width='176' height='176' rx='8' fill='none' stroke='#7b7bff' stroke-width='16'/><line x1='176' y1='24' x2='176' y2='56' fill='none' stroke='#7b7bff' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/><line x1='80' y1='24' x2='80' y2='56' fill='none' stroke='#7b7bff' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/><line x1='40' y1='88' x2='216' y2='88' fill='none' stroke='#7b7bff' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/></svg>
          <input name="opened_at" id="opened_at" type="date" style="flex:1;">
        </div>
      </div>
      <div class="btns" style="margin-top:18px;gap:18px;">
        <button type="submit" id="addSubmitBtn" disabled style="font-size:1.18em;padding:18px 0;border-radius:16px;background:linear-gradient(90deg,#7b7bff 60%,#232b33 100%);color:#fff;font-weight:700;border:none;box-shadow:0 2px 12px #10131e33;cursor:pointer;transition:background 0.25s,transform 0.17s;animation:popIn 0.33s;flex:1;width:100%;margin:0;letter-spacing:0.03em;">Добавить</button>
      </div>
    </form>
  `));
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
  const openedAtRow = document.getElementById('openedAtRow');
  function updateStatusButtons() {
    if (opened) {
      btnOpened.classList.add("selected", "opened");
      btnClosed.classList.remove("selected", "closed");
      openedAtRow.style.display = '';
    } else {
      btnOpened.classList.remove("selected", "opened");
      btnClosed.classList.add("selected", "closed");
      openedAtRow.style.display = 'none';
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
  const manufacturedInput = document.getElementById('manufactured_at');
  const openedShelfInput = document.getElementById('opened_shelf_life_days');
  const openedAtInput = document.getElementById('opened_at');
  const catInput = document.getElementById('category');
  const submitBtn = document.getElementById('addSubmitBtn');
  tobInput.setAttribute('inputmode', 'numeric');
  tobInput.setAttribute('pattern', '\\d*');
  tobInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
  });

  function validateForm() {
    let allOk = true;
    if (!isValidCategory(catInput.value)) allOk = false;
    if (!isValidTob(tobInput.value)) allOk = false;
    if (!isValidName(nameInput.value.trim())) allOk = false;
    if (!isValidShelf(shelfInput.value)) allOk = false;
    if (!isValidShelf(openedShelfInput.value)) allOk = false;
    if (!manufacturedInput.value) allOk = false;
    if (opened && !openedAtInput.value) allOk = false;
    if (opened && openTobExists) allOk = false;
    submitBtn.disabled = !allOk;
    if (!allOk) submitBtn.classList.add('disabled');
    else submitBtn.classList.remove('disabled');
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
      let exists = allItems.find(x => x.tob === tobVal);
      if (exists) {
        nameInput.value = exists.name;
        shelfInput.value = exists.shelf_life_days;
        openedShelfInput.value = exists.opened_shelf_life_days;
        nameInput.readOnly = true;
        shelfInput.readOnly = true;
        openedShelfInput.readOnly = true;
        openedItemName = exists.name;
        if (exists.opened == 1) {
          openTobExists = true;
          tobWarning.innerHTML = `<span class="tob-warning">Добавление открытой позиции с этим TOB запрещено. Сначала закройте или удалите открытую позицию с этим TOB.</span>`;
          tobWarning.style.display = "block";
        }
      } else {
        nameInput.readOnly = false;
        shelfInput.readOnly = false;
        openedShelfInput.readOnly = false;
        nameInput.value = '';
        shelfInput.value = '';
        openedShelfInput.value = '';
        openedItemName = '';
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
  manufacturedInput.addEventListener('input', validateForm);
  openedShelfInput.addEventListener('input', validateForm);
  openedAtInput.addEventListener('input', validateForm);
  catInput.addEventListener('change', validateForm);

  document.getElementById('addf').onsubmit = async function(e){
    e.preventDefault();
    let d = Object.fromEntries(new FormData(this));
    d.opened = opened ? 1 : 0;
    if (!isValidCategory(d.category) || !isValidTob(d.tob) || !isValidName(d.name) || !isValidShelf(d.shelf_life_days) || !isValidShelf(d.opened_shelf_life_days) || !d.manufactured_at || (opened && !d.opened_at)) {
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
      manufactured_at: d.manufactured_at,
      shelf_life_days: d.shelf_life_days,
      opened_shelf_life_days: d.opened_shelf_life_days,
      opened: d.opened,
      opened_at: opened ? d.opened_at : null
    };
    let url = `${backend}/add`;
    let resp = await secureFetch(url, {
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
function renderCard(r, actions = true, isExpired = false) {
  const accent = {
    '🍯 Сиропы': '#7b7bff',
    '🥕 Ингредиенты': '#7bffb7',
    '☕ Кофе': '#ffb86b',
    '📦 Прочее': '#ff6b81'
  }[r.category] || '#7b7bff';
  let status = `<span class="card-status-badge ${r.opened == 1 ? "opened" : "closed"}">${r.opened == 1 ? "Открыто" : "Закрыто"}</span>`;
  let main = '';
  let cardStyle = '';
  if (r.opened == 1) {
    let expiry1 = r.expiry_by_opened;
    let expiry2 = r.expiry_by_total;
    let minExpiry = r.expiry_final;
    main = `<div class="card-main">
      <div class="card-title" title="${escapeHtml(r.name)}">${escapeHtml(r.name)}</div>
      <div class="card-row"><span style='color:#ffb86b;vertical-align:middle;display:inline-flex;align-items:center;'><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 256 256'><rect x='32' y='48' width='192' height='160' rx='16' fill='none' stroke='currentColor' stroke-width='16'/><line x1='76' y1='88' x2='76' y2='168' fill='none' stroke='currentColor' stroke-width='12' stroke-linecap='round'/><line x1='108' y1='88' x2='108' y2='168' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><line x1='148' y1='88' x2='148' y2='168' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><line x1='180' y1='88' x2='180' y2='168' fill='none' stroke='currentColor' stroke-width='12' stroke-linecap='round'/></svg></span> <b>TOB:</b> ${escapeHtml(r.tob)}</div>
      <div class="card-row"><span style='color:#ffb86b;vertical-align:middle;display:inline-flex;align-items:center;'><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 256 256'><rect width='256' height='256' fill='none'/><rect x='40' y='40' width='176' height='176' rx='8' fill='none' stroke='currentColor' stroke-width='16'/><line x1='176' y1='24' x2='176' y2='56' fill='none' stroke='currentColor' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/><line x1='80' y1='24' x2='80' y2='56' fill='none' stroke='currentColor' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/><line x1='40' y1='88' x2='216' y2='88' fill='none' stroke='currentColor' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/></svg></span> <b>Дата вскрытия:</b> ${escapeHtml(r.opened_at||'—')}</div>
      <div class="card-row"><span style='color:#ffb86b;vertical-align:middle;display:inline-flex;align-items:center;'><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 256 256'><path fill='currentColor' d='M128 24A104 104 0 1 0 232 128 104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Zm8-40v-48a8 8 0 0 0-16 0v56a8 8 0 0 0 8 8h32a8 8 0 0 0 0-16Zm-8-96a12 12 0 1 1 12-12 12 12 0 0 1-12 12Z'/></svg></span> <b>Срок посл вскр:</b> <span class="${minExpiry===expiry1?'highlight-expiry':''}">${escapeHtml(expiry1||'—')}</span></div>
      <div class="card-row"><span style='color:#ffb86b;vertical-align:middle;display:inline-flex;align-items:center;'><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 256 256'><circle cx='128' cy='128' r='96' fill='none' stroke='currentColor' stroke-width='16'/><polyline points='128 72 128 128 184 128' fill='none' stroke='currentColor' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/></svg></span> <b>Общ. срок до:</b> <span class="${minExpiry===expiry2?'highlight-expiry':''}">${escapeHtml(expiry2||'—')}</span></div>
    </div>`;
    cardStyle = 'min-height:230px;max-height:230px;height:230px;';
  } else {
    let expiry = r.expiry_by_total;
    main = `<div class="card-main">
      <div class="card-title" title="${escapeHtml(r.name)}">${escapeHtml(r.name)}</div>
      <div class="card-row"><span style='color:#ffb86b;vertical-align:middle;display:inline-flex;align-items:center;'><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 256 256'><rect x='32' y='48' width='192' height='160' rx='16' fill='none' stroke='currentColor' stroke-width='16'/><line x1='76' y1='88' x2='76' y2='168' fill='none' stroke='currentColor' stroke-width='12' stroke-linecap='round'/><line x1='108' y1='88' x2='108' y2='168' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><line x1='148' y1='88' x2='148' y2='168' fill='none' stroke='currentColor' stroke-width='8' stroke-linecap='round'/><line x1='180' y1='88' x2='180' y2='168' fill='none' stroke='currentColor' stroke-width='12' stroke-linecap='round'/></svg></span> <b>TOB:</b> ${escapeHtml(r.tob)}</div>
      <div class="card-row"><span style='color:#ffb86b;vertical-align:middle;display:inline-flex;align-items:center;'><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 256 256'><rect width='256' height='256' fill='none'/><rect x='40' y='40' width='176' height='176' rx='8' fill='none' stroke='currentColor' stroke-width='16'/><line x1='176' y1='24' x2='176' y2='56' fill='none' stroke='currentColor' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/><line x1='80' y1='24' x2='80' y2='56' fill='none' stroke='currentColor' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/><line x1='40' y1='88' x2='216' y2='88' fill='none' stroke='currentColor' stroke-width='16' stroke-linecap='round' stroke-linejoin='round'/></svg></span> <b>Дата произв.:</b> ${escapeHtml(r.manufactured_at||'—')}</div>
      <div class="card-row"><span style='color:#ffb86b;vertical-align:middle;display:inline-flex;align-items:center;'><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 256 256'><path fill='currentColor' d='M128 24A104 104 0 1 0 232 128 104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Zm8-40v-48a8 8 0 0 0-16 0v56a8 8 0 0 0 8 8h32a8 8 0 0 0 0-16Zm-8-96a12 12 0 1 1 12-12 12 12 0 0 1-12 12Z'/></svg></span> <b>Годен до:</b> <span class="highlight-expiry">${escapeHtml(expiry||'—')}</span></div>
    </div>`;
    cardStyle = 'min-height:210px;max-height:210px;height:210px;';
  }
  let bigDelete = '';
  if (isExpired) {
    bigDelete = `<div style="display:flex;justify-content:center;width:100%;margin-bottom:8px;margin-top:-8px;">
      <button class="deletebtn big-delete-btn" onclick="showDeleteModal('${encodeURIComponent(JSON.stringify(r))}','expired')">`
      + `<svg width='22' height='22' fill='none' viewBox='0 0 256 256'><path fill='currentColor' d='M216 56a8 8 0 0 1-8 8h-8v136a24 24 0 0 1-24 24H80a24 24 0 0 1-24-24V64h-8a8 8 0 0 1 0-16h48V40a24 24 0 0 1 48 0v8h48a8 8 0 0 1 8 8ZM104 40a8 8 0 0 1 16 0v8h-16Zm88 24H64v136a8 8 0 0 0 8 8h104a8 8 0 0 0 8-8Zm-40 32a8 8 0 0 0-16 0v64a8 8 0 0 0 16 0Zm-32 0a8 8 0 0 0-16 0v64a8 8 0 0 0 16 0Z'/></svg>`
      + `Удалить</button></div>`;
  }
  let buttons = "";
  if (actions) {
    buttons = `<div class="card-actions-bottom">`
      + `<button class="editbtn" onclick="openReopenForm('${encodeURIComponent(JSON.stringify(r))}');return false;">`
      + `<svg width='22' height='22' fill='none' viewBox='0 0 256 256'><path fill='currentColor' d='M216.49 79.51l-40-40a12 12 0 0 0-17 0l-96 96A12 12 0 0 0 56 143v40a12 12 0 0 0 12 12h40a12 12 0 0 0 8.49-3.51l96-96a12 12 0 0 0 0-17ZM104 188H68v-36l80-80 36 36ZM192 96l-32-32 16-16 32 32Z'/></svg>Изменить</button>`
      + `<button class="deletebtn" onclick="showDeleteModal('${encodeURIComponent(JSON.stringify(r))}')">`
      + `<svg width='22' height='22' fill='none' viewBox='0 0 256 256'><path fill='currentColor' d='M216 56a8 8 0 0 1-8 8h-8v136a24 24 0 0 1-24 24H80a24 24 0 0 1-24-24V64h-8a8 8 0 0 1 0-16h48V40a24 24 0 0 1 48 0v8h48a8 8 0 0 1 8 8ZM104 40a8 8 0 0 1 16 0v8h-16Zm88 24H64v136a8 8 0 0 0 8 8h104a8 8 0 0 0 8-8Zm-40 32a8 8 0 0 0-16 0v64a8 8 0 0 0 16 0Zm-32 0a8 8 0 0 0-16 0v64a8 8 0 0 0 16 0Z'/></svg>Удалить</button>`
      + (r.opened == 0 ? `<button class="openbtn" onclick="showOpenModal('${encodeURIComponent(JSON.stringify(r))}')">`
      + `<svg width='22' height='22' fill='none' viewBox='0 0 256 256'><path fill='currentColor' d='M128 24A104 104 0 1 0 232 128 104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Zm8-40v-48a8 8 0 0 0-16 0v56a8 8 0 0 0 8 8h32a8 8 0 0 0 0-16Zm-8-96a12 12 0 1 1 12-12 12 12 0 0 1-12 12Z'/></svg>Открыть</button>` : '')
      + `</div>`;
  }
  return `<div class="item-card" style="--card-accent:${accent};${cardStyle}">${main}${bigDelete}${status}${buttons}</div>`;
}
function showSearchPage() {
  setPageTitle('Поиск');
  showPage(addBackButton(`
    <div id="searchBlock" class="beautiful-form" style="gap:10px;max-width:440px;">
      <input id="searchInput" type="text" placeholder="Поиск по TOB или названию" style="margin-bottom:7px;">
      <div id="categoryStatusBar"></div>
      <div id="searchResults" style="min-height:90px;"></div>
    </div>
  `));

  let filterCategory = "";
  let filterOpened = "";
  const input = document.getElementById('searchInput');
  let allItems = [];
  const resultsDiv = document.getElementById('searchResults');
  const barDiv = document.getElementById('categoryStatusBar');

  function renderBar() {
    barDiv.innerHTML = renderCategoryStatusBar(filterCategory, filterOpened);
    const catSelect = document.getElementById('categoryNativeSelect');
    const statusSelect = document.getElementById('statusNativeSelect');
    catSelect.onchange = function() {
      filterCategory = this.value;
      renderBar();
      renderList();
      showBottomNav(true);
      this.blur();
      setTimeout(() => {
        if (typeof showNav === 'function') showNav();
        const nav = document.querySelector('.bottom-nav');
        if (nav) { nav.style.opacity = '1'; nav.style.pointerEvents = ''; }
      }, 200);
    };
    statusSelect.onchange = function() {
      filterOpened = this.value;
      renderBar();
      renderList();
      showBottomNav(true);
      this.blur();
      setTimeout(() => {
        if (typeof showNav === 'function') showNav();
        const nav = document.querySelector('.bottom-nav');
        if (nav) { nav.style.opacity = '1'; nav.style.pointerEvents = ''; }
      }, 200);
    };
  }

  resultsDiv.innerHTML = `<div style="text-align:center;color:#aaa;font-size:1.07em;">Загрузка...</div>`;
  secureFetch(`${backend}/search`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({user_id: userId, query: ""})
  })
  .then(r => r.json())
  .then(data => {
    if (!data.ok) return resultsDiv.innerHTML = `<div class="error">Ошибка: ${escapeHtml(data.error)}</div>`;
    allItems = data.results;
    renderBar();
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
function showDeleteModal(rJson, source) {
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
        <button class="modal-btn deletebtn" onclick="deleteItem('${encodeURIComponent(JSON.stringify(r))}','${source||''}')">Удалить</button>
        <button class="modal-btn cancelbtn" onclick="closeModal()">Отмена</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('visible'), 10);
}
async function deleteItem(rJson, source) {
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
    let resp = await secureFetch(`${backend}/delete`, {
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
        if (source === 'expired') {
          showMenu();
        } else {
        showSearchPage();
        }
      }, 1000);
    }
  } catch (e) {
    if (dialog) {
      dialog.innerHTML = `<div class="error" style="padding:22px;">Ошибка: ${escapeHtml(e.message || "Ошибка сети")}</div>`;
    }
  }
}
async function findOpenedByTOB(tob) {
  let resp = await secureFetch(`${backend}/search`, {
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
  });
}
function closeModal() {
  let overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  overlay.classList.add('fade-out');
  setTimeout(() => {
    overlay.remove();
  }, 330);
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
    await secureFetch(`${backend}/delete`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId, id: opened.id})
    });
  }
  await secureFetch(`${backend}/update`, {
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
        <label class="field-label" for="edit_manufactured_at">Дата производства</label>
        <input name="edit_manufactured_at" id="edit_manufactured_at" type="date" required value="${escapeHtml(r.manufactured_at||'')}">
      </div>
      <div class="field-row">
        <label class="field-label" for="edit_shelf_life_days">Срок годности (дней)</label>
        <input name="edit_shelf_life_days" id="edit_shelf_life_days" type="number" min="1" required value="${escapeHtml(""+r.shelf_life_days)}">
      </div>
      <div class="field-row">
        <label class="field-label" for="edit_opened_shelf_life_days">Срок после вскрытия (дней)</label>
        <input name="edit_opened_shelf_life_days" id="edit_opened_shelf_life_days" type="number" min="1" required value="${escapeHtml(""+(r.opened_shelf_life_days||''))}">
      </div>
      <div class="field-row" id="editOpenedAtRow" style="display:${r.opened==1?'':'none'};">
        <label class="field-label" for="edit_opened_at">Дата вскрытия</label>
        <input name="edit_opened_at" id="edit_opened_at" type="date" value="${escapeHtml(r.opened_at||'')}">
      </div>
      <div class="btns">
        <button type="submit" id="editSubmitBtn">Сохранить</button>
      </div>
    </form>
  `));
  setTimeout(() => {
    let inputs = document.querySelectorAll('.beautiful-form input, .beautiful-form select');
    inputs.forEach(inp => {
      inp.addEventListener('focus', function() {
        scrollInputIntoView(this);
      });
    });
  }, 100);
  const openedAtRow = document.getElementById('editOpenedAtRow');
  let opened = r.opened == 1;
  document.getElementById('edit_category').onchange = validateForm;
  document.getElementById('edit_name').oninput = validateForm;
  document.getElementById('edit_manufactured_at').oninput = validateForm;
  const editShelfInput = document.getElementById('edit_shelf_life_days');
  const editOpenedShelfInput = document.getElementById('edit_opened_shelf_life_days');
  [editShelfInput, editOpenedShelfInput].forEach(inp => {
    inp.setAttribute('inputmode', 'numeric');
    inp.setAttribute('pattern', '\\d*');
    inp.addEventListener('input', function(e) {
      this.value = this.value.replace(/\D/g, '');
    });
  });
  document.getElementById('edit_opened_at').oninput = validateForm;
  function validateForm() {
    let allOk = true;
    if (!isValidCategory(document.getElementById('edit_category').value)) allOk = false;
    if (!isValidName(document.getElementById('edit_name').value.trim())) allOk = false;
    if (!isValidShelf(document.getElementById('edit_shelf_life_days').value)) allOk = false;
    if (!isValidShelf(document.getElementById('edit_opened_shelf_life_days').value)) allOk = false;
    if (!document.getElementById('edit_manufactured_at').value) allOk = false;
    if (opened && !document.getElementById('edit_opened_at').value) allOk = false;
    document.getElementById('editSubmitBtn').disabled = !allOk;
    if (!allOk) document.getElementById('editSubmitBtn').classList.add('disabled');
    else document.getElementById('editSubmitBtn').classList.remove('disabled');
  }
  validateForm();
  document.getElementById('editf').onsubmit = async function(e) {
    e.preventDefault();
    let d = Object.fromEntries(new FormData(this));
    let req = {
      user_id: userId,
      id: r.id,
      category: d.edit_category,
      name: d.edit_name,
      manufactured_at: d.edit_manufactured_at,
      shelf_life_days: d.edit_shelf_life_days,
      opened_shelf_life_days: d.edit_opened_shelf_life_days,
      opened: r.opened,
      opened_at: r.opened == 1 ? d.edit_opened_at : null
    };
    if (!isValidCategory(req.category) || !isValidName(req.name) || !isValidShelf(req.shelf_life_days) || !isValidShelf(req.opened_shelf_life_days) || !req.manufactured_at || (r.opened == 1 && !req.opened_at)) {
      msg("Некорректные данные, проверьте поля.", "error");
      return;
    }
    if (!canProceed("edit", 1200)) return;
    await secureFetch(`${backend}/update`, {
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
function showBottomNav(show = true) {
  const nav = document.querySelector('.bottom-nav');
  if (nav) nav.style.display = show ? '' : 'none';
}
function showGlobalLoader(show = true) {
  const loader = document.getElementById('globalLoader');
  const wrap = document.getElementById('wrap');
  if (show) {
    loader.style.display = 'flex';
    wrap.style.display = 'none';
    showBottomNav(false);
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
      <div class="welcome-greet">${escapeHtml(getGreeting())},<br>${USER ? escapeHtml(USER.username) : ""}!</div>
      ${USER && USER.bar_name ? `<span class="welcome-bar">Бар: ${escapeHtml(USER.bar_name)}</span>` : ""}
    </div>
  `);
  try {
    let r = await secureFetch("https://web-production-2c7db.up.railway.app/userinfo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    let d = await r.json();
    let dt = Date.now() - t0;
    if (dt < MIN_LOAD) await new Promise(res => setTimeout(res, MIN_LOAD - dt));
    showGlobalLoader(false);
    if (!d.ok) {
      document.getElementById('pageTitle').style.display = 'none';
      const nav = document.querySelector('.bottom-nav');
      if (nav) nav.style.display = 'none';
      setPageTitle('Добро пожаловать');
      showPage(`
        <div class=\"beautiful-form\" style=\"max-width:420px;margin:38px auto 0 auto;padding:38px 18px 34px 18px;box-shadow:0 8px 40px #7b7bff33,0 1.5px 7px #232b3340,0 1.5px 0.5px #fff2 inset;border:2px solid #7b7bff33;border-radius:32px;animation:popIn 0.7s;display:flex;flex-direction:column;align-items:center;gap:18px;\">
          <div style=\"background:#232b33;border-radius:18px;padding:13px 18px;box-shadow:0 2px 12px #7b7bff22;display:flex;align-items:center;justify-content:center;margin-bottom:18px;\">
            <svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='none' viewBox='0 0 256 256'><rect width='256' height='256' fill='none'/><rect x='40' y='40' width='176' height='176' rx='28' fill='none' stroke='#7b7bff' stroke-width='16'/><path d='M80 128h96' stroke='#7b7bff' stroke-width='16' stroke-linecap='round'/><path d='M128 80v96' stroke='#7b7bff' stroke-width='16' stroke-linecap='round'/></svg>
          </div>
          <div class=\"welcome-greet\" style=\"font-size:1.45em;font-weight:900;color:#7b7bff;letter-spacing:0.01em;text-align:center;margin-bottom:8px;\">Добро пожаловать!</div>
          <div style=\"color:#b9dbff;font-size:1.08em;text-align:center;margin-bottom:10px;\">Сначала зарегистрируйтесь через Telegram-бота, чтобы пользоваться приложением.</div>
          <a href=\"${botLink}\" target=\"_blank\" style=\"display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:16px 32px;background:linear-gradient(90deg,#7b7bff 60%,#232b33 100%);color:#fff;border-radius:16px;font-size:1.18em;font-weight:700;text-decoration:none;box-shadow:0 3px 16px #7b7bff30;margin-top:8px;transition:background 0.24s;\">
            <svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' fill='none' viewBox='0 0 256 256'><path fill='#fff' d='M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z'/><path fill='#7b7bff' d='M195.88 70.12a16 16 0 0 0-16.88-3.75l-112 40A16 16 0 0 0 72 144.44l24.44 8.15l8.15 24.44A16 16 0 0 0 111.56 200a15.87 15.87 0 0 0 7.44-1.88l40-112a16 16 0 0 0-3.12-16.88ZM112 184l-8-24l24-8l8 24Zm-24-40l-24-8l112-40l-40 112Z'/></svg>
            Открыть Telegram-бота
          </a>
        </div>
      `);
      return;
    }
    USER = { username: d.username, bar_name: d.bar_name };
    document.getElementById('pageTitle').style.display = '';
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.style.display = '';
    showMenu();
  } catch (e) {
    showGlobalLoader(false);
    setPageTitle('Ошибка 404');
    showPage(`
      <div class="welcome-block">
        <div class="welcome-greet">${escapeHtml(getGreeting())}, гость!</div>
        <div style="margin:16px 0 24px 0;color:#888;font-size:1.05em;">Сначала зарегистрируйтесь через Telegram-бота, чтобы пользоваться приложением.</div>
        <a href="${botLink}" target="_blank" style="display:inline-block; padding:14px 28px; background:linear-gradient(90deg,#007aff 70%,#13c1e3 100%); color:#fff; border-radius:15px; font-size:1.1em; font-weight:700; text-decoration:none; box-shadow:0 3px 16px #13c1e340; margin-bottom:9px; transition:background 0.24s;">Открыть Telegram-бота</a>
      </div>
    `);
  }
}
startApp();

// Нижняя навигация
const navMap = {
  'nav-home': showMenu,
  'nav-search': showSearchPage,
  'nav-add': showAddPage,
  'nav-info': () => {
    setPageTitle('Информация');
    showPage('<div class="beautiful-form" style="text-align:center;font-size:1.2em;">Информация<br><br><span style="color:#888;">Скоро здесь появится что-то полезное!</span></div>');
  },
  'nav-profile': () => {
    setPageTitle('Профиль');
    showPage('<div class="beautiful-form" style="text-align:center;font-size:1.2em;">Профиль<br><br><span style="color:#888;">Скоро здесь появится ваш профиль!</span></div>');
  },
};
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const fn = navMap[this.id];
    if (fn) fn();
  });
});

async function renderCategoryChart(animate = true) {
  const mainDiv = document.getElementById('main');
  let data = { '🍯 Сиропы': 0, '🥕 Ингредиенты': 0, '☕ Кофе': 0, '📦 Прочее': 0 };
  try {
    let resp = await fetch(`${backend}/search`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({user_id: userId, query: ""})
    });
    let res = await resp.json();
    if (res.ok && Array.isArray(res.results)) {
      res.results.forEach(x => { if (data[x.category] !== undefined) data[x.category]++; });
    }
  } catch(e) {}
  let max = Math.max(...Object.values(data), 1);
  const icons = {
    '🍯 Сиропы': `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' fill='none' viewBox='0 0 256 256'><path fill='#7b7bff' d='M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z'/></svg>`,
    '🥕 Ингредиенты': `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' fill='none' viewBox='0 0 256 256'><path fill='#7bffb7' d='M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z'/></svg>`,
    '☕ Кофе': `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' fill='none' viewBox='0 0 256 256'><path fill='#ffb86b' d='M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z'/></svg>`,
    '📦 Прочее': `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' fill='none' viewBox='0 0 256 256'><path fill='#ff6b81' d='M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z'/></svg>`
  };
  const colors = {
    '🍯 Сиропы': '#7b7bff',
    '🥕 Ингредиенты': '#7bffb7',
    '☕ Кофе': '#ffb86b',
    '📦 Прочее': '#ff6b81'
  };
  const shortNames = {
    '🍯 Сиропы': 'Сиропы',
    '🥕 Ингредиенты': 'Ингр.',
    '☕ Кофе': 'Кофе',
    '📦 Прочее': 'Прочее'
  };
  let chart = `<div class=\"category-chart-tile\">
    <div class=\"chart-title\">Статистика по категориям</div>
    <div class=\"chart-bars\">
      ${Object.entries(data).map(([cat, val], i) => `
        <div class=\"chart-bar-wrap\">
          <div class=\"chart-bar\" data-final=\"${40 + 80 * (val/max)}\" style=\"height:${animate ? 0 : (40 + 80 * (val/max))}px;background:${colors[cat]};box-shadow:0 4px 24px ${colors[cat]}44; border-radius: 16px 16px 8px 8px / 24px 24px 8px 8px;\"></div>
          <div class=\"chart-bar-label\">${icons[cat]}</div>
          <div class=\"chart-bar-name\">${shortNames[cat]}</div>
          <div class=\"chart-bar-value\">${val}</div>
        </div>
      `).join('')}
    </div>
  </div>`;
  let expiredBlock = mainDiv.querySelector('.beautiful-form');
  let old = mainDiv.querySelector('.category-chart-tile');
  if (old) return;
  if (expiredBlock) {
    expiredBlock.insertAdjacentHTML('afterend', chart);
  } else {
    mainDiv.insertAdjacentHTML('beforeend', chart);
  }
  if (animate) {
    setTimeout(() => {
      mainDiv.querySelectorAll('.category-chart-tile .chart-bar').forEach((bar, idx) => {
        let final = bar.getAttribute('data-final');
        bar.style.transition = 'height 0.9s cubic-bezier(.4,0,.2,1), border-radius 0.5s';
        setTimeout(() => {
          bar.style.height = final + 'px';
          bar.style.borderRadius = '16px 16px 8px 8px / 24px 24px 8px 8px';
        }, 120 + idx * 120);
      });
    }, 80);
  }
}

// Отключаем свайп-вниз для закрытия Telegram WebApp
if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.disableClosingConfirmation) {
  try { window.Telegram.WebApp.disableClosingConfirmation(); } catch(e) {}
}

// Фильтр категорий и статуса под поиском: одна строка, две кнопки, выпадающий список для категорий и статусов
function renderCategoryStatusBar(filterCategory, filterOpened) {
  const categories = [
    { value: "", label: "Все категории", color: "cat-syrup" },
    { value: "🍯 Сиропы", label: "Сиропы", color: "cat-syrup" },
    { value: "🥕 Ингредиенты", label: "Ингредиенты", color: "cat-ingr" },
    { value: "☕ Кофе", label: "Кофе", color: "cat-coffee" },
    { value: "📦 Прочее", label: "Прочее", color: "cat-other" }
  ];
  const statuses = [
    { value: "", label: "Все статусы", color: "" },
    { value: "1", label: "Открыто", color: "status-open" },
    { value: "0", label: "Закрыто", color: "status-closed" }
  ];
  let catClass = categories.find(c => c.value === filterCategory)?.color || 'cat-syrup';
  let statusClass = statuses.find(s => s.value === filterOpened)?.color || '';
  let catSelect = `<select class="filter-native-select ${catClass}" id="categoryNativeSelect">${categories.map(c => `<option value="${c.value}"${c.value===filterCategory?' selected':''}>${c.label}</option>`).join('')}</select>`;
  let statusSelect = `<select class="filter-native-select ${statusClass}" id="statusNativeSelect">${statuses.map(s => `<option value="${s.value}"${s.value===filterOpened?' selected':''}>${s.label}</option>`).join('')}</select>`;
  return `<div class="filter-bar-wrap">${catSelect}${statusSelect}</div>`;
}

(function() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;
  nav.style.transition = 'opacity 0.33s cubic-bezier(.4,0,.2,1)';
  function hideNav() {
    nav.style.opacity = '0';
    nav.style.pointerEvents = 'none';
  }
  function showNav() {
    nav.style.opacity = '1';
    nav.style.pointerEvents = '';
  }
  let keyboardOpen = false;
  document.body.addEventListener('focusin', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      keyboardOpen = true;
      hideNav();
    }
  });
  document.body.addEventListener('focusout', function(e) {
    setTimeout(() => {
      if (!document.activeElement || ['INPUT','TEXTAREA','SELECT'].indexOf(document.activeElement.tagName) === -1) {
        keyboardOpen = false;
        showNav();
      }
    }, 120);
  });
  // Инициализация
  showNav();
})();

window.API_SECRET = 'testsecret'; // Для теста, потом заменить на безопасное хранение

function hmacSHA256(key, message) {
  // Используем встроенный SubtleCrypto (Web Crypto API)
  const enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    'raw', enc.encode(key), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']
  ).then(cryptoKey =>
    window.crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
  ).then(sig =>
    Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  );
}

async function secureFetch(url, data) {
  const payload = JSON.stringify(data);
  const timestamp = Math.floor(Date.now() / 1000);
  const hmac = await hmacSHA256(window.API_SECRET, payload + timestamp);
  return fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({payload, timestamp, hmac})
  });
}
