/**
 * Nexofa Core Module - js/core.js
 * 
 * Responsabilidades:
 * - Inicialización base del sistema
 * - Gestión de estado central
 * - Validación de dependencias
 * - API de eventos del sistema
 */

const NexofaCore = (() => {
  'use strict';

  // Estado central del sistema
  const systemState = {
    initialized: false,
    running: false,
    bootedAt: null,
    version: '22.0',
    components: {}
  };

  // Listeners de eventos del sistema
  const listeners = {};

  /**
   * Register Component - Registrar un componente en el sistema
   */
  const registerComponent = (name, component) => {
    if (!name || typeof name !== 'string') {
      throw new Error('[Core] Invalid component name');
    }

    if (!component || typeof component !== 'object') {
      throw new Error('[Core] Invalid component object');
    }

    systemState.components[name] = {
      name,
      registered: true,
      registeredAt: new Date().toISOString(),
      ...component
    };

    console.log(`[Nexofa Core] Component registered: ${name}`);
    emit('component:registered', { name, component: systemState.components[name] });

    return systemState.components[name];
  };

  /**
   * Get Component - Obtener un componente registrado
   */
  const getComponent = (name) => {
    return systemState.components[name] || null;
  };

  /**
   * Get All Components
   */
  const getAllComponents = () => {
    return Object.keys(systemState.components).map(name => systemState.components[name]);
  };

  /**
   * Check Dependencies - Verificar que todas las dependencias estén disponibles
   */
  const checkDependencies = (required = []) => {
    const missing = [];

    required.forEach(dep => {
      if (typeof window[dep] === 'undefined') {
        missing.push(dep);
      }
    });

    if (missing.length > 0) {
      console.error('[Nexofa Core] Missing dependencies:', missing);
      return { ok: false, missing };
    }

    console.log('[Nexofa Core] All dependencies available');
    return { ok: true, missing: [] };
  };

  /**
   * Initialize Core - Inicializar el núcleo del sistema
   */
  const initialize = () => {
    if (systemState.initialized) {
      console.warn('[Nexofa Core] Already initialized');
      return { ok: false, message: 'Already initialized' };
    }

    try {
      // Verificar Storage disponible
      if (!NexofaStorage || typeof NexofaStorage.isAvailable !== 'function') {
        throw new Error('NexofaStorage not available');
      }

      // Inicializar Storage
      if (NexofaStorage.isAvailable()) {
        NexofaStorage.initialize();
      }

      systemState.initialized = true;
      systemState.running = true;
      systemState.bootedAt = new Date().toISOString();

      // Guardar estado en Storage
      NexofaStorage.set('systemState', {
        initialized: true,
        running: true,
        bootedAt: systemState.bootedAt,
        version: systemState.version
      });

      console.log('[Nexofa Core] Core initialized');
      emit('core:initialized', { systemState });

      return { ok: true, systemState };
    } catch (error) {
      console.error('[Nexofa Core] Initialization failed:', error);
      return { ok: false, error: error.message };
    }
  };

  /**
   * On - Suscribirse a eventos del sistema
   */
  const on = (event, callback) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
    return () => {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  };

  /**
   * Emit - Emitir evento del sistema
   */
  const emit = (event, data = {}) => {
    if (!listeners[event]) {
      return;
    }
    listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[Nexofa Core] Error in listener for ${event}:`, error);
      }
    });
  };

  /**
   * Get State - Obtener estado actual del sistema
   */
  const getState = () => ({
    ...systemState
  });

  /**
   * Set Running State
   */
  const setRunning = (running) => {
    systemState.running = !!running;
    NexofaStorage.set('systemState', { ...systemState });
    emit('core:stateChanged', { running: systemState.running });
  };

  /**
   * Shutdown - Preparar sistema para cierre
   */
  const shutdown = () => {
    console.log('[Nexofa Core] System shutting down');
    setRunning(false);
    emit('core:shutdown', { systemState });
  };

  return {
    initialize,
    registerComponent,
    getComponent,
    getAllComponents,
    checkDependencies,
    on,
    emit,
    getState,
    setRunning,
    shutdown
  };
})();

// Exponer al scope global para que otros módulos puedan acceder al Core
window.NexofaCore = NexofaCore;

console.log('[Nexofa Core] Module loaded');
