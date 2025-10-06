// Sistema completo da Brinahlly Beauty
class BrinahllyBeauty {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('brinahllyUsers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('brinahllyCurrentUser')) || null;
        this.products = this.initializeProducts();
        this.cart = JSON.parse(localStorage.getItem('brinahllyCart')) || [];
        this.orders = JSON.parse(localStorage.getItem('brinahllyOrders')) || [];
        this.init();
    }

    initializeProducts() {
        return [
            {
                id: 1,
                name: "Flor de Cerejeira",
                description: "Fragrância suave e floral com notas de cerejeira e jasmim",
                price: 49.90,
                oldPrice: 59.90,
                category: "body-splash",
                badge: "LANÇAMENTO",
            },
            {
                id: 2,
                name: "Brisa Tropical",
                description: "Notas refrescantes de coco e abacaxi com um toque exótico",
                price: 54.90,
                category: "body-splash",
                badge: "LANÇAMENTO",
            },
            {
                id: 3,
                name: "Vanilla Dream",
                description: "Doce e aconchegante, com notas cremosas de baunilha e âmbar",
                price: 52.90,
                oldPrice: 59.90,
                category: "body-splash",
                badge: "FICTÍCIO",
            },
            {
                id: 4,
                name: "Lavanda Serena",
                description: "Acalmante e relaxante, com essência pura de lavanda francesa",
                price: 47.90,
                category: "body-splash",
                badge: "fICTÍCIO",
            },
        ];
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
        this.updateCartDisplay();
        this.updateUserInterface();
        this.setupMobileMenu();
        this.setupSmoothScroll();
    }

    setupEventListeners() {
        // Navegação
        document.getElementById('explorarBtn')?.addEventListener('click', () => {
            this.scrollToSection('produtos');
        });

        document.getElementById('ofertaBtn')?.addEventListener('click', () => {
            this.handleSpecialOffer();
        });

        // Modal handlers
        this.setupModalHandlers();
        
        // Forms
        this.setupFormHandlers();
        
        // Carrinho
        this.setupCartHandlers();
        
        // Categorias
        this.setupCategoryHandlers();

        // Busca
        this.setupSearchHandler();
    }

    setupModalHandlers() {
        // Login Modal
        document.getElementById('login-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('loginModal');
        });

