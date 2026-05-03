const padNumber = (number, width = 3) => {
  return String(number).padStart(width, "0");
};

const buildCode = (prefix, number, width = 3) => {
  return `${prefix}${padNumber(number, width)}`;
};

module.exports = {
  padNumber,
  buildCode
};