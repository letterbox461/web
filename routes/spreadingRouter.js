const { Router } = require("express");
const { route } = require("express/lib/application");
const router = Router();
const sql = require("@frangiskos/mssql").sql;
const queries = require("./queries/Spreading");
const uuidv4 = require("uuid").v4;

const calcLength = (data) => {
  if (data.length === 1) {
    return data[0].Общая_длина + data[0].Припуск;
  } else if (data.length > 1) {
    let sum = 0;
    data.forEach((e) => (sum += e.Общая_длина));
    return (
      sum +
      data[0].Припуск / 2 +
      data[data.length - 1].Припуск / 2 +
      0.005 * (data.length - 1)
    );
  }
};

router.post("/calc_length", async (req, res) => {
  ({ markers } = req.body);
  if (markers[0] > 0) {
    sql.query(queries.getLengths(markers)).then((data) => {
      res.send({ leng: calcLength(data) });
    });
  } else res.send([]);
});

router.post("/create_spread", async (req, res) => {
  ({ markers, operator, table } = req.body);
  sql
    .query(queries.getLastSpreadingID())
    .then((data) => {
      markers.forEach((e) => {
        setTimeout(() => {
          sql
            .query(queries.createSpread(e, operator, table, data[0].id + 1))
            .catch((err) => console.log(err));
        }, 50);
      });
    })
    .then(() => res.send({ result: "ok" }))
    .catch((err) => console.log(err));
});

router.post("/getMarkerData", async (req, res) => {
  ({ table } = req.body);
  sql.query(queries.getMarkerData(table)).then((data) => res.send(data));
});

router.post("/spreading/checkRoll", async (req, res) => {
  ({ НомерЛир, idРулона } = req.body);

  sql.query(queries.getRollData(idРулона)).then((data) => {
    if (data.length === 0) {
      res.send([{ message: "notFound" }]);
    } else if (data[0].NLear !== НомерЛир) {
      res.send([{ message: "wrongMaterial" }]);
    } else if (data[0].BFlash === true) {
      res.send([{ message: "closed" }]);
    } else if (data[0].Status !== "green") {
      res.send([{ message: "blocked" }]);
    } else if (data[0].NotFIFO === true) {
      res.send([{ message: "ok" }]);
    } else {
      const part = data[0].NPart;
      sql.query(queries.getMinPart(НомерЛир)).then((data) => {
        if (data[0].minPart === part) {
          res.send([{ message: "ok" }]);
        } else {
          res.send([{ message: "notFIFO" }]);
        }
      });
    }
  });
});

router.post("/spreadng/getMaterialDesc", async (req, res) => {
  ({ materialNumber } = req.body);
  sql
    .query(queries.getMaterialData(materialNumber))
    .then((data) => res.send(data));
});

router.post("/spreading/createCutout", async (req, res) => {
  ({ nLear, idRul, idSpread, length, type, operation, cutoutLabel } = req.body);

  // Найдем минимальную длину концевого
  let minLength = await sql.query(queries.checkCutoutLength(nLear));
  minLength = minLength[0].ДлКонцОст === "NULL" ? 0 : minLength[0].ДлКонцОст;

  // Объявим функции для добавления в БД
  const addNastilOstatki = async (nLear, idRul, idSpread, length, type) => {
    sql
      .query(queries.createCutout(nLear, idRul, idSpread, length, type))
      .then(() => res.send([{ message: "OK" }]));
  };

  const addOstatki = async (nLear, length, descrip) => {
    sql
      .query(queries.createLeftOver(nLear, length / 100, descrip))
      .then(() => res.send([{ message: "OK" }]));
  };

  // Если остаток вычитается
  if (cutoutLabel === "") {
    // Проверим минимальную длину концевого
    if (
      length >= minLength ||
      type === "Учтенный брак" ||
      type === "Не учтенный брак"
    ) {
      // Если длина больше минимальной, либо это брак поставщика,запишем в базу Настил.остатки
      addNastilOstatki(nLear, idRul, idSpread, length, type);
    } else {
      // Иначе запишем в базу KonOstatki
      addOstatki(nLear, length, `Концевой с настила ${idSpread}`);
    }
  } // Если остаток добавляется
  else {
    //  Найдем в базе остаток, проверим можно ли его использовать в настиле.
    let cutout = await sql.query(
      queries.findCutout(cutoutLabel.substr(2, cutoutLabel.length - 1))
    );
    if (cutout.length === 0) {
      res.send([{ message: "Концевой не найден" }]);
    } else if (cutout[0].NLear !== nLear) {
      res.send([
        {
          message: `Этот концевой нельзя использовать`,
        },
      ]);
    } else if (cutout[0].Длинна < length) {
      res.send([{ message: "Длина концевого недостаточна" }]);
    } else if (cutout[0].закрыт == 1) {
      res.send([{ message: "Этот концевой уже закрыт" }]);
    } else {
      // Добавим остаток в базу НастилОстаткиДобавлено
      await sql.query(
        queries.addCutout(
          idSpread,
          length,
          nLear,
          cutout[0].id,
          cutout[0].idRul
        )
      );
      // Проверим, хватит ли длины у оставшегося куска для дальнейшего использования
      let lengthOstatka = cutout[0].Длинна - length;

      if (lengthOstatka < minLength) {
        addOstatki(
          nLear,
          lengthOstatka,
          `Концевой с настила ${idSpread},от остатка ${cutout[0].id} `
        );
      } else {
        addNastilOstatki(
          nLear,
          cutout[0].idRul,
          cutout[0].idNastila,
          lengthOstatka,
          "Концевой остаток"
        );
      }
    }
  }
});

