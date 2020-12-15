exports.formatEmail = function (animals) {
  const greeting =
    "Good Morning,\n\nHere is the daily LOS report. High priority animals are listed first, followed by a complete list of all animals sorted by length of stay.\n\n";
  const highPriority = highPriorityAnimals(animals);
  const paAnimals = animalsByShelter(animals, "PA");
  const rwcAnimals = animalsByShelter(animals, "RWC");
  const formattedEmail = greeting + highPriority + paAnimals + rwcAnimals;
  return "<pre style='font-family:monospace'>" + formattedEmail + "</pre>";
};

function animalsByShelter(allAnimals, shelterCode) {
  let shelterList = [];
  let shelterString = "*** " + shelterCode + " ANIMALS ***\n\n";
  for (let animal of allAnimals) {
    if (animal.shelter === shelterCode) {
      shelterList.push(animal);
    }
  }
  shelterString += compileList(shelterList);
  return shelterString;
}

function highPriorityAnimals(allAnimals) {
  let hpList = [];
  let hpString = "*** HIGH PRIORITY ***\n\n";
  for (let animal of allAnimals) {
    if (animal.lengthOfStay > 13) hpList.push(animal);
  }
  hpString += compileList(hpList);
  return hpString;
}

function compileList(list) {
  let listString = `${adjWS("NAME")}${adjWS("LOS")}${adjWS("SHELTER")}${adjWS(
    "IN-DATE"
  )}`;
  listString += "\n";
  list.sort(compareLOS);
  for (let animal of list) {
    let line = `${adjWS(animal.name)}${adjWS(animal.lengthOfStay)}${adjWS(
      animal.shelter
    )}${adjWS(animal.dateOfEntry)}`;
    line += "\n";
    listString += line;
  }
  listString += "\n";
  return listString;
}

function adjWS(string, chars = 15) {
  string += "";
  if (string.length >= chars) {
    string = string.slice(0, chars - 5);
    string += new Array(6).join(" ");
    return string;
  } else {
    const diff = chars - string.length;
    string += new Array(diff + 1).join(" ");
    return string;
  }
}

function compareLOS(a, b) {
  if (a.lengthOfStay > b.lengthOfStay) return 1;
  else if (a.lengthOfStay < b.lengthOfStay) return 0;
  else return 0;
}
