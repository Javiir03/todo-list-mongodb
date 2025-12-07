//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

// Conexión a MongoDB Atlas usando variable de entorno
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.log("MongoDB error:", err));

// Schema y modelo
const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

// Items por defecto
const item1 = new Item({ name: "Buy Food" });
const item2 = new Item({ name: "Cook Food" });
const item3 = new Item({ name: "Eat Food" });

const defaultItems = [item1, item2, item3];

// Configuración
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// GET principal
app.get("/", function (req, res) {

  Item.find({})
    .then(function (foundItems) {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => console.log("Inserted default items"))
          .catch(err => console.log(err));

        return res.redirect("/");
      }

      const day = date.getDate();
      res.render("list", { listTitle: day, newListItems: foundItems });
    })
    .catch(err => console.log(err));
});

// POST añadir item
app.post("/", function (req, res) {
  const itemName = req.body.newItem;

  const item = new Item({ name: itemName });

  item.save()
    .then(() => res.redirect("/"))
    .catch(err => console.log(err));
});

// POST eliminar item
app.post("/delete", function (req, res) {
  const itemId = req.body.itemId;

  Item.findByIdAndDelete(itemId)
    .then(() => {
      console.log("Item deleted");
      res.redirect("/");
    })
    .catch(err => console.log(err));
});

// GET About
app.get("/about", function (req, res) {
  res.render("about");
});

// Iniciar servidor con puerto dinámico
const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
