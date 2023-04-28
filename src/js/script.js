import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';
// Отримання списку продуктів з бекенду
const fetchProducts = async () => {
  try {
    const response = await axios.get(
      'https://ukd-online-store-basket-backend.onrender.com/api/products/'
    );
    const products = response.data;

    // Додавання кожного продукту у список на сторінці
    const productList = document.getElementById('product-list');
    products.forEach(product => {
      const li = document.createElement('li');
      li.innerHTML = `
      <div class="img__container">
        <img src="${product.image_url}" width="200" alt="${product.name}">
        </div>
        <h3>${product.name}</h3>
        <p>${product.price}$</p>
        <p>${product.description}</p>
        <button  class="add-to-cart" data-_id="${product._id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image_url}">Add to Cart</button>
      `;
      productList.appendChild(li);
    });
  } catch (error) {
    console.error(error);
  }
};

// Отримання списку елементів корзини з localStorage і виведення їх на сторінку
const renderCartItems = () => {
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemList = document.getElementById('cart-items');
  cartItemList.innerHTML = '';
  let total = 0;
  cartItems.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="img__container">
        <img src="${item.image}" width="200" alt="${item.name}">
        </div>
      <span class="item__name">${item.name}</span>
      <span class='input__container'>
        <button class="decrement-quantity" data-_id="${item._id}">-</button>
        <span class="item-quantity" value="${item.quantity}">${item.quantity}</span>
        <button class="increment-quantity" data-_id="${item._id}">+</button>
      </span>
       <div class="price__container">
      <span>${item.price * item.quantity}$</span>
      <button class="remove-from-cart" data-_id="${item._id}">Remove</button>
         </div>
    `;
    cartItemList.appendChild(li);
    total += item.price * item.quantity; // помножимо ціну на кількість
  });
  document.getElementById('cart-total').textContent = total.toFixed(2);

  // Додамо обробник кліку для кнопок "plus" та "minus"
  const incrementButtons = document.querySelectorAll('.increment-quantity');
  incrementButtons.forEach(button => {
    button.addEventListener('click', event => {
      const itemId = event.target.dataset._id;
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const item = cartItems.find(item => item._id === itemId);
      item.quantity += 1;
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      renderCartItems();
    });
  });

  const decrementButtons = document.querySelectorAll('.decrement-quantity');
  decrementButtons.forEach(button => {
    button.addEventListener('click', event => {
      const itemId = event.target.dataset._id;
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const item = cartItems.find(item => item._id === itemId);
      item.quantity -= 1;
      if (item.quantity <= 0) {
        const newCartItems = cartItems.filter(item => item._id !== itemId);
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      } else {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      }
      renderCartItems();
    });
  });

  // Додамо обробник події для полів кількості
  const quantityInputs = document.querySelectorAll('.item-quantity');
  quantityInputs.forEach(input => {
    input.addEventListener('change', event => {
      const itemId = event.target.parentNode.querySelector('.increment-quantity').dataset.id;
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const item = cartItems.find(item => item._id === itemId);
      const newQuantity = parseInt(event.target.value);
      item.quantity = newQuantity;
      if (newQuantity <= 0) {
        const newCartItems = cartItems.filter(item => item._id !== itemId);
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      } else {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      }
      renderCartItems();
    });
  });
};

// Додавання продукту до корзини після натискання на кнопку "Add to Cart"
document.addEventListener('click', event => {
  if (event.target.classList.contains('add-to-cart')) {
    Notify.success('Операція Успішна!', {
      position: 'center-top',
      timeout: 5000,
    });
    const itemId = event.target.dataset._id;
    const itemName = event.target.dataset.name;
    const itemPrice = parseFloat(event.target.dataset.price);
    const itemImage = event.target.dataset.image;
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let existingItem = cartItems.find(item => item._id === itemId);

    if (existingItem) {
      // якщо товар вже є у корзині
      existingItem.quantity += 1; // збільшимо кількість на 1
    } else {
      // якщо це новий товар
      existingItem = {
        _id: itemId,
        name: itemName,
        price: itemPrice,
        quantity: 1, // початкова кількість - 1
        image: itemImage,
      };

      cartItems.push(existingItem); // додамо у корзину
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    renderCartItems();
  }
});

// Видалення елементу з корзини після натискання на кнопку "Remove"
document.addEventListener('click', event => {
  if (event.target.classList.contains('remove-from-cart')) {
    const itemId = event.target.dataset._id;
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const newCartItems = cartItems.filter(item => item._id !== itemId);

    localStorage.setItem('cartItems', JSON.stringify(newCartItems));

    renderCartItems();
  }
});

fetchProducts();
renderCartItems();
// Відкриття/закриття модального вікна з корзиною
const cartModal = document.querySelector('#cart-modal');
const openCartButton = document.querySelector('#open-cart-button');

function closeCartModal() {
  cartModal.style.display = 'none';
  openCartButton.id = 'open-cart-button';
  const closeButton = document.querySelector('#close-modal-button');
  if (closeButton) {
    closeButton.removeEventListener('click', closeCartModal);
  }
}

function handleClickOutsideModal(event) {
  if (event.target === cartModal) {
    closeCartModal();
    document.removeEventListener('click', handleClickOutsideModal);
  }
}

openCartButton.addEventListener('click', () => {
  if (cartModal.style.display === 'none' || cartModal.style.display === '') {
    cartModal.style.display = 'block';
    openCartButton.id = 'close-cart-button';

    const closeButton = document.createElement('button');
    closeButton.setAttribute('id', 'close-modal-button');
    closeButton.innerHTML = 'Close';
    closeButton.addEventListener('click', closeCartModal);
    document.addEventListener('click', handleClickOutsideModal);
  } else {
    closeCartModal();
  }
});
