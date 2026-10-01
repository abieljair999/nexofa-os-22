/**
 * Nexofa Apps Manager - js/apps.js
 * Basic app registry and launcher
 */
(function (global) {
  'use strict';

  const APPS = Object.create(null);
  const OPEN = Object.create(null);

  const registerApp = (id, meta = {}) => {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid application id');
    }

    const app = {
      id,
      name: meta.name || id,
      icon: meta.icon || '📦',
      description: meta.description || '',
      ...meta
    };

    APPS[id] = app;
    console.log(`[Nexofa Apps] Registered ${id}`);
    return app;
  };

  const getApp = (id) => APPS[id] || null;
  const getAll = () => Object.keys(APPS).map((id) => APPS[id]);

  const openApp = (id, options = {}) => {
    const app = getApp(id);
    if (!app) {
      throw new Error(`App ${id} not found`);
    }

    if (OPEN[id]) {
      return OPEN[id];
    }

    const container = document.getElementById('window-container');
    if (!container) {
      OPEN[id] = { id, openedAt: new Date().toISOString(), fallback: true };
      return OPEN[id];
    }

    const win = document.createElement('div');
    win.className = 'nexofa-window';
    win.dataset.app = id;

    const bodyContent = typeof app.render === 'function'
      ? app.render(options)
      : `<p>${app.description || 'Application loaded'}</p>`;

    win.innerHTML = `
      <div class="nexofa-window-title">
        <span>${app.icon} ${app.name}</span>
        <button class="btn-close" data-app="${id}">✖</button>
      </div>
      <div class="nexofa-window-body">${bodyContent}</div>
    `;

    const closeButton = win.querySelector('.btn-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => closeApp(id));
    }

    container.appendChild(win);
    OPEN[id] = { id, element: win, openedAt: new Date().toISOString() };

    if (global.NexofaShell && typeof global.NexofaShell.onAppOpened === 'function') {
      global.NexofaShell.onAppOpened(id);
    }

    return OPEN[id];
  };

  const closeApp = (id) => {
    const open = OPEN[id];
    if (!open) {
      return false;
    }

    try {
      if (open.element && open.element.parentNode) {
        open.element.parentNode.removeChild(open.element);
      }
    } catch (error) {
      console.warn('[Nexofa Apps] closeApp DOM removal failed', error);
    }

    delete OPEN[id];

    if (global.NexofaShell && typeof global.NexofaShell.onAppClosed === 'function') {
      global.NexofaShell.onAppClosed(id);
    }

    return true;
  };

  const getOpenApps = () => Object.keys(OPEN).map((id) => OPEN[id]);

  const NexofaApps = {
    registerApp,
    getApp,
    getAll,
    openApp,
    closeApp,
    getOpenApps
  };

  global.NexofaApps = NexofaApps;
  console.log('[Nexofa Apps] Module loaded');
})(window);
