import { settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/home.js';
const app = {
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.all.pageLink);
    const idFromHash = window.location.hash.replace('#/', '');
    let pageMachinghash = thisApp.pages[0].id;
    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMachinghash = page.id;
        break;
      }
    }
    // console.log('pageMachinghash', pageMachinghash );
    thisApp.activatePage(pageMachinghash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();
        //get page id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');
        // run thisApp.activePage with that id
        thisApp.activatePage(id);
        //chane url  hash
        window.location.hash = '#/' + id;
      });
    }
  },
  activatePage: function (pageid) {
    const thisApp = this;

    //add class "active" to matchng pages, remove from non-matching
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageid);
    }

    //  if(page.id == pageid){
    //   page.classList.add(classNames.pages.active);
    //  } else {
    //   page.classList.remove(classNames.pages.active);
    //  }
    //add class "active" to matchng Links, remove from non-matching
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageid
      );
    }
  },
  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};

    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);

    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product.prepareCartProduct());
    });
  },
  initBooking: function () {
    const thisApp = this;
    const BookElem = document.querySelector(select.containerOf.booking);
    thisApp.Booking = new Booking(BookElem);
  },
  initHome: function () {
    const thisApp = this;
    const homeElem = document.querySelector(select.containerOf.home);
    // console.log(homeElem);
    thisApp.home = new Home(homeElem);
  },
  init: function () {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
    thisApp.initPages();
  },
};

app.init();
