class BasewWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctvalue = initialValue;
  }
  get value(){
    const thisWidget = this;
    return thisWidget.correctvalue;
  }
  set value(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);
    console.log(newValue);
    if (newValue != thisWidget.correctvalue && thisWidget.isValid(newValue)) {
      // newValue <= settings.amountWidget.defaultMax &&
      // newValue >= settings.amountWidget.defaultMin
      thisWidget.correctvalue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
    // thisWidget.dom.input.value = thisWidget.value;
  }
  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }
  parseValue(value) {
    return parseInt(value);
  }
  isValid(value) {
    return !isNaN(value);
  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true,
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}
export default BasewWidget;
