import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBook = this;
    thisBook.render(element);
    thisBook.initWidgets();
  }
  render(element) {
    const thisBook = this;
    const generatedHTML = templates.bookingWidget(element);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    element.appendChild(generatedDOM);

    thisBook.dom = {};
    thisBook.dom.wrapper = element;
    thisBook.dom.peopleAmount = element.querySelector(
      select.booking.peopleAmount
    );
    thisBook.dom.hoursAmount = element.querySelector(
      select.booking.hoursAmount
    );
  }
  initWidgets() {
    const thisBook = this;

    thisBook.peopleAmount = new AmountWidget(thisBook.dom.peopleAmount);
    thisBook.dom.peopleAmount.addEventListener('updated', () => {});
    thisBook.peopleAmount.setValue(thisBook.amount);

    thisBook.hoursAmount = new AmountWidget(thisBook.dom.hoursAmount);
    thisBook.dom.hoursAmount.addEventListener('updated', () => {});
    
  }
}
export default Booking;
