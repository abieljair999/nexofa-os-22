# Nexofa OS 22.0 - Bootloader Architecture

A modular, web-based operating system-like interface built with clean architecture principles.

## Architecture

```
BOOTLOADER
    ↓
SYSTEM CHECK
    ↓
CORE INITIALIZATION
    ↓
RUNTIME INITIALIZATION
    ↓
MOBILE SHELL
    ↓
DESKTOP
```

## Project Structure

```
nexofa-os-22/
├── index.html              # Entry point
├── README.md               # This file
├── css/
│   └── nexofa.css         # Global styles
├── js/
│   ├── bootloader.js      # System boot sequence
│   ├── core.js            # Core system logic
│   ├── runtime.js         # Runtime environment
│   ├── shell.js           # Mobile shell interface
│   ├── storage.js         # Persistence layer
│   ├── apps.js            # App management
│   └── notifications.js   # Notification system
├── apps/
│   ├── files/            # File manager app
│   ├── settings/         # Settings app
│   └── terminal/         # Terminal app
└── assets/               # Images, icons, etc.
```

## Development

Each component has a single responsibility:

- **Bootloader**: System initialization and checks
- **Core**: Fundamental OS logic
- **Runtime**: Module execution and state management
- **Shell**: User interface layer
- **Storage**: Persistent data management

## Status

Currently in: **ETAPA 1 - Base Structure Creation**

## Notes

- Do not modify the original `abieljair999/Nexafo-OS` repository (kept as backup)
- This is version 22.0 - focus on stability before adding new features
- No persisted state should be lost during navigation or reload
