import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBook = this;
    thisBook.render(element);
    thisBook.initWidgets();
    thisBook.initTables();
    thisBook.initForm();
    thisBook.getData();
  }
  getData() {
    const thisBook = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBook.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBook.datePicker.maxDate);
    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };
    console.log('getData params', params);
    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.booking +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsRepeat.join('&'),
    };
    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
        thisBook.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBook = this;
    thisBook.booked = {};
    console.log(thisBook.booked);
    for (let item of bookings) {
      thisBook.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBook.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBook.datePicker.minDate;
    const maxDate = thisBook.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBook.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    console.log('thisBook', thisBook.booked);
    thisBook.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBook = this;
    
    if (typeof thisBook.booked[date] == 'undefined') {
      thisBook.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBook.booked[date][hourBlock] == 'undefined') {
        thisBook.booked[date][hourBlock] = [];
      }

      thisBook.booked[date][startHour].push(table);
    }
  }
  updateDOM() {
    const thisBook = this;
    thisBook.date = thisBook.datePicker.value;
    thisBook.hour = utils.hourToNumber(thisBook.hourPicker.value);
    let allAvailable = false;
    if (
      typeof thisBook.booked[thisBook.date] == 'undefined' ||
      typeof thisBook.booked[thisBook.date][thisBook.hour] == 'undefined'
    ) {
      allAvailable = true;
    }
    for (let table of thisBook.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvailable &&
        thisBook.booked[thisBook.date][thisBook.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

      table.classList.remove(classNames.booking.tableSelected);
    }
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
    thisBook.dom.tables = element.querySelectorAll(
      select.booking.tables
    );
    thisBook.dom.address = element.querySelector(
      select.booking.address
    );
    thisBook.dom.phone = element.querySelector(
      select.booking.phone
    );
    thisBook.dom.form = element.querySelector(
      select.booking.form
    );
    thisBook.dom.water = element.querySelector(
      select.booking.water
    );
    thisBook.dom.bread = element.querySelector(
      select.booking.bread
    );
  }
  initTables(){
    const thisBook = this;

    for (const table of thisBook.dom.tables) {
      table.addEventListener('click', function() {

        for (const _table of thisBook.dom.tables) {
          if (_table === table) {
            _table.classList.toggle(classNames.booking.tableSelected);
          } else {
            _table.classList.remove(classNames.booking.tableSelected);
          }
        }
      });
    }
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

    thisBook.dom.wrapper.addEventListener('updated', function () {
      thisBook.updateDOM();
    });
  }
  sendBooking() {
    const thisBook = this;
    const selectedTable = thisBook.dom.wrapper.querySelector(select.booking.tableSelected);
    let selectedTableId = null;

    if (selectedTable) {
      selectedTableId = parseInt(selectedTable.getAttribute(settings.booking.tableIdAttribute));
    }

    const starters = [];

    if (thisBook.dom.water.checked) {
      starters.push('water');
    }

    if (thisBook.dom.bread.checked) {
      starters.push('bread');
    }

    const payload = {
      date: thisBook.datePicker.value,
      // data wybrana w datePickerze
      hour:  thisBook.hourPicker.value,
      // godzina wybrana w hourPickerze (w formacie HH:ss)
      table: selectedTableId,
      // numer wybranego stolika (lub null jeśli nic nie wybrano)
      duration: this.hoursAmount.value,
      ppl: thisBook.peopleAmount.value,
      starters: starters,
      phone: thisBook.dom.phone.value,
      address: thisBook.dom.address.value,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    const url = settings.db.url + '/' + settings.db.booking;
    fetch(url, options).then(function(response) {
      return response.json();
    }).then(function(booking) {
      thisBook.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    });

    console.log(payload);
  }

  initForm() {
    const thisBooking = this;

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();

      thisBooking.sendBooking();
    });
  }
}


export default Booking;
