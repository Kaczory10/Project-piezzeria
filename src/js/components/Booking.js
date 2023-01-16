import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
    thisBook.dom.datePicker = element.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBook.dom.hourPicker = element.querySelector(
      select.widgets.hourPicker.wrapper
    );
  }
  initWidgets() {
    const thisBook = this;

    thisBook.peopleAmount = new AmountWidget(thisBook.dom.peopleAmount);
    thisBook.dom.peopleAmount.addEventListener('updated', () => {});
    thisBook.peopleAmount.setValue(thisBook.amount);

    thisBook.hoursAmount = new AmountWidget(thisBook.dom.hoursAmount);
    thisBook.dom.hoursAmount.addEventListener('updated', () => {});
    
    thisBook.datePicker = new DatePicker(thisBook.dom.datePicker);
    thisBook.dom.datePicker.addEventListener('updated', () => {});

    thisBook.hourPicker = new HourPicker(thisBook.dom.hourPicker);
    thisBook.dom.hourPicker.addEventListener('updated', () => {});

  }
}
export default Booking;
