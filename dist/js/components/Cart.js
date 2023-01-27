import {select, classNames, templates, settings} from '../settings.js';
import CartProduct  from './CartProduct.js';
import  utils from '../utils.js';
class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }
  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  initActions() {
    const thisCart = this;

    thisCart.dom.form.addEventListener('submit', (event) => {
      event.preventDefault();
      thisCart.sendOrder();
    });
    thisCart.dom.toggleTrigger.addEventListener('click', () => {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', () => {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', (event) => {
      thisCart.remove(event.detail.cartProduct);
    });
  }
  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.update();
  }
  remove(cartProduct) {
    const thisCart = this;
    const productIndex = thisCart.products.indexOf(cartProduct);

    thisCart.products.splice(productIndex, 1);
    cartProduct.dom.wrapper.remove();

    thisCart.update();
  }
  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;

    let totalNumber = 0;
    let subtotalPrice = 0;

    for (let product of thisCart.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }

    if (thisCart.products.length === 0) {
      thisCart.totalPrice = 0;
    } else {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }

    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;

    thisCart.totalNumber = totalNumber;
    thisCart.subtotalPrice = subtotalPrice;
    thisCart.deliveryFee = deliveryFee;

    for (let totalPriceElem of thisCart.dom.totalPrice) {
      totalPriceElem.innerHTML = thisCart.totalPrice;
    }
  }

  sendOrder() {
    const thisCart = this;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    const url = settings.db.url + '/' + settings.db.orders;
    fetch(url, options);

    console.log(payload);
  }
}
export default Cart;
