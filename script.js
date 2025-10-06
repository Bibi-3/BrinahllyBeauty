// Sistema de Autenticação
class AuthSystem {
   constructor() {
       this.users = JSON.parse(localStorage.getItem('brinahllyUsers')) || [];
       this.currentUser = JSON.parse(localStorage.getItem('brinahllyCurrentUser')) || null;
       this.orders = JSON.parse(localStorage.getItem('brinahllyOrders')) || [];
   }


   register(userData) {
       // Verificar se usuário já existe
       const userExists = this.users.find(user =>
           user.email === userData.email || user.phone === userData.phone
       );
      
       if (userExists) {
           throw new Error('Usuário já cadastrado com este e-mail ou telefone');
       }


       // Adicionar usuário
       const newUser = {
           id: Date.now(),
           ...userData,
           createdAt: new Date().toISOString()
       };
      
       this.users.push(newUser);
       localStorage.setItem('brinahllyUsers', JSON.stringify(this.users));
      
       // Fazer login automático
       this.login(userData.email, userData.password);
      
       return newUser;
   }


   login(email, password) {
       const user = this.users.find(u => u.email === email && u.password === password);
      
       if (!user) {
           throw new Error('E-mail ou senha incorretos');
       }


       this.currentUser = user;
       localStorage.setItem('brinahllyCurrentUser', JSON.stringify(user));
      
       return user;
   }


   logout() {
       this.currentUser = null;
       localStorage.removeItem('brinahllyCurrentUser');
   }


   isLoggedIn() {
       return this.currentUser !== null;
   }


   addOrder(orderData) {
       if (!this.isLoggedIn()) {
           throw new Error('Usuário não está logado');
       }


       const order = {
           id: Date.now(),
           userId: this.currentUser.id,
           ...orderData,
           date: new Date().toISOString(),
           status: 'processing'
       };


       this.orders.push(order);
       localStorage.setItem('brinahllyOrders', JSON.stringify(this.orders));
      
       return order;
   }


   getUserOrders() {
       if (!this.isLoggedIn()) return [];
       return this.orders.filter(order => order.userId === this.currentUser.id);
   }
}


// Sistema do Carrinho
class CartSystem {
   constructor() {
       this.items = JSON.parse(localStorage.getItem('brinahllyCart')) || [];
   }


   addItem(product, quantity = 1) {
       const existingItem = this.items.find(item => item.id === product.id);
      
       if (existingItem) {
           existingItem.quantity += quantity;
       } else {
           this.items.push({
               ...product,
               quantity: quantity
           });
       }
      
       this.save();
       this.updateCartDisplay();
   }


   removeItem(productId) {
       this.items = this.items.filter(item => item.id !== productId);
       this.save();
       this.updateCartDisplay();
   }


   clear() {
       this.items = [];
       this.save();
       this.updateCartDisplay();
   }


   getTotal() {
       return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
   }


   getItemCount() {
       return this.items.reduce((count, item) => count + item.quantity, 0);
   }


   save() {
       localStorage.setItem('brinahllyCart', JSON.stringify(this.items));
   }


   updateCartDisplay() {
       const cartCount = document.querySelector('.cart-count');
       const cartItems = document.querySelector('.cart-items');
       const cartTotal = document.querySelector('.cart-total span');
      
       if (cartCount) {
           cartCount.textContent = this.getItemCount();
       }
      
       if (cartItems) {
           cartItems.innerHTML = '';
          
           if (this.items.length === 0) {
               cartItems.innerHTML = '<p class="empty-cart">Carrinho vazio</p>';
           } else {
               this.items.forEach(item => {
                   const cartItem = document.createElement('div');
                   cartItem.className = 'cart-item';
                   cartItem.innerHTML = `
                       <img src="${item.image}" alt="${item.name}">
                       <div class="cart-item-info">
                           <h5>${item.name}</h5>
                           <div class="cart-item-price">R$ ${item.price.toFixed(2)} x ${item.quantity}</div>
                       </div>
                       <button class="remove-item" data-id="${item.id}">×</button>
                   `;
                   cartItems.appendChild(cartItem);
               });
           }
       }
      
       if (cartTotal) {
           cartTotal.textContent = `Total: R$ ${this.getTotal().toFixed(2)}`;
       }
   }
}


// Inicialização dos sistemas
const authSystem = new AuthSystem();
const cartSystem = new CartSystem();


// Elementos do DOM
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const comprasModal = document.getElementById('comprasModal');
const loginLink = document.getElementById('login-link');
const cadastroLink = document.getElementById('cadastro-link');
const minhasComprasLink = document.getElementById('minhas-compras-link');
const footerMinhasCompras = document.getElementById('footer-minhas-compras');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const closeModals = document.querySelectorAll('.close-modal');
const startShoppingBtn = document.getElementById('start-shopping');


