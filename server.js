import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let bookedDates = ["2025-02-10", "2025-02-22"];

app.get("/api/booked-dates", (req, res) => {
  res.json(bookedDates);
});

app.post("/api/book", (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Date is required" });

  bookedDates.push(date);
  res.json({ message: "Booked successfully", date });
});

app.get("/", (req, res) => {
  res.send("Events Hall Backend Running");
});

app.listen(3000, () => console.log("Server running on port 3000"));
