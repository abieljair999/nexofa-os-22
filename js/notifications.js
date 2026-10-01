/**
 * NEXOFA OS 22.0
 * Notifications Module
 *
 * Responsable de:
 * - Crear notificaciones
 * - Gestionar notificaciones
 * - Mantener historial en memoria
 * - Integrarse con el Shell cuando esté disponible
 */

const NexofaNotifications = (() => {
  'use strict';

  const CONFIG = {
    defaultDuration: 5000,
    maxNotifications: 100
  };

  let notifications = [];

  const generateId = () => {
    return `notification-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  };

  const create = (config = {}) => {
    const now = Date.now();

    return {
      id: generateId(),
      title: config.title || 'Nexofa',
      message: config.message || '',
      type: config.type || 'info',
      duration:
        typeof config.duration === 'number'
          ? config.duration
          : CONFIG.defaultDuration,
      timestamp: now,
      read: false
    };
  };

  const send = (config = {}) => {
    const notification = create(config);

    notifications.push(notification);

    if (notifications.length > CONFIG.maxNotifications) {
      notifications = notifications.slice(-CONFIG.maxNotifications);
    }

    console.log(
      `[Nexofa Notifications] ${notification.title}: ${notification.message}`
    );

    if (
      typeof NexofaShell !== 'undefined' &&
      typeof NexofaShell.isInitialized === 'function' &&
      NexofaShell.isInitialized() &&
      typeof NexofaShell.addNotification === 'function'
    ) {
      NexofaShell.addNotification(
        `${notification.title}: ${notification.message}`,
        notification.type
      );
    }

    if (notification.duration > 0) {
      setTimeout(() => {
        dismiss(notification.id);
      }, notification.duration);
    }

    return notification;
  };

  const markAsRead = (id) => {
    const notification = notifications.find(
      item => item.id === id
    );

    if (!notification) {
      return false;
    }

    notification.read = true;
    return true;
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      notification.read = true;
    });
  };

  const dismiss = (id) => {
    const index = notifications.findIndex(
      notification => notification.id === id
    );

    if (index === -1) {
      return false;
    }

    notifications.splice(index, 1);

    console.log(
      `[Nexofa Notifications] Dismissed: ${id}`
    );

    return true;
  };

  const dismissAll = () => {
    const count = notifications.length;

    notifications = [];

    console.log(
      `[Nexofa Notifications] Dismissed all (${count})`
    );
  };

  const getAll = () => {
    return notifications.map(notification => ({
      ...notification
    }));
  };

  const getUnread = () => {
    return notifications
      .filter(notification => !notification.read)
      .map(notification => ({
        ...notification
      }));
  };

  const getUnreadCount = () => {
    return notifications.filter(
      notification => !notification.read
    ).length;
  };

  const clear = () => {
    notifications = [];
  };

  return {
    create,
    send,
    dismiss,
    dismissAll,
    markAsRead,
    markAllAsRead,
    getAll,
    getUnread,
    getUnreadCount,
    clear
  };
})();

console.log('[Nexofa Notifications] Module loaded');
