
# FarmChef JavaScript SDK

A comprehensive JavaScript SDK for integrating farm-to-table restaurant functionality into any HTML/JS project. This SDK provides authentication, menu management, and live content updates through a simple CDN-based integration.

## Quick Start

### 1. Include the SDK

```html
<!-- Include from your deployed site -->
<script src="https://your-site-url.com/farm-chef-sdk.js"></script>

<!-- Or use the minified version -->
<script src="https://your-site-url.com/farm-chef-sdk.min.js"></script>
```

### 2. Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Restaurant Site</title>
</head>
<body>
    <div id="menu"></div>
    <div id="auth"></div>
    
    <script src="https://your-site-url.com/farm-chef-sdk.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            // Inject default styles
            FarmChef.injectCSS();
            
            // Set up authentication
            const authContainer = document.getElementById('auth');
            authContainer.innerHTML = FarmChef.ui.generateAuthHTML();
            FarmChef.ui.attachEventListeners(authContainer);
            
            // Load and display menu
            const { data: menuItems } = await FarmChef.menu.getItems();
            const menuContainer = document.getElementById('menu');
            menuContainer.innerHTML = FarmChef.ui.generateMenuHTML(menuItems);
        });
    </script>
</body>
</html>
```

## API Reference

### Authentication

#### `FarmChef.auth.signUp(email, password)`
Create a new user account.

```javascript
const { user, error } = await FarmChef.auth.signUp('user@example.com', 'password123');
if (error) {
    console.error('Sign up failed:', error.message);
} else {
    console.log('User created:', user);
}
```

#### `FarmChef.auth.signIn(email, password)`
Sign in an existing user.

```javascript
const { user, error } = await FarmChef.auth.signIn('user@example.com', 'password123');
```

#### `FarmChef.auth.signOut()`
Sign out the current user.

```javascript
await FarmChef.auth.signOut();
```

#### `FarmChef.auth.getCurrentUser()`
Get the currently authenticated user.

```javascript
const currentUser = FarmChef.auth.getCurrentUser();
```

#### `FarmChef.auth.onAuthStateChange(callback)`
Listen to authentication state changes.

```javascript
const unsubscribe = FarmChef.auth.onAuthStateChange((user, event) => {
    if (user) {
        console.log('User signed in:', user.email);
    } else {
        console.log('User signed out');
    }
});

// To unsubscribe later
unsubscribe();
```

### Menu Management

#### `FarmChef.menu.getItems()`
Get all available menu items (public).

```javascript
const { data: menuItems, error } = await FarmChef.menu.getItems();
```

#### `FarmChef.menu.getAllItems()`
Get all menu items including unavailable ones (requires authentication).

```javascript
const { data: allItems, error } = await FarmChef.menu.getAllItems();
```

#### `FarmChef.menu.createItem(item)`
Create a new menu item (requires authentication).

```javascript
const newItem = {
    name: 'Fresh Salad',
    description: 'Garden fresh vegetables',
    price: 12.99,
    image_url: 'https://example.com/salad.jpg',
    category: 'appetizer',
    is_available: true
};

const { data, error } = await FarmChef.menu.createItem(newItem);
```

#### `FarmChef.menu.updateItem(id, updates)`
Update an existing menu item.

```javascript
const { data, error } = await FarmChef.menu.updateItem('item-id', {
    price: 14.99,
    is_available: false
});
```

#### `FarmChef.menu.deleteItem(id)`
Delete a menu item.

```javascript
const { error } = await FarmChef.menu.deleteItem('item-id');
```

#### `FarmChef.menu.subscribe(callback)`
Subscribe to real-time menu updates.

```javascript
const unsubscribe = FarmChef.menu.subscribe((payload) => {
    console.log('Menu updated:', payload);
    // Reload your menu display
});

// To unsubscribe
unsubscribe();
```

### UI Components

#### `FarmChef.ui.generateMenuHTML(menuItems, options)`
Generate HTML for displaying menu items.

```javascript
const menuHTML = FarmChef.ui.generateMenuHTML(menuItems, {
    containerClass: 'my-menu',
    itemClass: 'my-menu-item',
    showPrice: true,
    showCategory: true
});
document.getElementById('menu').innerHTML = menuHTML;
```

#### `FarmChef.ui.generateAuthHTML(options)`
Generate HTML for authentication forms.

```javascript
const authHTML = FarmChef.ui.generateAuthHTML({
    containerClass: 'my-auth',
    showSignUp: true,
    showSignIn: true
});
document.getElementById('auth').innerHTML = authHTML;
```

#### `FarmChef.ui.generateDashboardHTML(options)`
Generate HTML for menu management dashboard.

```javascript
const dashboardHTML = FarmChef.ui.generateDashboardHTML({
    containerClass: 'my-dashboard'
});
document.getElementById('dashboard').innerHTML = dashboardHTML;
```

#### `FarmChef.ui.attachEventListeners(container)`
Attach event listeners to generated UI components.

```javascript
const container = document.getElementById('auth');
container.innerHTML = FarmChef.ui.generateAuthHTML();
FarmChef.ui.attachEventListeners(container);
```

### Styling

#### `FarmChef.injectCSS()`
Inject default CSS styles for all components.

```javascript
FarmChef.injectCSS();
```

#### `FarmChef.getDefaultCSS()`
Get the default CSS as a string for customization.

```javascript
const defaultCSS = FarmChef.getDefaultCSS();
// Modify and inject your own styles
```

## Examples

### Complete Menu Display with Real-time Updates

```javascript
async function setupMenu() {
    // Load initial menu
    const { data: menuItems } = await FarmChef.menu.getItems();
    const menuContainer = document.getElementById('menu');
    menuContainer.innerHTML = FarmChef.ui.generateMenuHTML(menuItems);
    
    // Subscribe to updates
    FarmChef.menu.subscribe(async () => {
        const { data: updatedItems } = await FarmChef.menu.getItems();
        menuContainer.innerHTML = FarmChef.ui.generateMenuHTML(updatedItems);
    });
}
```

### Auth-Protected Dashboard

```javascript
FarmChef.auth.onAuthStateChange((user) => {
    const dashboard = document.getElementById('dashboard');
    
    if (user) {
        dashboard.innerHTML = FarmChef.ui.generateDashboardHTML();
        FarmChef.ui.attachEventListeners(dashboard);
        dashboard.style.display = 'block';
    } else {
        dashboard.style.display = 'none';
    }
});
```

## CSS Classes

The SDK generates HTML with these CSS classes that you can style:

- `.farm-chef-menu` - Menu container
- `.farm-chef-menu-item` - Individual menu item
- `.menu-item-name` - Item name
- `.menu-item-price` - Item price
- `.menu-item-description` - Item description
- `.menu-item-category` - Item category
- `.farm-chef-auth` - Auth container
- `.farm-chef-signin-form` - Sign in form
- `.farm-chef-signup-form` - Sign up form
- `.farm-chef-dashboard` - Dashboard container

## Browser Support

- Modern browsers with ES6+ support
- Requires internet connection for Supabase backend

## Error Handling

All API methods return objects with `data` and `error` properties:

```javascript
const { data, error } = await FarmChef.menu.getItems();
if (error) {
    console.error('Error:', error.message);
} else {
    console.log('Success:', data);
}
```
