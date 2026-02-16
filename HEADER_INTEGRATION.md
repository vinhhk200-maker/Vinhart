# Header Component Integration Guide

This guide explains how to integrate the reusable Header Component into new or existing pages of the Vinh Web project.

## Overview

The header component (`js/header.js`) is a self-contained module that automatically injects:
1.  **Global Background Marquee**: The scrolling text effect behind the content.
2.  **Navigation Header**: The top bar with Logo, Title, and Hamburger Menu.
3.  **Menu Overlay**: The full-screen navigation menu.
4.  **Interaction Logic**: Scroll effects (hide/show), menu toggling, and current page highlighting.

## Integration Steps

To add the header to any page, follow these simple steps:

### 1. Ensure CSS is Linked
Make sure the page links to the main stylesheet in the `<head>`:
```html
<link rel="stylesheet" href="style.css">
```

### 2. Add the Script
Insert the following script tag immediately after the opening `<body>` tag:
```html
<body>
    <!-- Header injected via js/header.js -->
    <script src="js/header.js"></script>

    <!-- Page Content -->
    <main class="container">
        ...
    </main>
</body>
```

### 3. Clean Up (If Migrating)
If you are migrating an existing page:
-   **Remove** any hardcoded `<header class="header">...</header>` HTML.
-   **Remove** any hardcoded `<div class="menu-overlay">...</div>` HTML.
-   **Remove** any legacy JavaScript related to menu toggling or header scroll effects (usually found at the bottom of the `<body>`).

## Features & Behavior

### Auto-Injection
The `HeaderComponent.init()` method runs immediately upon script loading. It detects if header elements already exist (and removes them to prevent duplicates) before injecting the new structure.

### Active Page Highlighting
The component automatically detects the current page filename (e.g., `profile.html`) and adds the `.current-page` class to the corresponding menu link.

### Scroll Interaction
The header implements "Smart Scroll" logic:
-   **Scroll Down**: Header hides (slides up).
-   **Scroll Up**: Header shows (slides down).
-   **Top of Page**: Header hides (transparent/default state).

### Responsive Design
The header uses the same responsive rules as defined in `style.css`. No additional CSS is needed for the component itself.

## Maintenance

To modify the header (e.g., add a menu item or change the logo):
1.  Open `js/header.js`.
2.  Edit the `html` template string within the `HeaderComponent` object.
3.  The changes will automatically apply to all pages using the script.
