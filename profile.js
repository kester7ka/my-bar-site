(function(){
  // Получаем данные из глобальных переменных main.js
  const escape = typeof window.escapeHtml === 'function' ? window.escapeHtml : (x => x);
  const uname = window.username ? escape(window.username) : 'Гость';
  const bar = window.USER && window.USER.bar_name ? escape(window.USER.bar_name) : '—';
  const userPhoto = window.userPhoto;
  const userId = window.userId;
  const photo = userPhoto ? `<img src="${userPhoto}" alt="avatar" class="user-avatar" style="width:88px;height:88px;box-shadow:0 2px 18px #7b7bff55,0 2px 1.5px #232b33 inset;border:3px solid #232b33;background:#232b33;object-fit:cover;">` : `<div class="user-avatar" style="width:88px;height:88px;display:flex;align-items:center;justify-content:center;background:#232b33;color:#7b7bff;font-size:2.7em;">👤</div>`;
  const html = `
    <div class="beautiful-form" style="max-width:420px;margin:38px auto 0 auto;padding:38px 18px 34px 18px;box-shadow:0 8px 40px #7b7bff33,0 1.5px 7px #232b3340,0 1.5px 0.5px #fff2 inset;border:2px solid #7b7bff33;border-radius:32px;animation:popIn 0.7s;display:flex;flex-direction:column;align-items:center;gap:18px;">
      ${photo}
      <div class="welcome-greet" style="font-size:1.45em;font-weight:900;color:#fff;letter-spacing:0.01em;text-align:center;margin-bottom:2px;">${uname}</div>
      <div class="welcome-bar" style="font-size:1.08em;color:#b9dbff;background:#232b33;padding:7px 18px;border-radius:13px;margin-bottom:8px;font-weight:700;display:inline-block;text-align:center;">Бар: ${bar}</div>
      <div style="width:100%;height:1px;background:linear-gradient(90deg,#232b33 0%,#7b7bff 100%);margin:18px 0 10px 0;opacity:0.25;"></div>
      <div style="color:#b9dbff;font-size:1.08em;text-align:center;margin-bottom:10px;">ID пользователя: <span style="color:#7b7bff;font-weight:700;">${userId||'—'}</span></div>
      <div style="color:#888;font-size:1.02em;text-align:center;margin-bottom:0;">Версия приложения: <span style="color:#7b7bff;font-weight:700;">0.7 <span style='font-size:0.95em;'>(Бета)</span></span></div>
    </div>
  `;
  window.renderProfilePage = function() {
    window.setPageTitle && window.setPageTitle('Профиль');
    window.showPage && window.showPage(html);
  };
})();