// Menu Mobile
menuToggle.addEventListener('click', () => {
   navMenu.style.display = navMenu.style.display === 'block' ? 'none' : 'block';
});


// Modal Functions
function openModal(modal) {
   modal.style.display = 'flex';
   document.body.style.overflow = 'hidden';
}


function closeModal(modal) {
   modal.style.display = 'none';
   document.body.style.overflow = 'auto';
}


function closeAllModals() {
   closeModal(loginModal);
   closeModal(registerModal);
   closeModal(comprasModal);
}


// Event Listeners for Modals
loginLink.addEventListener('click', (e) => {
   e.preventDefault();
   openModal(loginModal);
});


cadastroLink.addEventListener('click', (e) => {
   e.preventDefault();
   openModal(registerModal);
});


minhasComprasLink.addEventListener('click', (e) => {
   e.preventDefault();
   if (authSystem.isLoggedIn()) {
       showUserOrders();
       openModal(comprasModal);
   } else {
       openModal(loginModal);
       showNotification('Faça login para ver suas compras');
   }
});


footerMinhasCompras.addEventListener('click', (e) => {
   e.preventDefault();
   if (authSystem.isLoggedIn()) {
       showUserOrders();
       openModal(comprasModal);
   } else {
       openModal(loginModal);
       showNotification('Faça login para ver suas compras');
   }
});


showRegister.addEventListener('click', (e) => {
   e.preventDefault();
   closeModal(loginModal);
   openModal(registerModal);
});


showLogin.addEventListener('click', (e) => {
   e.preventDefault();
   closeModal(registerModal);
   openModal(loginModal);
});


closeModals.forEach(close => {
   close.addEventListener('click', closeAllModals);
});


startShoppingBtn.addEventListener('click', () => {
   closeModal(comprasModal);
   document.querySelector('#produtos').scrollIntoView({ behavior: 'smooth' });
});


// Close modal when clicking outside
window.addEventListener('click', (e) => {
   if (e.target === loginModal) closeModal(loginModal);
   if (e.target === registerModal) closeModal(registerModal);
   if (e.target === comprasModal) closeModal(comprasModal);
});


// Form Submissions
document.getElementById('loginForm').addEventListener('submit', (e) => {
   e.preventDefault();
   const email = document.getElementById('loginEmail').value;
   const password = document.getElementById('loginPassword').value;
  
   try {
       authSystem.login(email, password);
       showNotification('Login realizado com sucesso!');
       closeModal(loginModal);
       updateUserInterface();
   } catch (error) {
       showNotification(error.message, 'error');
   }
});


document.getElementById('registerForm').addEventListener('submit', (e) => {
   e.preventDefault();
   const name = document.getElementById('registerName').value;
   const email = document.getElementById('registerEmail').value;
   const password = document.getElementById('registerPassword').value;
   const confirmPassword = document.getElementById('registerConfirmPassword').value;
   const phone = document.getElementById('registerPhone').value;
  
   if (password !== confirmPassword) {
       showNotification('As senhas não coincidem!', 'error');
       return;
   }
  
   try {
       authSystem.register({ name, email, password, phone });
       showNotification('Cadastro realizado com sucesso!');
       closeModal(registerModal);
       updateUserInterface();
   } catch (error) {
       showNotification(error.message, 'error');
   }
});


// Social Login Buttons
document.querySelectorAll('.btn-social').forEach(button => {
   button.addEventListener('click', (e) => {
       e.preventDefault();
       const platform = button.classList[1].replace('btn-', '');
       showNotification(`Login com ${platform} - Funcionalidade em desenvolvimento`);
   });
});


// Product Actions
document.addEventListener('click', (e) => {
   // Adicionar ao carrinho
   if (e.target.classList.contains('btn-add-cart')) {
       const productCard = e.target.closest('.product-card');
       const product = {
           id: productCard.dataset.id,
           name: productCard.querySelector('h3').textContent,
           price: parseFloat(productCard.dataset.price),
           image: productCard.querySelector('img').src
       };
      
       cartSystem.addItem(product);
       showNotification(`"${product.name}" adicionado ao carrinho!`);
   }
  
   // Comprar agora
   if (e.target.classList.contains('btn-comprar')) {
       const productCard = e.target.closest('.product-card');
       const product = {
           id: productCard.dataset.id,
           name: productCard.querySelector('h3').textContent,
           price: parseFloat(productCard.dataset.price),
           image: productCard.querySelector('img').src
       };
      
       cartSystem.addItem(product);
      
       if (authSystem.isLoggedIn()) {
           // Simular finalização de compra
           try {
               authSystem.addOrder({
                   products: [product],
                   total: product.price,
                   address: 'Endereço de entrega'
               });
               cartSystem.clear();
               showNotification('Compra realizada com sucesso!');
           } catch (error) {
               showNotification(error.message, 'error');
           }
       } else {
           openModal(loginModal);
           showNotification('Faça login para finalizar a compra');
       }
   }
  
   // Remover item do carrinho
   if (e.target.classList.contains('remove-item')) {
       const productId = e.target.dataset.id;
       cartSystem.removeItem(productId);
       showNotification('Item removido do carrinho');
   }
});


