const express = require("express");
const router = express.Router();

const { caToday } = require("../utils/caToday");
const { Animal } = require("../model/animalModel");
const { BlockedIP } = require("../model/blockedIPModel");
const { formatDate } = require("../utils/formatDate");
const { sendEmail } = require("../utils/mailer");

let trackedIPs = new Map();

BlockedIP.find({}, (err, blockedIPs) => {
  console.log("loading blocked ips...");
  for (let blockedIP of blockedIPs) {
    trackedIPs.set(blockedIP.ip, {
      numberOfAttempts: blockedIP.attempts,
      lastAttempt: blockedIP.lastAttempt,
      isStored: true,
    });
  }
  console.log(trackedIPs);
});

router.get("/los", authCheck, (req, res) => {
  const formattedToday = formatDate(caToday());
  Animal.find(
    {},
    "name id dateOfEntry species lengthOfStay shelter area notes inFoster fosterDate returnDate",
    (err, allAnimals) => {
      if (err) res.json(err);
      else
        res.render("./index.pug", {
          allAnimals: allAnimals,
          today: formattedToday,
        });
    }
  );
});

router.get("/los/login", blockIP, (req, res) => {
  if (req.signedCookies.authorized) res.redirect("/los");
  else res.render("./login.pug");
});

router.post("/los/create", authCheck, (req, res) => {
  const entryDate = new Date(req.body["date-of-entry"]);
  const timeDifference = caToday() - entryDate;
  const differenceInDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  const newAnimal = Animal({
    name: req.body.name,
    id: req.body.id,
    dateOfEntry: formatDate(entryDate),
    species: req.body.species,
    lengthOfStay: differenceInDays,
    shelter: req.body.shelter,
    area: req.body.area,
    notes: req.body.notes,
  });

  newAnimal.save((err, savedAnimal) => {
    if (err) res.json(err);
    else res.redirect("/los");
  });
});

router.post("/los/delete", authCheck, (req, res) => {
  Animal.deleteOne({ _id: req.body.id }, (err) => {
    if (err) res.json(err);
    else res.redirect("/los");
  });
});

router.post("/los/edit", authCheck, (req, res) => {
  Animal.findOne({ _id: req.body.id }, (err, animal) => {
    if (err) res.json(err);
    else res.render("./edit.pug", { animal: animal });
  });
});

router.post("/los/foster", authCheck, (req, res) => {
  const inFoster = req.body.inFoster;
  Animal.updateOne(
    { _id: req.body.id },
    { inFoster: !inFoster },
    (err, animal) => {
      if (err) res.json(err);
      else res.redirect("/");
    }
  );
});

router.post("/los/update", authCheck, (req, res) => {
  const entryDate = new Date(req.body["date-of-entry"]);
  const timeDifference = caToday() - entryDate;
  const differenceInDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  const editedAnimal = Animal({
    name: req.body.name,
    id: req.body.id,
    dateOfEntry: formatDate(entryDate),
    lengthOfStay: differenceInDays,
    species: req.body.species,
    shelter: req.body.shelter,
    inFoster: req.body.inFoster,
    fosterDate: req.body.fosterDate,
    returnDate: req.body.returnDate,
    area: req.body.area,
    notes: req.body.notes,
  });
  editedAnimal.save((err, savedAnimal) => {
    if (err) res.json(err);
    else
      Animal.deleteOne({ _id: req.body._id }, (err) => {
        if (err) res.json(err);
        else res.redirect("/los");
      });
  });
});

router.post("/los/login", blockIP, trackIP, (req, res) => {
  if (req.body.pin === process.env.LOS_PIN) {
    trackedIPs.delete(req.headers["x-real-ip"]);
    res.cookie("authorized", "true", { signed: true });
    res.redirect("/los");
  } else {
    if (!trackedIPs.has(req.headers["x-real-ip"])) {
      trackedIPs.set(req.headers["x-real-ip"], {
        lastAttempt: new Date(),
        numberOfAttempts: 1,
      });
    }
    res.render("./login.pug", { error: "INVALID CODE" });
  }
});

function authCheck(req, res, next) {
  if (req.signedCookies.authorized) {
    next();
  } else {
    res.redirect("/los/login");
  }
}

function blockIP(req, res, next) {
  const ip = req.headers["x-real-ip"];
  if (trackedIPs.has(ip)) {
    const trackedIP = trackedIPs.get(ip);
    if (trackedIP.isStored) {
      res.render("./error.pug", {
        error: `Your IP [${ip}] has been blocked due to too many unsuccessful login attempts. Please contact the administrator for more assistance.`,
      });
    } else next();
  } else next();
}

function trackIP(req, res, next) {
  const ip = req.headers["x-real-ip"];
  if (trackedIPs.has(ip)) {
    const trackedIP = trackedIPs.get(ip);
    if (!trackedIP.isStored) {
      const now = new Date();
      const lastAttempt = trackedIP.lastAttempt;
      const numberOfAttempts = trackedIP.numberOfAttempts;
      const diff = (now - lastAttempt) / 1000;

      trackedIPs.set(ip, {
        numberOfAttempts: numberOfAttempts + 1,
        lastAttempt: new Date(),
      });

      if (numberOfAttempts > 4) {
        const newBlockedIP = new BlockedIP({
          ip: ip,
          lastAttempt: new Date(),
          attempts: numberOfAttempts,
        });
        newBlockedIP.save((err, newIP) => {
          if (err) sendEmail(process.env.SYS_EMAIL, "blocked ip error", err);
          else {
            trackedIPs.set(newBlockedIP.ip, {
              lastAttempt: newBlockedIP.lastAttempt,
              numberOfAttempts: newBlockedIP.attempts,
              isStored: true,
            });
            sendEmail(
              process.env.SYS_EMAIL,
              "new blocked ip",
              newIP.toString()
            );
            res.render("./error.pug", {
              error: `Your IP [${ip}] has been blocked due to too many unsuccessful login attempts. Please contact the administrator for more assistance.`,
            });
            console.log(trackedIPs);
          }
        });
      } else if (diff < 2) {
        res.render("./login.pug", { error: "DO NOT SPAM CODES" });
      } else next();
    } else console.log("error: stored ip in tracker!");
  } else next();
}

module.exports = router;
