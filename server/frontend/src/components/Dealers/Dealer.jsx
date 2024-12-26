import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Lisatud useNavigate
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import Header from "../Header/Header";

const Dealer = () => {
  const { id } = useParams(); // Saame ID URL-ist
  const navigate = useNavigate(); // Lisatud navigate
  const reviewsUrl = `/djangoapp/reviews/dealer/${id}/`;
  const dealerUrl = `/djangoapp/dealer/${id}/`;

  const [dealer, setDealer] = useState(null); // Dealeri andmed
  const [reviews, setReviews] = useState([]); // Arvustused
  const [loading, setLoading] = useState(true); // Laadimise olek
  const [error, setError] = useState(""); // Veateade

  // Toob dealeri andmed
  const getDealerDetails = async () => {
    try {
      const response = await fetch(dealerUrl);
      if (!response.ok) throw new Error("Dealer not found");
      const data = await response.json();
      console.log("Fetched dealer data:", data);
      setDealer(data.dealer || {});
    } catch (err) {
      console.error("Error fetching dealer:", err);
      setError("Dealer not found");
    }
  };

  // Toob arvustused
  const getDealerReviews = async () => {
    console.log("Fetching reviews from URL:", reviewsUrl);
    try {
      setLoading(true); // Näitab laadimise olekut
      const response = await fetch(reviewsUrl);
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format");
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch reviews: ${errorText}`);
      }
      const data = await response.json();
      console.log("Fetched reviews data:", data);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]); // Tühjenda arvustused vea korral
    } finally {
      setLoading(false); // Lõpetab laadimise oleku
    }
  };

  // Laadi andmed pärast komponendi mountimist
  useEffect(() => {
    console.log("Dealer URL:", dealerUrl);
    console.log("Reviews URL:", reviewsUrl);
    getDealerDetails();
    getDealerReviews();
  }, []); // Käivitub ainult üks kord mountimisel

  const handleWriteReview = () => {
    navigate(`/postreview/${id}`);
  };

  // Kui ilmnes viga, kuvame selle
  if (error) return <div>{error}</div>;

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ color: "grey" }}>{dealer?.full_name || "Dealer Not Found"}</h1>
        <h4 style={{ color: "grey" }}>
          {dealer?.city}, {dealer?.address}, Zip - {dealer?.zip}, {dealer?.state}
        </h4>
        <button onClick={handleWriteReview}>Write a Review</button>
      </div>
      <div className="reviews_panel">
        {loading ? (
          <p>Loading Reviews....</p>
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div className="review_panel" key={index}>
              <img
                src={
                  review.sentiment === "positive"
                    ? positive_icon
                    : review.sentiment === "negative"
                    ? negative_icon
                    : neutral_icon
                }
                className="emotion_icon"
                alt="Sentiment"
              />
              <div className="review">{review.review}</div>
              <div className="reviewer">{review.name}</div>
            </div>
          ))
        ) : (
          <p>No reviews available for this dealer.</p>
        )}
      </div>
    </div>
  );
};

export default Dealer;
