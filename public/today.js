let today = new Date();

module.exports = `${today.getFullYear()}-${
  today.getMonth() + 1 < 10
    ? "0" + String(today.getMonth() + 1)
    : String(today.getMonth() + 1)
}-${
  today.getDate() < 10 ? "0" + String(today.getDate()) : String(today.getDate())
}`;