// Show User Orders
function showUserOrders() {
   const emptyState = document.getElementById('empty-compras');
   const ordersList = document.getElementById('orders-list');
   const orders = authSystem.getUserOrders();
  
   if (orders.length === 0) {
       emptyState.style.display = 'block';
       ordersList.style.display = 'none';
   } else {
       emptyState.style.display = 'none';
       ordersList.style.display = 'block';
      
       ordersList.innerHTML = orders.map(order => `
           <div class="order-item">
               <div class="order-header">
                   <span class="order-number">Pedido #${order.id}</span>
                   <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                   <span class="order-status">${order.status}</span>
               </div>
               <div class="order-products">
                   ${order.products.map(product => `
                       <div class="order-product">
                           <img src="${product.image}" alt="${product.name}">
                           <div>
                               <h5>${product.name}</h5>
                               <p>R$ ${product.price.toFixed(2)}</p>
                           </div>
                       </div>
                   `).join('')}
               </div>
               <div class="order-total">
                   Total: R$ ${order.total.toFixed(2)}
               </div>
           </div>
       `).join('');
   }
}


// Update User Interface
function updateUserInterface() {
   const accountDropdown = document.querySelector('.account-dropdown .dropdown-menu');
  
   if (authSystem.isLoggedIn()) {
       if (accountDropdown) {
           accountDropdown.innerHTML = `
               <a href="#">Olá, ${authSystem.currentUser.name.split(' ')[0]}</a>
               <a href="#" id="minhas-compras-link">Minhas Compras</a>
               <a href="#" id="favoritos-link">Meus Favoritos</a>
               <a href="#" id="logout-link">Sair</a>
           `;
          
           // Re-add event listeners
           document.getElementById('minhas-compras-link').addEventListener('click', (e) => {
               e.preventDefault();
               showUserOrders();
               openModal(comprasModal);
           });
          
           document.getElementById('logout-link').addEventListener('click', (e) => {
               e.preventDefault();
               authSystem.logout();
               updateUserInterface();
               showNotification('Logout realizado com sucesso');
           });
       }
   } else {
       if (accountDropdown) {
           accountDropdown.innerHTML = `
               <a href="#" id="login-link">Login</a>
               <a href="#" id="cadastro-link">Cadastrar</a>
               <a href="#" id="minhas-compras-link">Minhas Compras</a>
               <a href="#" id="favoritos-link">Meus Favoritos</a>
           `;
       }
   }
}


// Notification System
function showNotification(message, type = 'success') {
   const notification = document.createElement('div');
   notification.className = `notification ${type}`;
   notification.innerHTML = `
       <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
       ${message}
   `;
  
   document.body.appendChild(notification);
  
   setTimeout(() => {
       notification.remove();
   }, 3000);
}


// Newsletter Form
document.querySelector('.newsletter-form').addEventListener('submit', (e) => {
   e.preventDefault();
   const email = e.target.querySelector('input[type="email"]').value;
   showNotification(`Obrigada por se cadastrar! Enviamos uma confirmação para: ${email}`);
   e.target.reset();
});


// Smooth Scroll for Anchor Links
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


// Search Functionality
const searchInput = document.querySelector('.search-box input');
searchInput.addEventListener('keypress', (e) => {
   if (e.key === 'Enter') {
       const searchTerm = searchInput.value.trim();
       if (searchTerm) {
           showNotification(`Buscando por: ${searchTerm}`);
           // Aqui você implementaria a busca real
       }
   }
});


// Initialize page
document.addEventListener('DOMContentLoaded', () => {
   // Atualizar interface do usuário
   updateUserInterface();
  
   // Atualizar carrinho
   cartSystem.updateCartDisplay();
  
   // Verificar se há parâmetros de URL para login/cadastro
   const urlParams = new URLSearchParams(window.location.search);
   if (urlParams.get('action') === 'login') {
       openModal(loginModal);
   } else if (urlParams.get('action') === 'register') {
       openModal(registerModal);
   }
  
   console.log('Brinahlly Beauty - Site carregado com sucesso!');
});