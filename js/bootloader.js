/**
 * Nexofa Bootloader - js/bootloader.js
 * 
 * Secuencia de arranque:
 * 1. BOOT - Mostrar pantalla de arranque
 * 2. SYSTEM CHECK - Verificar dependencias
 * 3. CORE - Inicializar núcleo del sistema
 * 4. RUNTIME - Inicializar entorno de ejecución
 * 5. SHELL - Inicializar interfaz gráfica
 * 6. DESKTOP - Mostrar escritorio
 */

const NexofaBootloader = (() => {
  'use strict';

  const bootloader = {
    phase: 'IDLE',
    checkList: [],
    progress: 0,
    startTime: null
  };

  /**
   * Log Boot Message
   */
  const logBoot = (message, status = 'pending') => {
    console.log(`[Nexofa Boot] [${status.toUpperCase()}] ${message}`);

    const checksElement = document.getElementById('boot-checks');
    if (checksElement) {
      const checkItem = document.createElement('div');
      checkItem.className = `boot-check boot-check-${status}`;
      checkItem.textContent = message;
      checksElement.appendChild(checkItem);
    }

    bootloader.checkList.push({ message, status, timestamp: new Date().toISOString() });
  };

  /**
   * Update Progress Bar
   */
  const updateProgress = (percent) => {
    bootloader.progress = Math.min(percent, 100);
    const progressBar = document.getElementById('boot-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${bootloader.progress}%`;
    }
  };

  /**
   * Update Boot Status
   */
  const updateStatus = (message) => {
    const statusEl = document.getElementById('boot-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  };

  /**
   * Phase: BOOT
   */
  const phaseBoot = async () => {
    bootloader.phase = 'BOOT';
    bootloader.startTime = Date.now();

    console.log('\n═══════════════════════════════════════════');
    console.log('  NEXOFA OS 22.0 - BOOTLOADER');
    console.log('═══════════════════════════════════════════\n');

    logBoot('Display boot screen', 'ok');
    updateProgress(5);
    updateStatus('Starting Nexofa OS 22.0...');

    return { ok: true };
  };

  /**
   * Phase: SYSTEM CHECK
   */
  const phaseSystemCheck = async () => {
    bootloader.phase = 'SYSTEM CHECK';
    updateProgress(15);
    updateStatus('Performing system checks...');

    const checks = [
      { name: 'localStorage', test: () => NexofaStorage && NexofaStorage.isAvailable() },
      { name: 'DOM ready', test: () => document.readyState === 'complete' || document.readyState === 'interactive' },
      { name: 'NexofaCore module', test: () => typeof NexofaCore !== 'undefined' },
      { name: 'NexofaRuntime module', test: () => typeof NexofaRuntime !== 'undefined' },
      { name: 'NexofaShell module', test: () => typeof NexofaShell !== 'undefined' },
      { name: 'NexofaApps module', test: () => typeof NexofaApps !== 'undefined' },
      { name: 'NexofaNotifications module', test: () => typeof NexofaNotifications !== 'undefined' }
    ];

    const results = checks.map(check => {
      const passed = check.test();
      logBoot(`${check.name}: ${passed ? 'OK' : 'FAILED'}`, passed ? 'ok' : 'error');
      return { ...check, passed };
    });

    const allPassed = results.every(r => r.passed);
    updateProgress(25);

    if (!allPassed) {
      const failed = results.filter(r => !r.passed).map(r => r.name);
      throw new Error(`System check failed: ${failed.join(', ')}`);
    }

    return { ok: true, checks: results };
  };

  /**
   * Phase: CORE INITIALIZATION
   */
  const phaseCoreInit = async () => {
    bootloader.phase = 'CORE INITIALIZATION';
    updateProgress(40);
    updateStatus('Initializing core...');

    logBoot('Initializing Storage...', 'pending');
    const storageReady = NexofaStorage.isAvailable();
    logBoot(`Storage: ${storageReady ? 'Ready' : 'Fallback mode'}`, storageReady ? 'ok' : 'warn');

    logBoot('Initializing Core...', 'pending');
    const coreResult = NexofaCore.initialize();

    if (!coreResult.ok) {
      throw new Error(`Core initialization failed: ${coreResult.error}`);
    }

    logBoot('Core initialized', 'ok');
    updateProgress(55);

    return { ok: true, result: coreResult };
  };

  /**
   * Phase: RUNTIME INITIALIZATION
   */
  const phaseRuntimeInit = async () => {
    bootloader.phase = 'RUNTIME INITIALIZATION';
    updateProgress(65);
    updateStatus('Initializing runtime...');

    logBoot('Initializing Runtime...', 'pending');
    const runtimeResult = NexofaRuntime.initialize();

    if (!runtimeResult.ok) {
      throw new Error(`Runtime initialization failed: ${runtimeResult.error}`);
    }

    logBoot('Runtime initialized', 'ok');

    // Registrar módulos ejecutables
    NexofaRuntime.registerModule('shell', async () => {
      const shellResult = NexofaShell.initialize();
      if (!shellResult.ok) {
        throw new Error(`Shell initialization failed: ${shellResult.error}`);
      }
      return shellResult;
    });

    NexofaRuntime.registerModule('apps', async () => {
      // Registrar aplicaciones base
      NexofaApps.registerApp('files', {
        name: 'Files',
        icon: '📁',
        description: 'File Manager',
        version: '1.0'
      });

      NexofaApps.registerApp('settings', {
        name: 'Settings',
        icon: '⚙️',
        description: 'System Settings',
        version: '1.0'
      });

      NexofaApps.registerApp('terminal', {
        name: 'Terminal',
        icon: '⌨️',
        description: 'Command Terminal',
        version: '1.0'
      });

      logBoot('Apps registered: files, settings, terminal', 'ok');
      return { appsCount: 3 };
    });

    updateProgress(75);

    return { ok: true, result: runtimeResult };
  };

  /**
   * Phase: SHELL & APPS
   */
  const phaseShellAndApps = async () => {
    bootloader.phase = 'SHELL & APPS';
    updateProgress(85);
    updateStatus('Loading shell and applications...');

    logBoot('Executing Shell module...', 'pending');
    const shellExec = await NexofaRuntime.executeModule('shell');
    if (!shellExec.ok) {
      throw new Error(`Shell execution failed: ${shellExec.error}`);
    }
    logBoot('Shell ready', 'ok');

    logBoot('Executing Apps module...', 'pending');
    const appsExec = await NexofaRuntime.executeModule('apps');
    if (!appsExec.ok) {
      throw new Error(`Apps execution failed: ${appsExec.error}`);
    }
    logBoot('Apps registered', 'ok');

    updateProgress(92);

    return { ok: true };
  };

  /**
   * Phase: DESKTOP
   */
  const phaseDesktop = async () => {
    bootloader.phase = 'DESKTOP';
    updateProgress(98);
    updateStatus('Preparing desktop...');

    logBoot('Showing desktop...', 'pending');
    NexofaShell.showDesktop();
    logBoot('Desktop visible', 'ok');

    // Registrar apps en la UI
    const apps = NexofaApps.getAll();
    apps.forEach(app => {
      NexofaShell.registerAppUI(app.id, app);
    });

    logBoot('All apps registered in UI', 'ok');

    // Enviar notificación de bienvenida
    NexofaNotifications.send({
      title: 'Welcome',
      message: 'Nexofa OS 22.0 is ready',
      type: 'success',
      duration: 3000
    });

    updateProgress(100);
    updateStatus('Ready');

    const bootTime = Date.now() - bootloader.startTime;
    console.log(`\n✓ Boot completed in ${bootTime}ms\n`);
    logBoot(`Boot completed in ${bootTime}ms`, 'ok');

    return { ok: true, bootTime };
  };

  /**
   * Start Bootloader - Secuencia completa de arranque
   */
  const start = async () => {
    try {
      console.log('Starting bootloader...\n');

      // Fase 1: BOOT
      await phaseBoot();

      // Fase 2: SYSTEM CHECK
      await phaseSystemCheck();

      // Fase 3: CORE
      await phaseCoreInit();

      // Fase 4: RUNTIME
      await phaseRuntimeInit();

      // Fase 5: SHELL & APPS
      await phaseShellAndApps();

      // Fase 6: DESKTOP
      await phaseDesktop();

      console.log('═══════════════════════════════════════════');
      console.log('  NEXOFA OS 22.0 - SYSTEM READY');
      console.log('═══════════════════════════════════════════\n');

      return {
        ok: true,
        phase: 'COMPLETE',
        bootTime: Date.now() - bootloader.startTime,
        checkList: bootloader.checkList
      };
    } catch (error) {
      console.error('\n❌ Boot failed:', error.message, '\n');

      logBoot(`BOOT FAILED: ${error.message}`, 'error');
      updateStatus(`Boot failed: ${error.message}`);

      return {
        ok: false,
        phase: bootloader.phase,
        error: error.message,
        checkList: bootloader.checkList
      };
    }
  };

  /**
   * Get Status
   */
  const getStatus = () => ({
    phase: bootloader.phase,
    progress: bootloader.progress,
    checkList: bootloader.checkList
  });

  return {
    start,
    getStatus
  };
})();

// Auto-start bootloader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Bootloader] DOM ready, starting boot sequence...');
  NexofaBootloader.start().then(result => {
    if (result.ok) {
      console.log('[Bootloader] ✓ System boot successful');
    } else {
      console.error('[Bootloader] ✗ System boot failed');
    }
  });
});

console.log('[Nexofa Bootloader] Module loaded - Auto-start on DOMContentLoaded');
