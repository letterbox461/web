window.onload = () => {
  document.querySelector("#pageFooter").style.display = "none";
  document.querySelector("#topContainer").classList.remove("hidden");
  sorting();
  statisticHandler();
  visibility();
  shiftSelect();
};

const cutters = [
  null,
  "Bullmer1",
  "Diamond2",
  "Bullmer3",
  "Bullmer4",
  "5",
  "6",
];

function sorting() {
  let list = document.getElementById("0");

  [...list.children]
    .sort((a, b) =>
      document.getElementById(`${a.id + "tdop2"}`).textContent +
        document.getElementById(`${a.id + "tdop3"}`).textContent >
      document.getElementById(`${b.id + "tdop2"}`).textContent +
        document.getElementById(`${b.id + "tdop3"}`).textContent
        ? 1
        : -1
    )
    .forEach((node) => list.append(node));
}

document.addEventListener("dragstart", (ev) => {
  // ev.stopPropagation();

  if (ev.target.tagName === "TR" && ev.target.getAttribute("draggable")) {
    ev.dataTransfer.setData("text", ev.target.id);
    ev.effectAllowed = "Move";
    ev.dataTransfer.setDragImage(img, 0, 0);
    // let params = { ID: ev.target.id };
    // sendRequest("POST", "/onDrag", params);
  } else {
    ev.preventDefault();
    console.log("wrong dragstart item");
    return "";
  }
});

let img = new Image();

function visibility() {
  let itemsCollection = document.getElementsByName("visibility");
  for (let j = 0; j < itemsCollection.length; j++) {
    if (itemsCollection[j].parentElement.parentElement.id[0] !== "0") {
      itemsCollection[j].style.display = "none";
    } else {
      itemsCollection[j].style.display = "";
    }
  }
}

function statisticHandler() {
  let tableStats = document.getElementsByName("statWindow");
  let markerTimes = document.getElementsByName("stdTime");

  for (let j = 1; j < tableStats.length; j++) {
    let stdtime = 0;
    for (let i = 0; i < markerTimes.length; i++) {
      if (
        tableStats[j].id[0] == markerTimes[i].parentElement.parentElement.id[0]
      ) {
        stdtime = stdtime + +markerTimes[i].textContent;
      }
    }
    document.getElementById(`${j}counter`).textContent = `${stdtime.toFixed(
      2
    )} / ${Number((stdtime / 480) * 100).toFixed()}%`;
  }
}

let shift;

function shiftSelect() {
  let shiftSelector = document.getElementById("shiftSelector").children;

  for (let j = 0; j < shiftSelector.length; j++) {
    if (shiftSelector[j].className === "active") {
      shift = shiftSelector[j].id[0];
      break;
    }
  }
}

function markerEditBtnHandler(ev) {
  document.querySelector("#hiddenSpan").classList.remove("invisible");
}

async function pushHandler(ev) {
  globalCleaner();

  let params;
  let newLayers = document.querySelector("#markereditLayers").value;
  let checkBoxes = document.querySelectorAll("input[type=checkbox]:checked");

  if (checkBoxes.length === 0) {
    alert("выбери раскладки");
    return "";
  }

  let confirmAction = confirm(`Изменить ${checkBoxes.length} раскладки(у)?`);
  if (!confirmAction) {
    [...checkBoxes].forEach((element) => {
      element.checked = false;
    });
    return "";
  }

  try {
    for (let i = 0; i < checkBoxes.length; i += 1) {
      let newPlandate = document.querySelector("#markerEditDate").value;
      checkBoxes[i].checked = false;
      if (!isNaN(Number(newLayers)) && newLayers != "") {
        params = {
          ID: checkBoxes[i].name,
          date: newPlandate,
          layers: newLayers,
          shift: "смена",
          ctTbl: Number(
            document.getElementById(`${checkBoxes[i].name}`).parentElement.id
          ),
        };
        if (document.getElementById(`${checkBoxes[i].name}tdop4`)) {
          document.getElementById(`${checkBoxes[i].name}tdop4`).textContent =
            newLayers;
        }
      } else {
        params = {
          ID: checkBoxes[i].name,
          date: newPlandate,
          layers: "Колслоев",
          shift: "смена",
          ctTbl: Number(
            document.getElementById(`${checkBoxes[i].name}`).parentElement.id
          ),
        };
      }
      if (
        document.querySelector("#markerEditDate").value !=
        document.querySelector("#date").value
      ) {
        checkBoxes[i].parentElement.parentElement.style.display = "none";
        params.shift = "0";
        params.ctTbl = 0;
      }

      await sendRequest("POST", "/updateMarkers", params);
    }
  } catch (e) {
    console.log(e);
  } finally {
    document.querySelector("#hiddenSpan").classList.add("invisible");
    document.querySelector("#markereditLayers").value = "";
    document.querySelector("#markerEditDate").value =
      document.querySelector("#date").value;
  }
}

