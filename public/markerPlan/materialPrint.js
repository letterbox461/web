const fs = require("fs");
const json2xls = require("json2xls");
const { materialPrintQuery } = require("../../routes/queries/MarkerPlan");
let sql = require("@frangiskos/mssql").sql;

const convert = (data) => {
  const xls = json2xls(data);
  const fileName = "TestOutput.xlsx";
  fs.writeFileSync(fileName, xls, "binary", (error) => {
    if (error) console.log(error);
  });
};

materialPrint = async (date) => {
  await sql
    .query(materialPrintQuery(date))
    .then((data) => {
      convert(data);
    })
    .then(console.log("File Saved"))
    .catch((error) => console.log(error));
};

module.exports = materialPrint;
