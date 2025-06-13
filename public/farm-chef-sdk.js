
(function(global) {
  'use strict';

  // SDK Configuration
  const SUPABASE_URL = 'https://genodqiyehczgiqgxekv.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlbm9kcWl5ZWhjemdpcWd4ZWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjE4NDUsImV4cCI6MjA2NDg5Nzg0NX0.DFtdiPpjtSvWBqb92IQ1catvkhOGAu0n1NEIPj4g91E';

  // Initialize Supabase client
  let supabase;

  // Load Supabase from CDN if not already loaded
  function loadSupabase() {
    return new Promise((resolve, reject) => {
      if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@supabase/supabase-js@2';
      script.onload = () => {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // FarmChef SDK Class
  class FarmChefSDK {
    constructor() {
      this.isInitialized = false;
      this.currentUser = null;
      this.authListeners = [];
    }

    // Initialize the SDK
    async init() {
      if (this.isInitialized) return;
      
      try {
        await loadSupabase();
        
        // Set up auth state listener
        supabase.auth.onAuthStateChange((event, session) => {
          this.currentUser = session?.user || null;
          this.authListeners.forEach(callback => callback(this.currentUser, event));
        });

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        this.currentUser = session?.user || null;
        
        this.isInitialized = true;
        console.log('FarmChef SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize FarmChef SDK:', error);
        throw error;
      }
    }

    // Authentication Methods
    auth = {
      // Sign up with email and password
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        return { user: data.user, error };
      },

      // Sign in with email and password
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        return { user: data.user, error };
      },

      // Sign out
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
      },

      // Get current user
      getCurrentUser: () => {
        return this.currentUser;
      },

      // Listen to auth state changes
      onAuthStateChange: (callback) => {
        this.authListeners.push(callback);
        // Return unsubscribe function
        return () => {
          const index = this.authListeners.indexOf(callback);
          if (index > -1) {
            this.authListeners.splice(index, 1);
          }
        };
      }
    };

    // Menu Management Methods
    menu = {
      // Get all menu items
      getItems: async () => {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false });
        return { data, error };
      },

      // Get all menu items (including unavailable ones) - for dashboard
      getAllItems: async () => {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false });
        return { data, error };
      },

      // Create new menu item
      createItem: async (item) => {
        const { data, error } = await supabase
          .from('menu_items')
          .insert([item])
          .select();
        return { data, error };
      },

      // Update menu item
      updateItem: async (id, updates) => {
        const { data, error } = await supabase
          .from('menu_items')
          .update(updates)
          .eq('id', id)
          .select();
        return { data, error };
      },

      // Delete menu item
      deleteItem: async (id) => {
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', id);
        return { error };
      },

      // Subscribe to real-time menu updates
      subscribe: (callback) => {
        const channel = supabase
          .channel('menu-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'menu_items'
            },
            callback
          )
          .subscribe();
        
        // Return unsubscribe function
        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    // UI Components - Generate HTML structures
    ui = {
      // Generate menu display HTML
      generateMenuHTML: (menuItems, options = {}) => {
        const {
          containerClass = 'farm-chef-menu',
          itemClass = 'farm-chef-menu-item',
          showPrice = true,
          showCategory = true
        } = options;

        const menuHTML = menuItems.map(item => `
          <div class="${itemClass}" data-id="${item.id}">
            <div class="menu-item-image">
              <img src="${item.image_url}" alt="${item.name}" />
            </div>
            <div class="menu-item-content">
              <div class="menu-item-header">
                <h3 class="menu-item-name">${item.name}</h3>
                ${showPrice ? `<span class="menu-item-price">$${item.price.toFixed(2)}</span>` : ''}
              </div>
              <p class="menu-item-description">${item.description || ''}</p>
              ${showCategory ? `<span class="menu-item-category">${item.category}</span>` : ''}
            </div>
          </div>
        `).join('');

        return `<div class="${containerClass}">${menuHTML}</div>`;
      },

      // Generate auth form HTML
      generateAuthHTML: (options = {}) => {
        const {
          containerClass = 'farm-chef-auth',
          showSignUp = true,
          showSignIn = true
        } = options;

        return `
          <div class="${containerClass}">
            ${showSignIn ? `
              <form class="farm-chef-signin-form">
                <h3>Sign In</h3>
                <input type="email" placeholder="Email" required class="signin-email" />
                <input type="password" placeholder="Password" required class="signin-password" />
                <button type="submit">Sign In</button>
              </form>
            ` : ''}
            
            ${showSignUp ? `
              <form class="farm-chef-signup-form">
                <h3>Sign Up</h3>
                <input type="email" placeholder="Email" required class="signup-email" />
                <input type="password" placeholder="Password" required class="signup-password" />
                <button type="submit">Sign Up</button>
              </form>
            ` : ''}
            
            <div class="farm-chef-user-info" style="display: none;">
              <p>Welcome, <span class="user-email"></span>!</p>
              <button class="farm-chef-signout">Sign Out</button>
            </div>
          </div>
        `;
      },

      // Generate dashboard HTML for menu management
      generateDashboardHTML: (options = {}) => {
        const {
          containerClass = 'farm-chef-dashboard'
        } = options;

        return `
          <div class="${containerClass}">
            <h2>Menu Management Dashboard</h2>
            
            <form class="farm-chef-add-item-form">
              <h3>Add New Menu Item</h3>
              <input type="text" placeholder="Item Name" required class="item-name" />
              <textarea placeholder="Description" class="item-description"></textarea>
              <input type="number" placeholder="Price" step="0.01" required class="item-price" />
              <input type="url" placeholder="Image URL" class="item-image-url" />
              <input type="text" placeholder="Category" required class="item-category" />
              <label>
                <input type="checkbox" class="item-available" checked />
                Available
              </label>
              <button type="submit">Add Item</button>
            </form>
            
            <div class="farm-chef-menu-items-list">
              <!-- Menu items will be populated here -->
            </div>
          </div>
        `;
      },

      // Attach event listeners to generated forms
      attachEventListeners: (container) => {
        const signInForm = container.querySelector('.farm-chef-signin-form');
        const signUpForm = container.querySelector('.farm-chef-signup-form');
        const signOutBtn = container.querySelector('.farm-chef-signout');
        const addItemForm = container.querySelector('.farm-chef-add-item-form');
        const userInfo = container.querySelector('.farm-chef-user-info');

        // Sign in form
        if (signInForm) {
          signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signInForm.querySelector('.signin-email').value;
            const password = signInForm.querySelector('.signin-password').value;
            
            const { user, error } = await this.auth.signIn(email, password);
            if (error) {
              alert('Sign in failed: ' + error.message);
            }
          });
        }

        // Sign up form
        if (signUpForm) {
          signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = signUpForm.querySelector('.signup-email').value;
            const password = signUpForm.querySelector('.signup-password').value;
            
            const { user, error } = await this.auth.signUp(email, password);
            if (error) {
              alert('Sign up failed: ' + error.message);
            } else {
              alert('Sign up successful! Please check your email to confirm.');
            }
          });
        }

        // Sign out button
        if (signOutBtn) {
          signOutBtn.addEventListener('click', async () => {
            await this.auth.signOut();
          });
        }

        // Add menu item form
        if (addItemForm) {
          addItemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addItemForm);
            
            const item = {
              name: addItemForm.querySelector('.item-name').value,
              description: addItemForm.querySelector('.item-description').value,
              price: parseFloat(addItemForm.querySelector('.item-price').value),
              image_url: addItemForm.querySelector('.item-image-url').value,
              category: addItemForm.querySelector('.item-category').value,
              is_available: addItemForm.querySelector('.item-available').checked
            };

            const { data, error } = await this.menu.createItem(item);
            if (error) {
              alert('Failed to add item: ' + error.message);
            } else {
              alert('Item added successfully!');
              addItemForm.reset();
            }
          });
        }

        // Auth state listener for UI updates
        this.auth.onAuthStateChange((user) => {
          const forms = container.querySelectorAll('.farm-chef-signin-form, .farm-chef-signup-form');
          const userInfo = container.querySelector('.farm-chef-user-info');
          const userEmail = container.querySelector('.user-email');

          if (user) {
            forms.forEach(form => form.style.display = 'none');
            if (userInfo) {
              userInfo.style.display = 'block';
              if (userEmail) userEmail.textContent = user.email;
            }
          } else {
            forms.forEach(form => form.style.display = 'block');
            if (userInfo) userInfo.style.display = 'none';
          }
        });
      }
    };

    // Default CSS styles
    getDefaultCSS() {
      return `
        .farm-chef-menu {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          padding: 1rem;
        }
        
        .farm-chef-menu-item {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        
        .farm-chef-menu-item:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .menu-item-image img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        
        .menu-item-content {
          padding: 1rem;
        }
        
        .menu-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .menu-item-name {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .menu-item-price {
          font-size: 1.2rem;
          font-weight: bold;
          color: #16a34a;
        }
        
        .menu-item-description {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .menu-item-category {
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
        }
        
        .farm-chef-auth {
          max-width: 400px;
          margin: 0 auto;
          padding: 1rem;
        }
        
        .farm-chef-auth form {
          margin-bottom: 1rem;
        }
        
        .farm-chef-auth h3 {
          margin-bottom: 1rem;
        }
        
        .farm-chef-auth input {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          box-sizing: border-box;
        }
        
        .farm-chef-auth button {
          width: 100%;
          padding: 0.75rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .farm-chef-auth button:hover {
          background: #2563eb;
        }
        
        .farm-chef-dashboard {
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
        }
        
        .farm-chef-add-item-form {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        
        .farm-chef-add-item-form input,
        .farm-chef-add-item-form textarea {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          box-sizing: border-box;
        }
        
        .farm-chef-add-item-form button {
          background: #16a34a;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .farm-chef-add-item-form button:hover {
          background: #15803d;
        }
      `;
    }

    // Helper method to inject default CSS
    injectCSS() {
      const existingStyle = document.getElementById('farm-chef-styles');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'farm-chef-styles';
        style.textContent = this.getDefaultCSS();
        document.head.appendChild(style);
      }
    }
  }

  // Create global instance
  const farmChef = new FarmChefSDK();

  // Expose to global scope
  global.FarmChef = farmChef;

  // Auto-initialize if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      farmChef.init().catch(console.error);
    });
  } else {
    farmChef.init().catch(console.error);
  }

})(window);