router.get("/getRollID", async (req, res) => {
  sql
    .query(queries.getRollID(req.query.id))
    .then((data) => res.send(data))
    .catch((e) => console.log(e));
});

router.get("/spreading/getDefects", async (req, res) => {
  try {
    // res.sendFile(req.query.path);
    res.sendFile(
      "//runiz-fp01/groups/MOSDocs/Corrective actions/Quality Alerts for incoming materials/L0594458AA Материал BRASILIA MISTRAL/QualityAlert_18069.pdf"
    );
  } catch (e) {
    console.log(e);
  }
});

router.get("/spreading/getOpenedSpreads", async (req, res) => {
  sql
    .query(queries.checkOpenedSpreads(req.query.table))
    .then((data) => res.send(data))
    .catch((e) => console.log(e));
});

router.put("/spreading/setLabelPrint", async (req, res) => {
  sql
    .query(queries.setLabelPrint(req.body.id))
    .then(() => res.send([{ message: "OK" }]))
    .catch((e) => console.log(e));
});

router.put("/spreading/setEndLength", async (req, res) => {
  ({ idrulon, EndDat, idnastil } = req.body);
  // Найдем текущий настил с этим рулоном и запишем последнее измерение
  sql
    .query(queries.lastMeasure(idrulon, EndDat, idnastil))
    .then(() => {
      res.send([{ message: "OK" }]);
    })
    .catch((e) => console.log(e));
});

router.put("/spreading/closeRoll", async (req, res) => {
  sql
    .query(queries.closeRoll(req.body.idРулона))
    .then(() => res.send([{ message: "OK" }]))
    .catch((e) => console.log(e));
});

router.post("/spreading/addRolltoSpread", async (req, res) => {
  ({ idНастила, idРулона, StartDat } = req.body);
  sql
    .query(queries.addRolltoSpread(idНастила, idРулона, StartDat))
    .then(() => res.send([{ message: "OK" }]))
    .catch((e) => console.log(e));
});
router.put("/spreading/closeMarkers", async (req, res) => {
  ({ idРаскроя, QuanFact } = req.body);
  sql
    .query(queries.closeMarkers(idРаскроя, QuanFact))
    .then(() => res.send([{ message: "OK" }]))
    .catch((e) => console.log(e));
});

router.get("/spreading/getRestInRoll", async (req, res) => {
  const rollid = req.query.rollId;
  sql
    .query(queries.restInRoll(rollid))
    .then((data) => {
      res.send(data);
    })
    .catch((e) => console.log(e));
});

router.get("/spreading/getCutouts", async (req, res) => {
  const spreadID = req.query.spreadID;
  if (spreadID !== "0") {
    sql
      .query(queries.getCutouts(spreadID))
      .then((data) => {
        res.send(
          data.map((e) => {
            return { ...e, id: uuidv4() };
          })
        );
      })
      .catch((e) => console.log(e));
  } else {
    res.send([]);
  }
});
router.get("/spreading/getCutoutLabels", async (req, res) => {
  ({ spreadID, material } = req.query);
  if (spreadID !== "0") {
    sql.query(queries.getCutoutLabels(spreadID, material)).then((data) => {
      res.send(data);
      data.forEach((e) => {
        setTimeout(() => {
          sql.query(queries.setCutoutPrint(e.cutoutBarcode));
        }, 200);
      });
    });
  } else res.send([]);
});

router.get("/spreading/getOrderData", async (req, res) => {
  ({ table, date } = req.query);

  sql
    .query(queries.getOrderData(table, date))
    .then((data) => res.send(data))
    .catch((e) => console.log(e));
});

router.post("/spreading/orderMaterials", async (req, res) => {
  sql
    .query(queries.orderMaterial(req.body))
    .then(() => res.send([{ message: "OK" }]));
});

router.post("/spreading/orderConsumable", async (req, res) => {
  ({ idKomp, Material } = req.body);

  sql
    .query(queries.orderConsumable(idKomp, Material))
    .then(() => res.send([{ message: "OK" }]))
    .catch((e) => console.log(e));
});

router.delete("/spreading/cancelSpread", async (req, res) => {
  sql
    .query(queries.cancelSpread(req.body.spreadID))
    .then(() => res.send([{ message: "OK" }]))
    .catch((e) => console.log(e));
});

router.put("/spreading/setLastMeasure", async (req, res) => {
  const { spreadID, rollID, measure } = req.body;
  sql
    .query(queries.setLastMeasure(rollID, spreadID, measure))
    .then(() => res.send([{ message: "OK" }]))
    .catch((e) => console.log(e));
});
module.exports = router;