        // Cadastro Modal
        document.getElementById('cadastro-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('registerModal');
        });

        // Minhas Compras
        document.getElementById('minhas-compras-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentUser) {
                this.showUserOrders();
            } else {
                this.showModal('loginModal');
                this.showNotification('Faça login para ver suas compras', 'warning');
            }
        });

        document.getElementById('footerPedidos')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentUser) {
                this.showUserOrders();
            } else {
                this.showModal('loginModal');
                this.showNotification('Faça login para ver suas compras', 'warning');
            }
        });

        // Switch between modals
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(close => {
            close.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    setupFormHandlers() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Newsletter
        document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewsletter();
        });

        // Social login
        document.getElementById('googleLogin')?.addEventListener('click', () => {
            this.handleSocialLogin('google');
        });

        document.getElementById('facebookLogin')?.addEventListener('click', () => {
            this.handleSocialLogin('facebook');
        });
    }

    setupCartHandlers() {
        // Finalizar compra
        document.getElementById('finalizarCompraBtn')?.addEventListener('click', () => {
            this.handleCheckout();
        });

        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            this.handleCheckout();
        });
    }

    setupCategoryHandlers() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.filterProductsByCategory(category);
            });
        });
    }

    setupSearchHandler() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm.length > 2) {
                    this.handleSearch(searchTerm);
                } else if (searchTerm.length === 0) {
                    this.loadProducts();
                }
            });
        }
    }

    setupMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking on links
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Product Management
    loadProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        productsGrid.innerHTML = this.products.map(product => `
            <div class="product-card" data-id="${product.id}">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <div class="product-image">
                    ${product.icon}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">
                        <span class="current-price">R$ ${product.price.toFixed(2)}</span>
                        ${product.oldPrice ? `<span class="old-price">R$ ${product.oldPrice.toFixed(2)}</span>` : ''}
                        <span class="installment">ou 3x de R$ ${(product.price / 3).toFixed(2)}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-comprar" data-id="${product.id}">Comprar Agora</button>
                        <button class="btn-add-cart" data-id="${product.id}">Adicionar à Sacola</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.reattachProductEventListeners();
    }

    filterProductsByCategory(category) {
        const filteredProducts = category === 'all' 
            ? this.products 
            : this.products.filter(product => product.category === category);
        
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <div class="product-image">
                    ${product.icon}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">
                        <span class="current-price">R$ ${product.price.toFixed(2)}</span>
                        ${product.oldPrice ? `<span class="old-price">R$ ${product.oldPrice.toFixed(2)}</span>` : ''}
                        <span class="installment">ou 3x de R$ ${(product.price / 3).toFixed(2)}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-comprar" data-id="${product.id}">Comprar Agora</button>
                        <button class="btn-add-cart" data-id="${product.id}">Adicionar à Sacola</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.reattachProductEventListeners();
        this.scrollToSection('produtos');
        this.showNotification(`Mostrando produtos da categoria: ${this.getCategoryName(category)}`, 'success');
    }

    handleSearch(searchTerm) {
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );

        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-results">
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente buscar com outros termos</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <div class="product-image">
                    ${product.icon}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">
                        <span class="current-price">R$ ${product.price.toFixed(2)}</span>
                        ${product.oldPrice ? `<span class="old-price">R$ ${product.oldPrice.toFixed(2)}</span>` : ''}
                        <span class="installment">ou 3x de R$ ${(product.price / 3).toFixed(2)}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-comprar" data-id="${product.id}">Comprar Agora</button>
                        <button class="btn-add-cart" data-id="${product.id}">Adicionar à Sacola</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.reattachProductEventListeners();
    }

    getCategoryName(category) {
        const categories = {
            'body-splash': 'Body Splash',
            'perfumes': 'Perfumes',
            'kits': 'Kits Presente',
            'lancamentos': 'Lançamentos'
        };
        return categories[category] || category;
    }

    reattachProductEventListeners() {
        document.querySelectorAll('.btn-comprar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                this.handleBuyNow(productId);
            });
        });

        document.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                this.addToCart(productId);
            });
        });
    }

    // Cart Management
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification(`${product.name} adicionado ao carrinho!`, 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Produto removido do carrinho', 'success');
    }

    updateQuantity(productId, action) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
        }

        this.saveCart();
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const cartItemsModal = document.getElementById('cartItemsModal');
        const cartTotalModal = document.getElementById('cartTotalModal');

        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;

        // Update cart total
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) cartTotal.textContent = total.toFixed(2);
        if (cartTotalModal) cartTotalModal.textContent = total.toFixed(2);

        // Update cart items preview
        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Carrinho vazio</p>';
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">${item.icon}</div>
                        <div class="cart-item-info">
                            <h5>${item.name}</h5>
                            <div class="cart-item-price">R$ ${item.price.toFixed(2)} x ${item.quantity}</div>
                        </div>
                        <button class="remove-item" data-id="${item.id}">×</button>
                    </div>
                `).join('');

                // Add event listeners to remove buttons
                cartItems.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const productId = parseInt(e.target.dataset.id);
                        this.removeFromCart(productId);
                    });
                });
            }
        }

        // Update cart modal
        if (cartItemsModal) {
            if (this.cart.length === 0) {
                cartItemsModal.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
            } else {
                cartItemsModal.innerHTML = this.cart.map(item => `
                    <div class="cart-item-modal">
                        <div class="cart-item-image">${item.icon}</div>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}">🗑️</button>
                    </div>
                `).join('');

                // Add event listeners
                cartItemsModal.querySelectorAll('.quantity-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const productId = parseInt(e.target.dataset.id);
                        const action = e.target.dataset.action;
                        this.updateQuantity(productId, action);
                    });
                });

                cartItemsModal.querySelectorAll('.remove-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const productId = parseInt(e.target.dataset.id);
                        this.removeFromCart(productId);
                    });
                });
            }
        }
    }

    saveCart() {
        localStorage.setItem('brinahllyCart', JSON.stringify(this.cart));
    }

    // User Management
    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Preencha todos os campos', 'error');
            return;
        }

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('brinahllyCurrentUser', JSON.stringify(user));
            this.hideModal('loginModal');
            this.updateUserInterface();
            this.showNotification(`Bem-vinda de volta, ${user.name}!`, 'success');
        } else {
            this.showNotification('E-mail ou senha incorretos', 'error');
        }
    }

    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const phone = document.getElementById('registerPhone').value;

        if (!name || !email || !password || !confirmPassword || !phone) {
            this.showNotification('Preencha todos os campos', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('As senhas não coincidem', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showNotification('Este e-mail já está cadastrado', 'error');
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            phone,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('brinahllyUsers', JSON.stringify(this.users));

        this.currentUser = newUser;
        localStorage.setItem('brinahllyCurrentUser', JSON.stringify(newUser));

        this.hideModal('registerModal');
        this.updateUserInterface();
        this.showNotification(`Conta criada com sucesso, ${name}!`, 'success');
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('brinahllyCurrentUser');
        this.updateUserInterface();
        this.showNotification('Logout realizado com sucesso', 'success');
    }

    handleSocialLogin(platform) {
        this.showNotification(`Login com ${platform} - Em desenvolvimento`, 'warning');
    }

    updateUserInterface() {
        const userName = document.getElementById('userName');
        const logoutLink = document.getElementById('logout-link');
        const accountDropdown = document.querySelector('.account-dropdown .dropdown-menu');

        if (this.currentUser) {
            if (userName) userName.textContent = this.currentUser.name.split(' ')[0];
            if (logoutLink) logoutLink.style.display = 'block';
            
            if (accountDropdown) {
                accountDropdown.innerHTML = `
                    <a href="#">Olá, ${this.currentUser.name.split(' ')[0]}</a>
                    <a href="#" id="minhas-compras-link">Minhas Compras</a>
                    <a href="#" id="favoritos-link">Meus Favoritos</a>
                    <a href="#" id="logout-link">Sair</a>
                `;

                // Re-add event listeners
                document.getElementById('logout-link')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }
        } else {
            if (userName) userName.textContent = '';
            if (logoutLink) logoutLink.style.display = 'none';
            
            if (accountDropdown) {
                accountDropdown.innerHTML = `
                    <a href="#" id="login-link">Login</a>
                    <a href="#" id="cadastro-link">Cadastrar</a>
                    <a href="#" id="minhas-compras-link">Minhas Compras</a>
                    <a href="#" id="favoritos-link">Meus Favoritos</a>
                `;

                // Re-add event listeners
                document.getElementById('login-link')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showModal('loginModal');
                });

                document.getElementById('cadastro-link')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showModal('registerModal');
                });
            }
        }
    }

    // Order Management
    handleBuyNow(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (!this.currentUser) {
            this.showModal('loginModal');
            this.showNotification('Faça login para finalizar a compra', 'warning');
            return;
        }

        // Add to cart and checkout immediately
        this.addToCart(productId);
        this.showModal('cartModal');
    }

    handleCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Seu carrinho está vazio', 'warning');
            return;
        }

        if (!this.currentUser) {
            this.showModal('loginModal');
            this.showNotification('Faça login para finalizar a compra', 'warning');
            return;
        }

        const order = {
            id: Date.now(),
            userId: this.currentUser.id,
            products: [...this.cart],
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            date: new Date().toISOString(),
            status: 'processing'
        };

        this.orders.push(order);
        localStorage.setItem('brinahllyOrders', JSON.stringify(this.orders));

        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();

        this.hideModal('cartModal');
        this.showNotification('Compra realizada com sucesso! 🎉', 'success');
    }

    showUserOrders() {
        const userOrders = this.orders.filter(order => order.userId === this.currentUser.id);
        
        if (userOrders.length === 0) {
            this.showNotification('Você ainda não realizou nenhuma compra', 'warning');
        } else {
            this.showNotification(`Você tem ${userOrders.length} pedido(s) realizados!`, 'success');
        }
    }

    // Special Offers
    handleSpecialOffer() {
        if (!this.currentUser) {
            this.showModal('loginModal');
            this.showNotification('Faça login para aproveitar a oferta', 'warning');
            return;
        }

        // Adiciona o kit especial ao carrinho
        const specialProduct = {
            id: 999,
            name: "Kit Leve 3 Pague 2",
            description: "Kit especial com 3 fragrâncias mais amadas",
            price: 119.90,
            icon: "🎁"
        };

        this.cart.push({
            ...specialProduct,
            quantity: 1
        });

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Kit especial adicionado ao carrinho! 🎉', 'success');
    }

    // Newsletter
    handleNewsletter() {
        const email = document.getElementById('newsletterEmail').value;
        if (!email) {
            this.showNotification('Digite seu e-mail', 'warning');
            return;
        }

        this.showNotification(`Obrigada por se cadastrar! Enviaremos novidades para: ${email}`, 'success');
        document.getElementById('newsletterForm').reset();
    }

    // Utility Methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    showNotification(message, type = 'success') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for notifications if not present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 5px;
                z-index: 3000;
                animation: slideIn 0.3s ease;
                display: none;
                align-items: center;
                gap: 10px;
                max-width: 300px;
                font-weight: 500;
            }
            .notification.success {
                background: #28a745;
                color: white;
            }
            .notification.error {
                background: #dc3545;
                color: white;
            }
            .notification.warning {
                background: #ffc107;
                color: #333;
            }
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .no-results {
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }

    window.brinahllyApp = new BrinahllyBeauty();
    console.log('Brinahlly Beauty - Site totalmente funcional! 🚀');
});