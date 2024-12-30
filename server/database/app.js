const express = require("express");
const app = express();

// Lisage defineerimata muutuja 'res' käsitlemine
app.get("/endpoint", (req, res) => {
    const reviews = {
        id: 1,
        name: "Sample Review"
    };

    // Parandatud notatsioon
    res.send(reviews.name);
});

// Parandatud punktinotatsioon ja defineeritud 'data'
app.post("/add-review", (req, res) => {
    const data = req.body;

    const review = {
        id: data.id,
        name: data.name,
        dealership: data.dealership,
        review: data.review,
        purchase: data.purchase,
        purchase_date: data.purchase_date,
        car_make: data.car_make,
        car_model: data.car_model,
        car_year: data.car_year
    };

    res.send(review);
});

// Lisatud semikoolonid
app.listen(3000, () => {
    console.log("Server is running");
});