function searchHandler(ev) {
  let input, filter, table, tr, td;
  input = document.getElementById(ev.target.id);
  filter = input.value.toUpperCase();
  table = document.getElementById(ev.target.id[0]);
  tr = table.getElementsByTagName("TR");

  for (let i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("TD");
    for (let j = 0; j < td.length; j += 1) {
      if (td[j].textContent.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
        break;
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

async function buttonHandler(ev) {
  globalCleaner();
  let table;
  let checkBoxes = document.querySelectorAll("input[type=checkbox]:checked");
  let shiftPlan;
  let params = [];
  table = document.getElementById(ev.target.id[0]);
  let queueStart = table.childElementCount;

  if (table.id === "0") {
    shiftPlan = 0;
  } else {
    shiftPlan = shift;
  }
  for (let j = 0; j < checkBoxes.length; j += 1) {
    checkBoxes[j].checked = false;
    params[j] = {
      markerId: checkBoxes[j].name,
      tbl: cutters[table.id],
      shift: shiftPlan,
      queue: queueStart + j,
    };
  }
  console.log(params);

  await sendRequest("POST", "/update4", params).then((response) => {
    [...checkBoxes].forEach((e) =>
      table.append(document.getElementById(e.name))
    );
  });
  statisticHandler();
  visibility();
}

async function dblHandler(ev) {
  globalCleaner();

  let checkBoxes = document.querySelectorAll("input[type=checkbox]:checked");
  if (checkBoxes.length == 0 || ev.target.tagName == "INPUT") {
    console.log("nothing to transfer");
    return "";
  }

  targetIdNew = document.getElementById(ev.target.id).parentElement.id;

  tbl = document.getElementById(targetIdNew).parentElement.id;

  let shiftPlan;
  if (document.getElementById(targetIdNew).parentElement.id === "0") {
    shiftPlan = 0;
  } else {
    shiftPlan = shift;
  }

  let params = {
    position: 0,
    positionShift: 0,
    tbl: tbl,
    shift: shiftPlan,
    date: document.getElementById("date").value,
    collection: [],
  };

  // for (let j = 0; j < checkBoxes.length; j += 1) {
  //   checkBoxes[j].checked = false;
  //   params[j] = { ID: checkBoxes[j].name, tbl: table.id, shift: shiftPlan };
  // }

  await sendRequest("POST", "/get1", { id: targetIdNew })
    .then(async (data) => {
      data = await data.json();
      console.log(data);
      for (let j = 0; j < checkBoxes.length; j += 1) {
        checkBoxes[j].checked = false;
        params.collection.push({
          markerId: checkBoxes[j].name,
          queue: data[0].position + j,
        });
      }
      params.position = data[0].position;
      params.positionShift = params.collection.length;
    })
    .then(() => {
      sendRequest("POST", "/update6", params)
        .then(() => {
          [...checkBoxes].forEach((e) => {
            document
              .getElementById(tbl)
              .insertBefore(
                document.getElementById(e.name),
                document.getElementById(targetIdNew)
              );
          });
        })
        .then(() => {
          visibility();
          globalCleaner();
          statisticHandler();
        });
    });
}

function globalCleaner() {
  let globals = document.getElementsByName("global");
  for (let i = 0; i < globals.length; i++) {
    globals[i].checked = false;
  }
}

function dragOverHandler(ev) {
  ev.preventDefault();

  if (ev.currentTarget.tagName == "TR") {
    ev.currentTarget.classList.add("ondragover");
  }
  // ev.currentTarget.classList.add("ondragover");
}
function dragLeaveHandler(ev) {
  ev.currentTarget.style.border = "none";
  ev.currentTarget.classList.remove("ondragover");
  ev.preventDefault();
}
async function dropHandler(ev) {
  ev.preventDefault();
  ev.stopPropagation();

  let id = ev.dataTransfer.getData("text");
  if (isNaN(Number(id))) {
    console.log("Wrong drop item!");
    document.location.reload();
    return "";
  }
  let targetIdNew;
  ev.currentTarget.classList.remove("ondragover");

  if (document.getElementById(ev.target.id).tagName === "TD") {
    targetIdNew = document.getElementById(ev.target.id).parentElement.id;
    document.getElementById(targetIdNew).classList.remove("ondragover");
  } else if (
    document.getElementById(ev.target.id).tagName === "DIV" ||
    document.getElementById(ev.target.id).tagName === "FOOTER" ||
    document.getElementById(ev.target.id).tagName === "INPUT"
  ) {
    targetIdNew = ev.target.id[0];
  } else console.log(document.getElementById(ev.target.id).tagName);
  let shiftPlan;

  if (
    targetIdNew === "0" ||
    document.getElementById(targetIdNew).parentElement.id === "0"
  ) {
    shiftPlan = 0;
  } else {
    shiftPlan = shift;
  }
  let params;

  if (targetIdNew < 50) {
    params = { ID: id, tbl: targetIdNew, shift: shiftPlan };
    await sendRequest("POST", "/update1", params).then(() =>
      document.getElementById(targetIdNew).append(document.getElementById(id))
    );
  } else if (targetIdNew > 100) {
    params = { ID: id, tbl: targetIdNew, shift: shiftPlan };

    await sendRequest("POST", "/update2", params).then(() => {
      document
        .getElementById(targetIdNew)
        .parentElement.insertBefore(
          document.getElementById(id),
          document.getElementById(targetIdNew)
        );
      // document.getElementById(targetIdNew).style.border = " 1px solid";
    });
  }

  statisticHandler();
  visibility();
}

function dragEndHandler(ev) {
  return "";
}

function chkBox_global_handler(ev) {
  let table = document.getElementById(ev.target.id[0]);

  let children = table.children;

  for (let i = 0; i < children.length; i++) {
    if (children[i].style.display != "none") {
      let j = children[i].id;
      if (document.getElementById("chk" + j)) {
        document.getElementById("chk" + j).checked = ev.target.checked;
      }
    }
  }
}

async function dateHandler(ev) {
  await sendRequest("POST", "/cutPlanDateChange", {
    plandate: ev.target.value,
    shift: shift,
  })
    .then(() => document.getElementById("upd_btn").click())
    .catch((e) => console.log(e));
}
function materialPrintHandler() {
  console.log(document.getElementById("date").value);
  sendRequest("POST", "/materialPrint", {
    date: document.getElementById("date").value,
  }).then(async (data) => {
    const dataBlob = await data.blob();
    const dataURL = URL.createObjectURL(dataBlob);

    const anchor = document.createElement("a");
    anchor.href = dataURL;
    anchor.download = "Печать материалов по заданию";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(dataURL);
  });
}
let multiSelectMode = false;
document.addEventListener("keydown", (e) => {
  if (e.code === "ShiftLeft") {
    multiSelectMode = true;
  }
});
document.addEventListener("keyup", (e) => {
  e.preventDefault();
  if (e.code === "ShiftLeft") {
    multiSelectMode = false;
  }
});

function multiSelect(ev) {
  if (multiSelectMode) {
    console.log(ev.target.id);
    let targetNew = document.getElementById(ev.target.id).parentElement.id;
    document.getElementsByName(targetNew)[0].checked =
      !document.getElementsByName(targetNew)[0].checked;
  }
}
