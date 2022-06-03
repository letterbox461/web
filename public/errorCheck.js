module.exports = (arg) => {
  if (
    !JSON.stringify(arg).includes("undefined") &&
    !JSON.stringify(arg).includes("NaN")
  ) {
    return true;
  } else {
    return false;
  }
};
