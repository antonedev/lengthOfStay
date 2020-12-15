require("dotenv").config({path: "./config/.env"});

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const express = require("express");
const mongoose = require("mongoose");

const losRouter = require("./router");

const { Animal } = require("./model/animalModel");
const { formatDate } = require("./utils/formatDate");
const { sendEmail } = require("./utils/mailer");
const { formatEmail } = require("./utils/dailyEmail");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const db = mongoose.connection;

app.set("trust proxy", true);
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/", losRouter);

cron.schedule("0 7 * * *", () => {
  Animal.updateMany(
    { inFoster: { $ne: true } },
    { $inc: { lengthOfStay: 1 } },
    (err, n) => {
      if (err) sendEmail(process.env.SYS_EMAIL, "error", err);
    }
  );
});

// cron.schedule("0 12 * * *", () => {
//   Animal.find(
//     {},
//     "name id dateOfEntry lengthOfStay shelter area notes",
//     (err, allAnimals) => {
//       if (err) console.log(err);
//       else {
//         sendEmail(
//           process.env.CONTACT_LIST,
//           `LOS Update for ${formatDate(new Date())}`,
//           formatEmail(allAnimals)
//         );
//       }
//     }
//   );
// });

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  app.listen(process.env.PORT, () => {
    console.log(`losService running`);
  });
});
