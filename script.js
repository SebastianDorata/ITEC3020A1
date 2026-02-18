// Current page functionality
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

/////////////////////////////////////////////////////////
// Cart functionality
class Cart {
    constructor() {
        this.cart = Cart.getCart();
    }

    addToCart(button) {
        const productCard = button.closest('.dealCards');
        if (!productCard) return;

        const productTitle = productCard.querySelector('.product-title').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productDescription = productCard.querySelector('.product-description').textContent;
        const dealImgs = productCard.querySelector('.dealImgs');
        const productImage = dealImgs ? dealImgs.classList[1] : '';

        // Always read fresh from localStorage before modifying
        this.cart = Cart.getCart();

        const product = {
            title: productTitle,
            price: productPrice,
            description: productDescription,
            imageClass: productImage
        };

        const existingIndex = this.cart.findIndex(item => item.title === product.title);
        if (existingIndex > -1) {
            this.cart[existingIndex].quantity = (this.cart[existingIndex].quantity || 1) + 1;
        } else {
            product.quantity = 1;
            this.cart.push(product);
        }

        this.saveCart();
        updateCartCountInHeader();
        displayCartItems();
        this.showAddToCartConfirmation(productTitle);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    showAddToCartConfirmation(productTitle) {
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.textContent = `✓ Added ${productTitle} to cart!`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    static getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    static clearCart() {
        localStorage.removeItem('cart');
    }
}

/////////////////////////////////////////////////////////
// Wishlist functionality
class Wishlist {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.setupFavoriteButtons();
        this.updateWishlistDisplay();
    }

    setupFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.toggleWishlist(e.currentTarget);
            });
        });
    }

    toggleWishlist(button) {
        const productCard = button.closest('.dealCards');
        if (!productCard) return;

        const productTitle = productCard.querySelector('.product-title').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const descEl = productCard.querySelector('.product-description');
        const productDescription = descEl ? descEl.textContent : '';
        const dealImgs = productCard.querySelector('.dealImgs');
        const productImage = dealImgs ? dealImgs.classList[1] : '';

        const product = {
            title: productTitle,
            price: productPrice,
            description: productDescription,
            imageClass: productImage
        };

        const existingIndex = this.wishlist.findIndex(item => item.title === product.title);
        if (existingIndex > -1) {
            this.wishlist.splice(existingIndex, 1);
            button.classList.remove('favorited');
            showTooltip(button, 'Removed from wishlist');
        } else {
            this.wishlist.push(product);
            button.classList.add('favorited');
            showTooltip(button, 'Added to wishlist!');
        }

        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        this.updateWishlistDisplay();
    }

    updateWishlistDisplay() {
        const container = document.getElementById('wishlist-items');
        if (!container) return;

        if (this.wishlist.length === 0) {
            container.innerHTML = '<p>No items in your wishlist yet!</p>';
            return;
        }

        container.innerHTML = this.wishlist.map((item, index) => `
            <div class="dealCards">
                <div class="dealImgs ${item.imageClass}"></div>
                <div class="product-info">
                    <h5 class="product-title">${item.title}</h5>
                    <p class="product-description">${item.description}</p>
                    <div class="product-footer">
                        <span class="product-price">${item.price}</span>
                        <button class="btn btn-primary wishlist-add-to-cart" data-index="${index}">Add to Cart</button>
                        <button class="btn btn-danger wishlist-remove-btn" data-index="${index}">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add to cart from wishlist button
        container.querySelectorAll('.wishlist-add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                const item = this.wishlist[index];
                const cart = Cart.getCart();
                const existingIndex = cart.findIndex(c => c.title === item.title);
                if (existingIndex > -1) {
                    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
                } else {
                    cart.push({ ...item, quantity: 1 });
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCountInHeader();
                displayCartItems();
                const toast = document.createElement('div');
                toast.className = 'cart-toast';
                toast.textContent = `✓ Added ${item.title} to cart!`;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => { if (toast.parentNode) document.body.removeChild(toast); }, 300);
                }, 3000);
            });
        });

        // Remove from wishlist button
        container.querySelectorAll('.wishlist-remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.wishlist.splice(index, 1);
                localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
                this.updateWishlistDisplay();
            });
        });
    }
}

function showTooltip(button, message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'wishlist-tooltip';
    tooltip.textContent = message;
    button.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 2000);
}

/////////////////////////////////////////////////////////
// Cart items counter
function updateCartCountInHeader() {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        const cartItems = Cart.getCart();
        const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

/////////////////////////////////////////////////////////
// Cart display
function displayCartItems() {
    const cartItems = Cart.getCart();
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const subtotalElement = document.getElementById('cart-subtotal');
    const taxElement = document.getElementById('cart-tax');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartContent = document.getElementById('cart-content');

    if (!cartContainer) return;

    if (cartItems.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        updateCartCountInHeader();
        return;
    }

    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';

    let subtotal = 0;
    cartContainer.innerHTML = cartItems.map((item, index) => {
        const price = parseFloat(item.price.replace('$', ''));
        const itemTotal = price * (item.quantity || 1);
        subtotal += itemTotal;

        return `
            <div class="cart-item" data-index="${index}">
                <div class="dealImgs ${item.imageClass}" style="width:100px; height:100px; border-radius:8px; flex-shrink:0;"></div>
                <div class="cart-item-content">
                    <h6>${item.title}</h6>
                    <p>${item.description}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="quantity">${item.quantity || 1}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="price">$${itemTotal.toFixed(2)}</div>
                    <button class="delete-btn" onclick="removeFromCart(${index})" title="Remove item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(index) {
    const cartItems = Cart.getCart();
    if (index >= 0 && index < cartItems.length) {
        cartItems.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        displayCartItems();
        updateCartCountInHeader();
        showRemovalConfirmation();
    }
}

function updateQuantity(index, change) {
    const cartItems = Cart.getCart();
    if (index >= 0 && index < cartItems.length) {
        const newQuantity = (cartItems[index].quantity || 1) + change;
        if (newQuantity < 1) {
            removeFromCart(index);
            return;
        }
        cartItems[index].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cartItems));
        displayCartItems();
        updateCartCountInHeader();
    }
}

function showRemovalConfirmation() {
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.style.background = '#dc3545';
    toast.textContent = '✓ Item removed from cart!';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function processCheckout() {
    const cartItems = Cart.getCart();
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    alert('Proceeding to checkout! This would integrate with your payment system.');
}

function clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        Cart.clearCart();
        displayCartItems();
        updateCartCountInHeader();
        showRemovalConfirmation();
    }
}

/////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
    window.cartInstance = new Cart();
    window.wishlistInstance = new Wishlist();

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            cartInstance.addToCart(e.target);
        });
    });

    displayCartItems();
    updateCartCountInHeader();

    window.addEventListener('storage', function (e) {
        if (e.key === 'cart') {
            displayCartItems();
            updateCartCountInHeader();
        }
    });
});
