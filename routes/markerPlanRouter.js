const { Router } = require("express");
const router = Router();
let sql = require("@frangiskos/mssql").sql;
let today = require("../public/today.js");
const queries = require("./queries/MarkerPlan");
const errorCheck = require("../public/errorCheck.js");
const materialPrint = require("../public/markerPlan/materialPrint");

let plandate = today;
let shift = 1;

router.get("/getdata", async (req, res) => {
  try {
    await sql.query(queries.selectQuery(plandate, shift)).then((data) => {
      res.render("markerPlan", {
        title: "Markers planning",
        data,
        plandate,
        shift,
      });
    });
    // .catch((e) => {
    //   console.error(e);
    //   console.log(queries.selectQuery(plandate, shift));
    //   res.sendStatus(400).send({ message: "GET Error" });
    // });
  } catch (e) {
    console.log(e);
  }
});

router.get("/getdatashift", async (req, res) => {
  try {
    shift = req.url[req.url.length - 1];

    await sql
      .query(queries.selectQuery(plandate, shift))
      .then((data) => {
        res.render("markerPlan", {
          title: "Markers planning",
          data,
          plandate,
          shift,
        });
      })
      .catch((e) => {
        console.error(e);
        console.log(queries.selectQuery(plandate, shift));
        res.sendStatus(400).send({ message: "GET Error" });
      });
  } catch (e) {
    console.log(e);
  }
});

router.post("/cutPlanDateChange", (req, res) => {
  try {
    q = 0;
    [...req.body.plandate].forEach((e) => {
      if (isNaN(Number(e))) {
        q++;
      }
    });
    if (q === 2) {
      plandate = `${req.body.plandate}`;
    }
    console.log(`q=${q}, plandate =${plandate}`);
    shift = `${req.body.shift}`;
    res.send({});
  } catch (e) {
    console.log(e);
  }
});

router.post("/update1", async (req, res) => {
  try {
    if (errorCheck(req.body)) {
      await sql
        .query(
          queries.update1(req.body.ID, req.body.tbl, plandate, req.body.shift)
        )
        .then(() => {
          console.log("POST successful");

          res.send({ message: "POST OK" });
        })
        .catch((e) => {
          console.log(
            queries.update1(req.body.ID, req.body.tbl, plandate, req.body.shift)
          );
          console.error(e);
          res.sendStatus(400).send({ message: "POST Error" });
        });
    } else {
      console.log(req.body);
      throw new Error(`Wrong arguments on request ${req.url}!`);
    }
  } catch (e) {
    console.log(e);
  }
});

// router.post("/update4", async (req, res) => {
//   try {
//     console.log(req.body)
//     if (errorCheck(req.body)) {
//       let arr = (req.body);
//       const func = async () => {
//         let q = queries.update4();
//         arr.forEach((e) => {
//          q += queries.update5(e.ID, e.tbl, plandate, e.shift);

//         });
//         sql.query(q);
//       };
//       await func()
//         .then(() => {
//           res.send({ message: "POST successful", status: 200 });
//           console.log("POST successful");
//         })
//         .catch((e) => {

//           console.error(e);
//           res.sendStatus(400).send({ message: "POST Error" });
//         });
//     } else {
//       throw new Error(`Wrong arguments on request ${req.url}!`);
//     }
//   } catch (e) {
//     console.log(e);
//   }
// });

router.post("/update4", async (req, res) => {
  await sql
    .query(queries.update8(JSON.stringify(req.body)))
    .then(() => {
      console.log("POST Successful");
      res.send({ message: "POST OK" });
    })
    .catch((e) => console.log(e));
});

router.post("/update2", async (req, res) => {
  try {
    if (errorCheck(req.body)) {
      await sql
        .query(queries.update2(req.body.ID, req.body.tbl, req.body.shift))
        .then(() => {
          console.log("POST successful");
          res.send({});
        })
        .catch((e) => {
          console.log(
            queries.update2(req.body.ID, req.body.tbl, req.body.shift)
          );
          console.error(e);
          res.sendStatus(400).send({ message: "POST Error" });
        });
    } else {
      throw new Error(`Wrong arguments on request ${req.url}!`);
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/get1", async (req, res) => {
  console.log(req.body.id);
  await sql
    .query(queries.select1(req.body.id))
    .then((data) => {
      console.log(data);
      res.send(JSON.stringify(data));
    })
    .catch((e) => console.log(e));
});

// router.post("/update6", async (req, res) => {
//   try {
//     if (errorCheck(req.body)) {
//       let arr = req.body;

//       const func = async () => {
//         q = queries.update7();
//         arr.forEach((e) => {
//           q += queries.update6(e.ID, e.tbl, e.shift);
//         });
//         sql.query(q);
//       };

//       await func()
//         .then(() => {
//           res.send({ message: "POST successful" });
//           console.log("POST successful");
//         })
//         .catch((e) => {
//           console.log(q);
//           console.error(e);
//           res.sendStatus(400).send({ message: "POST Error" });
//         });
//     } else {
//       throw new Error(`Wrong arguments on request ${req.url}!`);
//     }
//   } catch (e) {
//     console.log(e);
//   }
// });

router.post("/update6", async (req, res) => {
  // await sql.query(queries.update9(req.body.position,req.body.positionShift,req.body.tbl,req.body.shift,req.body.date,JSON.stringify(req.body.collection)))
  await sql
    .query(queries.update9(req.body))
    .then(() => res.send({ message: "POST OK" }))
    .catch((e) => {
      console.log(e);
      console.log(queries.update9(req.body));
    });
});

router.post("/updateMarkers", async (req, res) => {
  try {
    if (errorCheck(req.body)) {
      console.log(req.body);
      await sql
        .query(queries.update3(...Object.values(req.body)))
        .then(() => {
          console.log("POST successful");
          res.send({});
        })
        .catch((e) => {
          console.log(queries.update3(...Object.values(req.body)));
          console.error(e);
          res.sendStatus(400).send({ message: "POST Error" });
        });
    } else {
      throw new Error(`Wrong arguments on request ${req.url}!`);
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/onDrag", async (req, res) => {
  try {
    if (errorCheck(req.body)) {
      await sql
        .query(queries.onDragUpdate(req.body.ID))
        .then(() => {
          console.log("POST successful");
          res.send({ message: "Post sucessful" });
        })
        .catch((e) => {
          console.error(e);
          res.sendStatus(400).send({ message: "POST Error" });
        });
    } else {
      throw new Error(`Wrong arguments on request ${req.url}!`);
    }
  } catch (e) {
    console.log();
  }
});

router.post("/materialPrint", async (req, res) => {
  await materialPrint(req.body.date).then(() =>
    res.download("c:/prog/TestOutput.xlsx")
  );
});

module.exports = router;
