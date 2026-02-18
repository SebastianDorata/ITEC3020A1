function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

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
