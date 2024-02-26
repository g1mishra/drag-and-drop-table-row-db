import express from "express";
import pkg from "body-parser";
const { urlencoded, json } = pkg;
import { Sequelize, Model, DataTypes } from "sequelize";
import cors from "cors";
import { initialData } from "./constant.js";

const app = express();
app.use(cors());
const port = 8000;

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

// Define User model
class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    order: DataTypes.INTEGER,
  },
  { sequelize, modelName: "user" }
);

// Sync models with database

// Sync models with database
sequelize.sync().then(async () => {
  // Upload initialData to the database
  try {
    for (const data of initialData) {
      await User.create(data);
    }
    console.log("Initial data uploaded successfully");
  } catch (error) {
    console.error("Error uploading initial data:", error);
  }
});

// Middleware for parsing request body
app.use(urlencoded({ extended: false }));
app.use(json());

// CRUD routes for User model
app.get("/users", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// this is the api to udpate the rowid in bulk
app.put("/users/order", async (req, res) => {
  const orders = Array.isArray(req.body) ? req.body : [req.body];

  // Validate request body
  if (
    !Array.isArray(orders) ||
    orders.length === 0 ||
    !orders.every((order) => order && order.id && order.order !== undefined)
  ) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    await Promise.all(
      orders.map(async ({ id, order }) => {
        await User.update({ order }, { where: { id } });
      })
    );

    const message =
      orders.length > 1
        ? "Orders updated successfully"
        : "Order updated successfully";
    res.json({ message });
  } catch (error) {
    console.error("Error updating orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
