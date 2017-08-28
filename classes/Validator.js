class Validator {
  static isNumeric(value) {
    return value ? !!value.toString().match(/^\d+$/) : false;
  }
  static isAlphabetic(value) {
    return value ? !!value.toString().match(/^[a-zA-Z]+$/) : false;
  }
}
module.exports = Validator;
