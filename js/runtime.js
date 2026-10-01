/**
 * Nexofa Runtime Module - js/runtime.js
 * 
 * Responsabilidades:
 * - Ejecución de módulos del sistema
 * - Gestión de ciclo de vida
 * - Coordinación entre componentes
 * - Manejo de errores en tiempo de ejecución
 */

const NexofaRuntime = (() => {
  'use strict';

  const runtime = {
    initialized: false,
    modules: {},
    tasks: [],
    errors: []
  };

  /**
   * Register Module - Registrar un módulo ejecutable
   */
  const registerModule = (name, executor) => {
    if (!name || typeof name !== 'string') {
      throw new Error('[Runtime] Invalid module name');
    }

    if (typeof executor !== 'function') {
      throw new Error('[Runtime] Module executor must be a function');
    }

    runtime.modules[name] = {
      name,
      executor,
      executed: false,
      executedAt: null,
      error: null
    };

    console.log(`[Nexofa Runtime] Module registered: ${name}`);
    return runtime.modules[name];
  };

  /**
   * Execute Module - Ejecutar un módulo registrado
   */
  const executeModule = async (name) => {
    const module = runtime.modules[name];

    if (!module) {
      const error = `Module not found: ${name}`;
      console.error('[Nexofa Runtime]', error);
      recordError(name, error);
      return { ok: false, error };
    }

    if (module.executed) {
      console.warn(`[Nexofa Runtime] Module already executed: ${name}`);
      return { ok: true, cached: true };
    }

    try {
      console.log(`[Nexofa Runtime] Executing module: ${name}`);
      const result = await Promise.resolve(module.executor());

      module.executed = true;
      module.executedAt = new Date().toISOString();

      console.log(`[Nexofa Runtime] Module executed successfully: ${name}`);
      return { ok: true, result };
    } catch (error) {
      module.error = error.message;
      recordError(name, error);
      console.error(`[Nexofa Runtime] Module execution failed: ${name}`, error);
      return { ok: false, error: error.message };
    }
  };

  /**
   * Execute Sequence - Ejecutar una secuencia de módulos en orden
   */
  const executeSequence = async (sequence = []) => {
    const results = {};
    const failedModules = [];

    for (const moduleName of sequence) {
      const result = await executeModule(moduleName);
      results[moduleName] = result;

      if (!result.ok) {
        failedModules.push(moduleName);
      }
    }

    const allOk = failedModules.length === 0;

    if (allOk) {
      console.log('[Nexofa Runtime] Sequence completed successfully');
    } else {
      console.error('[Nexofa Runtime] Sequence failed:', failedModules);
    }

    return {
      ok: allOk,
      results,
      failedModules,
      executedCount: sequence.length - failedModules.length,
      totalCount: sequence.length
    };
  };

  /**
   * Schedule Task - Programar una tarea para ejecución posterior
   */
  const scheduleTask = (name, executor, delay = 0) => {
    const task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      executor,
      delay,
      scheduled: new Date().toISOString(),
      executed: false,
      error: null
    };

    runtime.tasks.push(task);

    setTimeout(async () => {
      try {
        console.log(`[Nexofa Runtime] Executing scheduled task: ${name}`);
        await Promise.resolve(executor());
        task.executed = true;
        console.log(`[Nexofa Runtime] Task completed: ${name}`);
      } catch (error) {
        task.error = error.message;
        recordError(`task:${name}`, error);
        console.error(`[Nexofa Runtime] Task failed: ${name}`, error);
      }
    }, delay);

    return task;
  };

  /**
   * Record Error - Registrar errores del sistema
   */
  const recordError = (component, error) => {
    runtime.errors.push({
      component,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : null
    });
  };

  /**
   * Get Module - Obtener información de un módulo
   */
  const getModule = (name) => {
    return runtime.modules[name] || null;
  };

  /**
   * Get All Modules
   */
  const getAllModules = () => {
    return Object.keys(runtime.modules).map(name => runtime.modules[name]);
  };

  /**
   * Get Errors - Obtener historial de errores
   */
  const getErrors = () => {
    return [...runtime.errors];
  };

  /**
   * Get Status - Obtener estado actual del runtime
   */
  const getStatus = () => {
    const modules = getAllModules();
    const executed = modules.filter(m => m.executed).length;
    const failed = modules.filter(m => m.error).length;

    return {
      initialized: runtime.initialized,
      modulesTotal: modules.length,
      modulesExecuted: executed,
      modulesFailed: failed,
      tasksScheduled: runtime.tasks.length,
      errorsRecorded: runtime.errors.length,
      modules: modules
    };
  };

  /**
   * Initialize Runtime - Inicializar el entorno de ejecución
   */
  const initialize = () => {
    if (runtime.initialized) {
      console.warn('[Nexofa Runtime] Already initialized');
      return { ok: false, message: 'Already initialized' };
    }

    try {
      // Verificar dependencias
      const deps = NexofaCore.checkDependencies(['NexofaStorage']);
      if (!deps.ok) {
        throw new Error(`Missing dependencies: ${deps.missing.join(', ')}`);
      }

      runtime.initialized = true;

      // Registrar Runtime en Core
      NexofaCore.registerComponent('Runtime', {
        status: 'ready',
        version: '22.0'
      });

      console.log('[Nexofa Runtime] Runtime initialized');
      return { ok: true, status: getStatus() };
    } catch (error) {
      console.error('[Nexofa Runtime] Initialization failed:', error);
      return { ok: false, error: error.message };
    }
  };

  return {
    initialize,
    registerModule,
    executeModule,
    executeSequence,
    scheduleTask,
    getModule,
    getAllModules,
    getErrors,
    getStatus
  };
})();

// Exponer al scope global para que Bootloader y otros módulos puedan acceder al Runtime
window.NexofaRuntime = NexofaRuntime;

console.log('[Nexofa Runtime] Module loaded');
