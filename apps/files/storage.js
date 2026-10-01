/**
 * Nexofa Files App - Storage Module
 * apps/files/storage.js
 * 
 * Abstracción de persistencia del filesystem virtual
 * Utiliza NexofaStorage como backend
 */

const NexofaFilesStorage = (() => {
  'use strict';

  const PREFIX = 'files_';
  const FS_KEY = 'filesystem_root';

  /**
   * Inicializar filesystem si no existe
   */
  const initialize = () => {
    const existing = NexofaStorage.get(FS_KEY);
    
    if (!existing) {
      const rootFolder = {
        id: 'root',
        name: 'Home',
        type: 'folder',
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        children: []
      };
      
      NexofaStorage.set(FS_KEY, [rootFolder]);
      console.log('[Nexofa Files Storage] Filesystem initialized');
      return [rootFolder];
    }
    
    return existing;
  };

  /**
   * Obtener todo el filesystem
   */
  const getFilesystem = () => {
    return NexofaStorage.get(FS_KEY, []);
  };

  /**
   * Guardar todo el filesystem
   */
  const saveFilesystem = (filesystem) => {
    return NexofaStorage.set(FS_KEY, filesystem);
  };

  /**
   * Obtener un elemento por ID
   */
  const getElementById = (id) => {
    const fs = getFilesystem();
    
    const search = (items) => {
      for (const item of items) {
        if (item.id === id) {
          return item;
        }
        if (item.children && item.children.length > 0) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return search(fs);
  };

  /**
   * Obtener elemento padre
   */
  const getParent = (id) => {
    if (id === 'root') return null;
    
    const fs = getFilesystem();
    
    const search = (items) => {
      for (const item of items) {
        if (item.children) {
          for (const child of item.children) {
            if (child.id === id) {
              return item;
            }
          }
        }
        if (item.children && item.children.length > 0) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return search(fs);
  };

  /**
   * Obtener hijos de una carpeta
   */
  const getChildren = (folderId) => {
    const folder = getElementById(folderId);
    if (!folder || folder.type !== 'folder') {
      return [];
    }
    return folder.children || [];
  };

  /**
   * Crear archivo
   */
  const createFile = (name, parentId = 'root', content = '') => {
    const fs = getFilesystem();
    const parent = getElementById(parentId);
    
    if (!parent || parent.type !== 'folder') {
      throw new Error('Parent folder not found');
    }
    
    // Validar nombre
    if (!name || name.trim() === '') {
      throw new Error('Filename cannot be empty');
    }
    
    if (NexofaFilesConstants.INVALID_CHARS_REGEX.test(name)) {
      throw new Error('Filename contains invalid characters');
    }
    
    // Verificar duplicado
    if (parent.children && parent.children.some(c => c.name === name)) {
      throw new Error('File already exists');
    }
    
    const file = {
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      type: 'file',
      parentId,
      content: content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(file);
    parent.updatedAt = new Date().toISOString();
    
    saveFilesystem(fs);
    console.log(`[Nexofa Files Storage] File created: ${name}`);
    
    return file;
  };

  /**
   * Crear carpeta
   */
  const createFolder = (name, parentId = 'root') => {
    const fs = getFilesystem();
    const parent = getElementById(parentId);
    
    if (!parent || parent.type !== 'folder') {
      throw new Error('Parent folder not found');
    }
    
    // Validar nombre
    if (!name || name.trim() === '') {
      throw new Error('Folder name cannot be empty');
    }
    
    if (NexofaFilesConstants.INVALID_CHARS_REGEX.test(name)) {
      throw new Error('Folder name contains invalid characters');
    }
    
    // Verificar duplicado
    if (parent.children && parent.children.some(c => c.name === name)) {
      throw new Error('Folder already exists');
    }
    
    const folder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      type: 'folder',
      parentId,
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(folder);
    parent.updatedAt = new Date().toISOString();
    
    saveFilesystem(fs);
    console.log(`[Nexofa Files Storage] Folder created: ${name}`);
    
    return folder;
  };

  /**
   * Eliminar elemento
   */
  const deleteElement = (id) => {
    if (id === 'root') {
      throw new Error('Cannot delete root folder');
    }
    
    const fs = getFilesystem();
    const parent = getParent(id);
    
    if (!parent) {
      throw new Error('Parent not found');
    }
    
    const index = parent.children.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Element not found');
    }
    
    const deleted = parent.children.splice(index, 1)[0];
    parent.updatedAt = new Date().toISOString();
    
    saveFilesystem(fs);
    console.log(`[Nexofa Files Storage] Element deleted: ${deleted.name}`);
    
    return deleted;
  };

  /**
   * Renombrar elemento
   */
  const rename = (id, newName) => {
    const fs = getFilesystem();
    const element = getElementById(id);
    
    if (!element) {
      throw new Error('Element not found');
    }
    
    // Validar nombre
    if (!newName || newName.trim() === '') {
      throw new Error('Name cannot be empty');
    }
    
    if (NexofaFilesConstants.INVALID_CHARS_REGEX.test(newName)) {
      throw new Error('Name contains invalid characters');
    }
    
    const parent = getParent(id);
    if (parent && parent.children) {
      if (parent.children.some(c => c.id !== id && c.name === newName)) {
        throw new Error('Name already exists in this folder');
      }
    }
    
    const oldName = element.name;
    element.name = newName;
    element.updatedAt = new Date().toISOString();
    
    saveFilesystem(fs);
    console.log(`[Nexofa Files Storage] Renamed: ${oldName} -> ${newName}`);
    
    return element;
  };

  /**
   * Guardar contenido de archivo
   */
  const saveFileContent = (id, content) => {
    const fs = getFilesystem();
    const file = getElementById(id);
    
    if (!file || file.type !== 'file') {
      throw new Error('File not found');
    }
    
    file.content = content;
    file.updatedAt = new Date().toISOString();
    
    saveFilesystem(fs);
    console.log(`[Nexofa Files Storage] File saved: ${file.name}`);
    
    return file;
  };

  /**
   * Obtener contenido de archivo
   */
  const getFileContent = (id) => {
    const file = getElementById(id);
    
    if (!file || file.type !== 'file') {
      throw new Error('File not found');
    }
    
    return file.content || '';
  };

  return {
    initialize,
    getFilesystem,
    saveFilesystem,
    getElementById,
    getParent,
    getChildren,
    createFile,
    createFolder,
    deleteElement,
    rename,
    saveFileContent,
    getFileContent
  };
})();

// Exportar al scope global
window.NexofaFilesStorage = NexofaFilesStorage;

console.log('[Nexofa Files] Storage module loaded');
