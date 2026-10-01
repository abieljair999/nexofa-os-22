/**
 * Nexofa Shell Module - js/shell.js
 * 
 * Responsabilidades:
 * - Interfaz gráfica del escritorio
 * - Gestión de topbar, dock, paneles
 * - Interacción con usuario
 * - Integración con apps y notificaciones
 */

const NexofaShell = (() => {
  'use strict';

  const shell = {
    initialized: false,
    running: false,
    desktopElement: null,
    notifications: [],
    time: {
      current: new Date()
    }
  };

  /**
   * Initialize Shell - Inicializar la interfaz del escritorio
   */
  const initialize = () => {
    if (shell.initialized) {
      console.warn('[Nexofa Shell] Already initialized');
      return { ok: false, message: 'Already initialized' };
    }

    try {
      shell.desktopElement = document.getElementById('desktop');

      if (!shell.desktopElement) {
        throw new Error('Desktop element not found');
      }

      // [DEBUG DIAGNOSTICS] Verificar el estado de las dependencias ANTES de llamar checkDependencies
      console.log('[DEBUG Shell] Notifications global:', window.NexofaNotifications);
      console.log('[DEBUG Shell] Notifications type:', typeof window.NexofaNotifications);
      console.log('[DEBUG Shell] Storage type:', typeof window.NexofaStorage);
      console.log('[DEBUG Shell] Apps type:', typeof window.NexofaApps);
      console.log('[DEBUG Shell] Core type:', typeof window.NexofaCore);

      // Verificar dependencias
      const deps = NexofaCore.checkDependencies(['NexofaStorage', 'NexofaApps', 'NexofaNotifications']);
      if (!deps.ok) {
        throw new Error(`Missing dependencies: ${deps.missing.join(', ')}`);
      }

      // Inicializar componentes de la shell
      initializeTopbar();
      initializeDock();
      initializeDesktopIcons();
      initializeQuickPanel();
      initializeNotificationsPanel();
      initializeTimeUpdater();

      shell.initialized = true;
      shell.running = true;

      // Registrar en Core
      NexofaCore.registerComponent('Shell', {
        status: 'ready',
        initialized: true,
        topbar: true,
        dock: true,
        desktopIcons: true
      });

      console.log('[Nexofa Shell] Shell initialized and ready');
      return { ok: true, shell };
    } catch (error) {
      console.error('[Nexofa Shell] Initialization failed:', error);
      return { ok: false, error: error.message };
    }
  };

  /**
   * Initialize Topbar
   */
  const initializeTopbar = () => {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const timeEl = document.getElementById('topbar-time');
    const quickBtn = document.getElementById('btn-quick');

    if (timeEl) {
      updateTime();
    }

    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        toggleQuickPanel();
      });
    }

    console.log('[Nexofa Shell] Topbar initialized');
  };

  /**
   * Update Time - Actualizar hora en topbar
   */
  const updateTime = () => {
    const timeEl = document.getElementById('topbar-time');
    if (!timeEl) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;
  };

  /**
   * Initialize Time Updater
   */
  const initializeTimeUpdater = () => {
    setInterval(() => {
      updateTime();
    }, 60000); // Actualizar cada minuto
  };

  /**
   * Initialize Dock
   */
  const initializeDock = () => {
    const dock = document.getElementById('dock');
    if (!dock) return;

    // El dock se poblará con iconos de apps
    // Por ahora solo lo marcamos como inicializado
    console.log('[Nexofa Shell] Dock initialized');
  };

  /**
   * Initialize Desktop Icons
   */
  const initializeDesktopIcons = () => {
    const desktopIcons = document.getElementById('desktop-icons');
    if (!desktopIcons) return;

    // Se poblarán dinámicamente cuando las apps se registren
    console.log('[Nexofa Shell] Desktop icons container ready');
  };

  /**
   * Initialize Quick Panel
   */
  const initializeQuickPanel = () => {
    const panel = document.getElementById('quick-panel');
    if (!panel) return;

    const quickBtn = document.getElementById('btn-quick');
    if (quickBtn) {
      quickBtn.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    document.addEventListener('click', () => {
      if (!panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
      }
    });

    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    console.log('[Nexofa Shell] Quick panel initialized');
  };

  /**
   * Toggle Quick Panel
   */
  const toggleQuickPanel = () => {
    const panel = document.getElementById('quick-panel');
    if (!panel) return;

    panel.classList.toggle('hidden');
  };

  /**
   * Initialize Notifications Panel
   */
  const initializeNotificationsPanel = () => {
    const panel = document.getElementById('notifications-panel');
    if (!panel) return;

    console.log('[Nexofa Shell] Notifications panel initialized');
  };

  /**
   * Show Desktop - Mostrar escritorio (ocultar boot screen)
   */
  const showDesktop = () => {
    const bootScreen = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');

    if (bootScreen) {
      bootScreen.classList.add('hidden');
    }

    if (desktop) {
      desktop.classList.remove('hidden');
    }

    console.log('[Nexofa Shell] Desktop is now visible');
  };

  /**
   * Hide Desktop
   */
  const hideDesktop = () => {
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.classList.add('hidden');
    }
  };

  /**
   * Add Notification - Agregar notificación a la shell
   */
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: `shell-notif-${Date.now()}`,
      message,
      type,
      timestamp: new Date().toISOString()
    };

    shell.notifications.push(notification);

    // Limitar a 10 notificaciones recientes
    if (shell.notifications.length > 10) {
      shell.notifications = shell.notifications.slice(-10);
    }

    console.log(`[Nexofa Shell] Notification (${type}): ${message}`);

    // Mostrar en panel si está visible
    updateNotificationsPanel();

    return notification;
  };

  /**
   * Update Notifications Panel
   */
  const updateNotificationsPanel = () => {
    const list = document.getElementById('notifications-list');
    if (!list) return;

    list.innerHTML = shell.notifications
      .map(notif => `
        <div class="notification-item notification-${notif.type}">
          <div class="notification-message">${notif.message}</div>
          <div class="notification-time">${new Date(notif.timestamp).toLocaleTimeString()}</div>
        </div>
      `)
      .join('');
  };

  /**
   * Register App in Shell - Registrar app en la interfaz
   */
  const registerAppUI = (appId, appData) => {
    const dock = document.getElementById('dock');
    if (!dock) return;

    const dockItem = document.createElement('div');
    dockItem.className = 'dock-item';
    dockItem.dataset.app = appId;
    dockItem.innerHTML = `
      <div class="dock-item-icon">${appData.icon}</div>
      <div class="dock-item-name">${appData.name}</div>
    `;

    dockItem.addEventListener('click', () => {
      if (NexofaApps && typeof NexofaApps.openApp === 'function') {
        NexofaApps.openApp(appId);
      }
    });

    dock.appendChild(dockItem);
    console.log(`[Nexofa Shell] App registered in UI: ${appId}`);
  };

  /**
   * Is Initialized
   */
  const isInitialized = () => {
    return shell.initialized;
  };

  /**
   * Get Status
   */
  const getStatus = () => {
    return {
      initialized: shell.initialized,
      running: shell.running,
      notificationsCount: shell.notifications.length,
      desktopVisible: shell.desktopElement && !shell.desktopElement.classList.contains('hidden')
    };
  };

  // Event handlers para apps
  const onAppOpened = (appId) => {
    console.log(`[Nexofa Shell] App opened: ${appId}`);
    addNotification(`Opened: ${appId}`, 'info');
  };

  const onAppClosed = (appId) => {
    console.log(`[Nexofa Shell] App closed: ${appId}`);
    addNotification(`Closed: ${appId}`, 'info');
  };

  return {
    initialize,
    showDesktop,
    hideDesktop,
    addNotification,
    registerAppUI,
    isInitialized,
    getStatus,
    onAppOpened,
    onAppClosed
  };
})();

// Exponer al scope global para que Bootloader y otros módulos puedan acceder al Shell
window.NexofaShell = NexofaShell;

console.log('[Nexofa Shell] Module loaded');
