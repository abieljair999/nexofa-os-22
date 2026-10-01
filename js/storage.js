/**
 * Nexofa Storage Module - js/storage.js
 * 
 * Responsabilidades:
 * - Abstracción de localStorage
 * - Persistencia de datos del sistema
 * - Gestión de preferencias de usuario
 * - Serialización/deserialización segura
 */

const NexofaStorage = (() => {
  'use strict';

  const PREFIX = 'nexofa_';
  const VERSION = '22.0';
  
  // Verificar disponibilidad de localStorage
  const isAvailable = () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  };

  const available = isAvailable();

  const makeKey = (key) => {
    return `${PREFIX}${key}`;
  };

  /**
   * Set - Guardar valor (con serialización JSON automática)
   */
  const set = (key, value) => {
    if (!available) {
      console.warn('[Nexofa Storage] localStorage not available');
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(makeKey(key), serialized);
      return true;
    } catch (error) {
      console.error('[Nexofa Storage] Failed to set:', key, error);
      return false;
    }
  };

  /**
   * Get - Recuperar valor (con deserialización automática)
   */
  const get = (key, defaultValue = null) => {
    if (!available) {
      return defaultValue;
    }

    try {
      const stored = localStorage.getItem(makeKey(key));
      if (stored === null) {
        return defaultValue;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('[Nexofa Storage] Failed to get:', key, error);
      return defaultValue;
    }
  };

  /**
   * Remove - Eliminar una clave
   */
  const remove = (key) => {
    if (!available) {
      return false;
    }

    try {
      localStorage.removeItem(makeKey(key));
      return true;
    } catch (error) {
      console.error('[Nexofa Storage] Failed to remove:', key, error);
      return false;
    }
  };

  /**
   * Clear - Limpiar todas las claves de Nexofa
   */
  const clear = () => {
    if (!available) {
      return false;
    }

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('[Nexofa Storage] Failed to clear:', error);
      return false;
    }
  };

  /**
   * GetAll - Recuperar todos los valores de Nexofa
   */
  const getAll = () => {
    const result = {};

    if (!available) {
      return result;
    }

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(PREFIX)) {
          const shortKey = key.replace(PREFIX, '');
          result[shortKey] = get(shortKey);
        }
      });
    } catch (error) {
      console.error('[Nexofa Storage] Failed to getAll:', error);
    }

    return result;
  };

  /**
   * Initialize - Crear estructura inicial si no existe
   */
  const initialize = () => {
    if (!available) {
      console.warn('[Nexofa Storage] Not available - running in memory only');
      return false;
    }

    try {
      // Crear estructura base si no existe
      if (!get('initialized')) {
        set('version', VERSION);
        set('initialized', true);
        set('bootedAt', new Date().toISOString());
        set('userPreferences', {
          theme: 'dark',
          language: 'es',
          notifications: true
        });
        set('systemState', {
          isRunning: false,
          shellReady: false,
          desktopReady: false
        });
        console.log('[Nexofa Storage] Initialized');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Nexofa Storage] Initialization failed:', error);
      return false;
    }
  };

  return {
    set,
    get,
    remove,
    clear,
    getAll,
    initialize,
    isAvailable: () => available,
    getVersion: () => VERSION
  };
})();

console.log('[Nexofa Storage] Module loaded - Available:', NexofaStorage.isAvailable());
