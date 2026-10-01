/**
 * Nexofa Files App - Constants
 * apps/files/constants.js
 * 
 * Constantes, configuración y valores por defecto para el gestor de archivos
 */

const NexofaFilesConstants = {
  // Prefijo de almacenamiento
  STORAGE_PREFIX: 'files_',
  
  // Claves de almacenamiento
  STORAGE_KEYS: {
    FILESYSTEM: 'filesystem_root',
    CURRENT_DIR: 'current_directory'
  },
  
  // Tipos de elementos
  ELEMENT_TYPES: {
    FILE: 'file',
    FOLDER: 'folder'
  },
  
  // Configuración
  MAX_FILENAME_LENGTH: 255,
  MAX_FILE_SIZE: 1024 * 1024, // 1MB (por item en localStorage)
  ICON_SIZE: 32,
  
  // Iconos por tipo de archivo
  FILE_ICONS: {
    'text/plain': '📄',
    'text': '📄',
    'folder': '📁',
    'default': '📦'
  },
  
  // Mensajes
  MESSAGES: {
    EMPTY_FOLDER: 'Esta carpeta está vacía',
    CONFIRM_DELETE: '¿Estás seguro de que deseas eliminar',
    FILE_CREATED: 'Archivo creado',
    FOLDER_CREATED: 'Carpeta creada',
    FILE_DELETED: 'Archivo eliminado',
    FOLDER_DELETED: 'Carpeta eliminada',
    FILE_RENAMED: 'Archivo renombrado',
    FILE_SAVED: 'Archivo guardado',
    ERROR_EMPTY_NAME: 'El nombre no puede estar vacío',
    ERROR_INVALID_CHARS: 'El nombre contiene caracteres inválidos',
    ERROR_ALREADY_EXISTS: 'Ya existe un elemento con ese nombre'
  },
  
  // CSS Classes
  CSS_CLASSES: {
    CONTAINER: 'files-container',
    HEADER: 'files-header',
    BREADCRUMB: 'files-breadcrumb',
    TOOLBAR: 'files-toolbar',
    CONTENT: 'files-content',
    GRID: 'files-grid',
    ITEM: 'files-item',
    ITEM_SELECTED: 'files-item-selected',
    ITEM_ICON: 'files-item-icon',
    ITEM_NAME: 'files-item-name',
    EDITOR: 'files-editor',
    EDITOR_TEXTAREA: 'files-editor-textarea',
    STATUS_BAR: 'files-status-bar'
  },
  
  // Validación
  INVALID_CHARS_REGEX: /[<>:"|?*\x00-\x1f]/g,
  
  // Root folder ID
  ROOT_ID: 'root'
};

// Exportar al scope global
window.NexofaFilesConstants = NexofaFilesConstants;

console.log('[Nexofa Files] Constants module loaded');
