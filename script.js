// Current page functionality
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}
// Wishlist functionality
document.addEventListener('DOMContentLoaded', () => {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');

    favoriteButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('favorited');


            const isFavorited = button.classList.contains('favorited');
            showTooltip(button, isFavorited ? 'Added to wishlist!' : 'Removed from wishlist');
        });
    });
});

function showTooltip(button, message) {

    const tooltip = document.createElement('div');
    tooltip.className = 'wishlist-tooltip';
    tooltip.textContent = message;


    button.appendChild(tooltip);


    setTimeout(() => {
        tooltip.remove();
    }, 2000);
}


// Cart functionality
class Cart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }
    init() {
        this.setupAddToCartButtons();
        this.updateCartCount();
    }
    setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.addToCart(e.target);
            });
        });
    }
    addToCart(button) {
        const productCard = button.closest('.dealCards');
        const productTitle = productCard.querySelector('.product-title').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productDescription = productCard.querySelector('.product-description').textContent;

        const product = {
            title: productTitle,
            price: productPrice,
            description: productDescription
        };

        const existingProductIndex = this.cart.findIndex(item => item.title === product.title);
        if (existingProductIndex > -1) {
            this.cart[existingProductIndex].quantity = (this.cart[existingProductIndex].quantity || 1) + 1;
        } else {
            product.quantity = 1;
            this.cart.push(product);
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddToCartConfirmation(productTitle);
    }
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    updateCartCount() {
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            const totalItems = this.cart.reduce((total, item) => total + (item.quantity || 1), 0);
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    showAddToCartConfirmation(productTitle) {
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.textContent = `✓ Added ${productTitle} to cart!`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
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

document.addEventListener('DOMContentLoaded', function() {
    new Cart();
});



// Checkout functionality

document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();

    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            displayCartItems();
        }
    });
});

function displayCartItems() {
    const cartItems = Cart.getCart();
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartContent = document.getElementById('cart-content');

    if (cartItems.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }

    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';

    let total = 0;
    cartContainer.innerHTML = cartItems.map((item, index) => {
        const price = parseFloat(item.price.replace('$', ''));
        const itemTotal = price * (item.quantity || 1);
        total += itemTotal;

        return `
            <div class="cart-item" data-index="${index}">
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

    if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(index) {
    const cartItems = Cart.getCart();
    if (index >= 0 && index < cartItems.length) {
        cartItems.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        displayCartItems();
        showRemovalConfirmation();
        updateCartCountInHeader();
    }
}

function updateQuantity(index, change) {
    const cartItems = Cart.getCart();
    if (index >= 0 && index < cartItems.length) {
        const item = cartItems[index];
        const newQuantity = (item.quantity || 1) + change;
        if (newQuantity < 1) {
            removeFromCart(index);
            return;
        }
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cartItems));
        displayCartItems();
        updateCartCountInHeader();
    }
}

function updateCartCountInHeader() {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        const cartItems = Cart.getCart();
        const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
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
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
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
