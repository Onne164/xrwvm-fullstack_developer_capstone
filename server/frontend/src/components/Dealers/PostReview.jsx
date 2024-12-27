import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "../assets/style.css";

const PostReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const carModelsUrl = `/djangoapp/get_cars/`;
  const addReviewUrl = `/djangoapp/add_review/`;

  const [carModels, setCarModels] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewSentiment, setReviewSentiment] = useState("neutral");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [selectedCar, setSelectedCar] = useState("");
  const [carYear, setCarYear] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedUserName = sessionStorage.getItem("username");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const fetchCarModels = async () => {
    try {
      const response = await fetch(carModelsUrl);
      if (!response.ok) throw new Error("Failed to fetch car models");
      const data = await response.json();
      const filteredCars = data.cars.filter((car) => car.dealer_id === parseInt(id));
      setCarModels(filteredCars || []);
    } catch (err) {
      console.error("Error fetching car models:", err);
    }
  };

  const addReview = async () => {
    if (!userName) {
      alert("You must be logged in to submit a review.");
      return;
    }

    if (!reviewText || !selectedCar || !purchaseDate || !carYear) {
      alert("All fields are mandatory!");
      return;
    }

    try {
      const reviewData = {
        review: reviewText,
        sentiment: reviewSentiment,
        name: userName,
        dealership: parseInt(id),
        purchase: true,
        purchase_date: purchaseDate,
        car_make: selectedCar.split(" ")[0],
        car_model: selectedCar.split(" ").slice(1).join(" "),
        car_year: carYear,
      };

      const response = await fetch(addReviewUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        navigate(`/dealer/${id}`); // Navigeeri tagasi Dealeri detailide lehele
      } else {
        console.error("Failed to add review.");
      }
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  useEffect(() => {
    fetchCarModels();
  }, []);

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div className="postreview_container">
        <h3>Add a Review</h3>
        <textarea
          placeholder="Write your review here..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <select value={reviewSentiment} onChange={(e) => setReviewSentiment(e.target.value)}>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
        />
        <select value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)}>
          <option value="">Select a car</option>
          {carModels.map((car, index) => (
            <option key={index} value={`${car.make} ${car.model}`}>
              {car.make} {car.model}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={carYear}
          onChange={(e) => setCarYear(e.target.value)}
          min="2000"
          max="2023"
        />
        <button onClick={addReview}>Submit Review</button>
      </div>
    </div>
  );
};

export default PostReview;
