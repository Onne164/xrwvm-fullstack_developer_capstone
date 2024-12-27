import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Lisatud useNavigate
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import Header from "../Header/Header";

const Dealer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reviewsUrl = `/djangoapp/reviews/dealer/${id}/`;
  const dealerUrl = `/djangoapp/dealer/${id}/`;

  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const senti_icon = (sentiment) => {
    if (sentiment === "positive") return positive_icon;
    if (sentiment === "negative") return negative_icon;
    return neutral_icon;
  };

  const fetchDealerDetails = async () => {
    try {
      const response = await fetch(dealerUrl);
      if (!response.ok) throw new Error("Dealer not found");
      const data = await response.json();
      setDealer(data.dealer || {});
    } catch (err) {
      console.error("Error fetching dealer:", err);
      setError("Dealer not found");
    }
  };

  const fetchDealerReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(reviewsUrl);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealerDetails();
    fetchDealerReviews();
  }, [reviewsUrl, dealerUrl]); // Uuendatakse automaatselt pärast andmete lisamist

  if (error) return <div>{error}</div>;

  return (
    <div style={{ margin: "20px" }}>
      <Header />
      <div style={{ marginTop: "10px" }}>
        <h1 style={{ color: "grey" }}>{dealer?.full_name || "Dealer Not Found"}</h1>
        <h4 style={{ color: "grey" }}>
          {dealer?.city}, {dealer?.address}, Zip - {dealer?.zip}, {dealer?.state}
        </h4>
        <button
          style={{
            backgroundColor: "#007BFF",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
          onClick={() => navigate(`/postreview/${id}`)} // Navigeeri arvustuse lisamise lehele
        >
          Write a Review
        </button>
      </div>

      <div className="reviews_panel" style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading Reviews...</p>
        ) : reviews.length === 0 ? (
          <div>No reviews yet!</div>
        ) : (
          reviews.map((review, index) => (
            <div
              className="review_panel"
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <img
                src={senti_icon(review.sentiment)}
                alt="Sentiment"
                style={{ width: "50px", marginRight: "15px" }}
              />
              <div>
                <p style={{ fontSize: "16px", fontWeight: "bold" }}>{review.review}</p>
                <p style={{ fontSize: "14px", color: "grey" }}>
                  {review.name} - {review.car_make} {review.car_model} {review.car_year}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
