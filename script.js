// Current page functionality
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}



/////////////////////////////////////////////////////////
// Cart functionality

function showToast(message, color = '#28a745') {
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.style.background = color;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) document.body.removeChild(toast);
        }, 300);
    }, 3000);
}
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

        const detailImgs = productCard.querySelector('.detailImgs');
        const productDetailImage = detailImgs ? detailImgs.classList[1] : '';

///////////// Always read fresh from localStorage before modifying//////////////////////////
        this.cart = Cart.getCart();

        const product = {
            title: productTitle,
            price: productPrice,
            description: productDescription,
            imageClass: productImage,
            detailImageClass: productDetailImage
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
        showToast(`Added ${productTitle} to cart!`);
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
        updateWishlistCountInHeader();
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
                        <button class="add-to-cart-btn wishlist-add-to-cart" data-index="${index}">Add to Cart</button>
                        <button class="Wish-remove-btn wishlist-remove-btn" data-index="${index}">Remove</button>
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

                showToast(`✓ Added ${item.title} to cart!`);


            });
        });

        // Remove from wishlist button
        container.querySelectorAll('.wishlist-remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.wishlist.splice(index, 1);
                localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
                this.updateWishlistDisplay();
                updateWishlistCountInHeader();
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
// Cart and wishlist items counter
function updateCartCountInHeader() {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        const cartItems = Cart.getCart();
        const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}
function updateWishlistCountInHeader() {
    const wishlistBadge = document.querySelector('.wishlist-badge');
    if (wishlistBadge) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const totalItems = wishlist.length;
        wishlistBadge.textContent = totalItems;
        wishlistBadge.style.display = totalItems > 0 ? 'flex' : 'none';
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
                <div class="dealImgs detailImgs ${item.detailImageClass || item.imageClass}" style="width:100px; height:100px; border-radius:8px; flex-shrink:0;"></div>
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
    showToast('Item removed from cart!', '#dc3545');
}

// To be sorted out later.
//
// Remove comment to have confirmation before going to the checkout page again.
//
//
// Direct page nav to checkout, Alert no longer called.
//
//
//function processCheckout() {
//    const cartItems = Cart.getCart();
//    if (cartItems.length === 0) {
//        alert('Your cart is empty!');
//        return;
//    }
//    alert('Proceeding to checkout! This would integrate with your payment system.');
//}

function clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        Cart.clearCart();
        displayCartItems();
        updateCartCountInHeader();
        showRemovalConfirmation();
    }
}
function calculateTotals(cartItems) {
    let subtotal = 0;
    cartItems.forEach(item => {
        const price = parseFloat(item.price.replace('$', ''));
        subtotal += price * (item.quantity || 1);
    });
    const tax = subtotal * 0.13;
    const total = subtotal + tax;
    return { subtotal, tax, total };
}
function displayCheckoutSummary() {
    const cartItems = Cart.getCart();
    const checkoutContainer = document.getElementById('checkout-summary');
    if (!checkoutContainer) return;

    const { subtotal, tax, total } = calculateTotals(cartItems);

    checkoutContainer.innerHTML = `
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Tax (13%): $${tax.toFixed(2)}</p>
        <h4>Total: $${total.toFixed(2)}</h4>
    `;
}
/////////////////////////////////////////////////////////
// User form checkout page functionality
function formatExpiry(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length >= 2) { // automatically add a slash after the first two numbers
        input.value = input.value.substring(0, 2) + '/' + input.value.substring(2);
    }
}
function validateCardNumber(input) { // If the users chooses not to type spaces. This function stops them from typing >16 numbers.
    input.value = input.value.replace(/[^0-9 ]/g, '');
    if (input.value.replace(/\s/g, '').length > 16) {
        input.value = input.value.slice(0, -1);
    }
}


function submitCheckout() {
    const email = document.getElementById('checkout-email').value;
    const cardName = document.getElementById('card-name').value;
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;


    if (!email || !cardName || !cardNumber || !expiry || !cvv) {
        alert('Please fill in all fields.');
        return;
    }
    const cardNumberStripped = cardNumber.replace(/\s/g, ''); //Removes the spaces before counting to 16
    if (cardNumberStripped.length !== 16) {
    alert('Card number must be 16 digits.');
    return;
    }
    if (cvv.length !== 3) {
        alert('CVV must be 3 digits.');
        return;
    }
    document.getElementById('Checkout-form').style.display = 'none';
    document.getElementById('checkoutLoading').style.display = 'block';

    setTimeout(() => {
        showReceipt(email, cardName);
        document.getElementById('checkoutLoading').style.display = 'none';
        document.getElementById('Checkout-form').style.display = 'block';
    },
        2500);
}

