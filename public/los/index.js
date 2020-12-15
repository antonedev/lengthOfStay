var body = document.getElementById("body");

body.addEventListener("submit", function (e) {
  console.log(e);
  if (confirm("Are you sure you want to do this?")) {
    // continue with default behavior
  } else {
    e.preventDefault();
  }
});

var inputForm = document.getElementById("input-form");
var toggleViewButton = document.getElementById("form-visibility");
var formVisible = false;

toggleViewButton.addEventListener("click", function () {
  if (formVisible) {
    formVisible = false;
    toggleViewButton.value = "Show Input Form";
    inputForm.style.display = "none";
  } else {
    formVisible = true;
    toggleViewButton.value = "Hide Input Form";
    inputForm.style.display = "flex";
  }
});

var paList = document.getElementById("pa-list");
var rwcList = document.getElementById("rwc-list");
var divider = document.getElementById("divider");
var toggleShelterButton = document.getElementById("first-shelter");
var paFirst = true;

toggleShelterButton.addEventListener("click", function () {
  if (paFirst) {
    paFirst = false;
    toggleShelterButton.value = "Show PA First";
    divider.parentNode.insertBefore(divider, paList);
    divider.parentNode.insertBefore(rwcList, divider);
  } else {
    paFirst = true;
    toggleShelterButton.value = "Show RWC First";
    divider.parentNode.insertBefore(divider, rwcList);
    divider.parentNode.insertBefore(paList, divider);
  }
});

var headerName = document.getElementById("header-name");
var headerLos = document.getElementById("header-los");
var headerDate = document.getElementById("header-date");
var losAscendingSort = null;
var nameAscendingSort = null;

headerName.addEventListener("click", function (e) {
  sortAnimalsByName();
});

headerLos.addEventListener("click", function (e) {
  sortAnimalsByLos();
});

headerDate.addEventListener("click", function (e) {
  sortAnimalsByLos();
});

function sortAnimalsByName() {
  if (nameAscendingSort === true) {
    nameAscendingSort = false;
    sortByName(paList, -1);
    sortByName(rwcList, -1);
  } else {
    nameAscendingSort = true;
    sortByName(paList, 1);
    sortByName(rwcList, 1);
  }
}

function sortAnimalsByLos() {
  if (losAscendingSort === true) {
    losAscendingSort = false;
    sortByLos(paList);
    sortByLos(rwcList);
  } else {
    losAscendingSort = true;
    sortByLos(paList);
    sortByLos(rwcList);
  }
}

function sortByName(list, asc) {
  var listElems = [];
  var listAnimals = list.childNodes;

  for (var i = 0; i < listAnimals.length; i++) {
    listElems.push({
      key: listAnimals[i].childNodes[0].childNodes[0].innerText,
      val: listAnimals[i],
    });
  }

  if (nameAscendingSort) listElems.sort(compareNamesAsc);
  else listElems.sort(compareNamesDsc);

  for (var i = 0; i < listElems.length; i++) {
    list.appendChild(listElems[i].val);
  }
}

function sortByLos(list, asc) {
  var listElems = [];
  var listAnimals = list.childNodes;

  for (var i = 0; i < listAnimals.length; i++) {
    listElems.push({
      key: listAnimals[i].childNodes[0].childNodes[1].innerText,
      val: listAnimals[i],
    });
  }

  if (losAscendingSort) listElems.sort(compareAsc);
  else listElems.sort(compareDsc);

  for (var i = 0; i < listElems.length; i++) {
    list.appendChild(listElems[i].val);
  }
}

function compareAsc(a, b) {
  return a.key - b.key;
}

function compareDsc(a, b) {
  return b.key - a.key;
}

function compareNamesAsc(a, b) {
  return a.key.localeCompare(b.key);
}

function compareNamesDsc(b, a) {
  return a.key.localeCompare(b.key);
}