/////////////////////////////////////////////////////////
// Receipt page functionality
function showReceipt(email, cardName) {
    const cartItems = Cart.getCart();


    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomFour = String(Math.floor(1000 + Math.random() * 9000));
    const orderNumber = `ORD-${year}${month}${day}-${randomFour}`;


    const orderDate = `${day}/${month}/${year}`;




    const { subtotal, tax, total } = calculateTotals(cartItems);

    document.getElementById('receipt-items').innerHTML = cartItems.map(item => {
        const price = parseFloat(item.price.replace('$', ''));
        const itemTotal = price * (item.quantity || 1);
        return `
            <div class="receipt-item">
                <span>${item.title} x${item.quantity || 1}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');








    document.getElementById('receipt-name').textContent = cardName;
    document.getElementById('receipt-email').textContent = email;
    document.getElementById('receipt-order-number').textContent = orderNumber;
    document.getElementById('receipt-order-date').textContent = orderDate;


    document.getElementById('receipt-totals').innerHTML =
        `<div class="receipt-item">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="receipt-item">
            <span>Tax (13%):</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="receipt-item receipt-total">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
        </div>`;

    Cart.clearCart();
    updateCartCountInHeader();
    showPage('Reciept');
}





/////////////////////////////////////////////////////////
// Games Page
const gamesData = [
    { title: "Spider-Man 2", category: "action", platform: "ps5", price: 39.99, rating: 4.8, imageClass: "img1", description: "Digital Deluxe Edition for PlayStation 5" },

    { title: "Mario Kart 8", category: "racing", platform: "switch", price: 49.99, rating: 4.7, imageClass: "img2", description: "Digital Edition" },

    { title: "Hogwarts Legacy", category: "rpg", platform:["ps5","switch", "pc"], price: 44.99, rating: 4.6, imageClass: "img3", description: "Deluxe Edition" },

    { title: "Batman: Arkham Knight", category: "adventure", platform: "xbox", price: 25.99, rating: 4.2, imageClass: "img4", description: "Premium Edition for Xbox Series X/S" },

    { title: "Super Mario Galaxy 1 & 2", category: "adventure", platform: "switch", price: 89.99, rating: 4.5, imageClass: "img5", description: "Deluxe Edition for Nintendo Switch" },

    { title: "God Of War: Ragnarok", category: "adventure", platform: "ps5", price: 120.99, rating: 4.0, imageClass: "img6", description: "Standard Edition for PlayStation 5" },

    { title: "Spider-Man: Miles Morales ", category: "action", platform: "ps5", price: 79.99, rating: 4.9, imageClass: "img7", description: "Standard Edition for PlayStation 5" },

    { title: "Minecraft: Java and Bedrock Edition", category: "adventure", platform: ["xbox","switch", "pc"], price: 39.99, rating: 5.0, imageClass: "img8", description: "Deluxe Collection" },

    { title: "Forza Horizon 6", category: "racing", platform: ["xbox", "pc"], price: 119.99, rating: null, imageClass: "img9", description: "Standard Edition for Xbox Series X/S. Available for preorder now!" },

    { title: "Halo Infinite", category: "action", platform: "xbox", price: 99.99, rating: 3.7, imageClass: "img10", description: "Standard Edition" },
];
let currentView = 'grid';
function applyFilters() {
    const search = document.getElementById('searchBar').value.toLowerCase();
    const category = document.getElementById('gameTypes').value;
    const platform = document.getElementById('gamePlatforms').value;
    const price = document.getElementById('prices').value;

    document.querySelectorAll('#Games .dealCards').forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        const cardCategory = card.dataset.category;
        const cardPlatform = card.dataset.platform;
        const cardPrice = parseFloat(card.querySelector('.product-price').textContent.replace('$', ''));

        const matchesSearch = title.includes(search);
        const matchesCategory = category === 'all' || cardCategory === category;
        const matchesPlatform = platform === 'all' || cardPlatform.includes(platform);

        let matchesPrice = true;
        if (price === '0-20') matchesPrice = cardPrice <= 20;
        else if (price === '20-40') matchesPrice = cardPrice > 20 && cardPrice <= 40;
        else if (price === '40-60') matchesPrice = cardPrice > 40 && cardPrice <= 60;
        else if (price === '60+') matchesPrice = cardPrice > 60;

        const visible = matchesSearch && matchesCategory && matchesPlatform && matchesPrice;
        card.style.display = visible ? (currentView === 'list' ? 'flex' : '') : 'none';
    });
}
function resetFilters() {
    document.getElementById('searchBar').value = '';
    document.getElementById('gameTypes').value = 'all';
    document.getElementById('gamePlatforms').value = 'all';
    document.getElementById('prices').value = 'all';
    document.querySelectorAll('#Games .dealCards').forEach(card => {
        card.style.display = currentView === 'list' ? 'flex' : '';
    });
}
function toggleView() {
    const container = document.querySelector('#Games .grid-view, #Games .list-view');
    const toggleBtn = document.getElementById('view-toggle');

    if (currentView === 'grid') {
        currentView = 'list';
        container.classList.remove('grid-view');
        container.classList.add('list-view');
        toggleBtn.textContent = 'Grid View';
    } else {
        currentView = 'grid';
        container.classList.remove('list-view');
        container.classList.add('grid-view');
        toggleBtn.textContent = 'List View';
    }


    document.querySelectorAll('#Games .dealCards').forEach(card => {
        if (card.style.display !== 'none') {
            card.style.display = '';
        }
    });
}




/////////////////////////////////////////////////////////
// Home
function showGameDetail(title) {
    const game = gamesData.find(g => g.title === title);
    if (!game) return;

    document.getElementById('detail-title').textContent = game.title;
    document.getElementById('detail-description').textContent = game.description;
    document.getElementById('detail-price').textContent = `$${game.price}`;
    document.getElementById('detail-image').className = `dealImgs ${game.imageClass}`;
    showPage('Details');
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
    document.getElementById('searchBar').addEventListener('input', applyFilters);
        renderGames(gamesData);

    displayCartItems();
    updateCartCountInHeader();

    window.addEventListener('storage', function (e) {
        if (e.key === 'cart') {
            displayCartItems();
            updateCartCountInHeader();
            updateWishlistCountInHeader();
        }
    });
});
