import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const { id } = useParams();

  const dealer_url = `/djangoapp/dealer/${id}`;
  const review_url = `/djangoapp/add_review`;
  const carmodels_url = `/djangoapp/get_cars`;

  // Funktsioon ülevaate postitamiseks
  const postreview = async () => {
    let name = `${sessionStorage.getItem("firstname") || ""} ${
      sessionStorage.getItem("lastname") || ""
    }`.trim();
    if (name === "") {
      name = sessionStorage.getItem("username");
    }

    // Kontrollime vajalikke välju
    if (!review || !date || !year) {
      alert("Review, purchase date, and car year are mandatory");
      return;
    }

    let make_chosen = null;
    let model_chosen = null;

    if (model) {
      const model_split = model.split(" ");
      make_chosen = model_split[0];
      model_chosen = model_split[1];
    }

    const jsoninput = JSON.stringify({
      name,
      dealership: id,
      review,
      purchase: true,
      purchase_date: date,
      car_make: make_chosen || "",
      car_model: model_chosen || "",
      car_year: year,
    });

    try {
      const res = await fetch(review_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsoninput,
      });

      const json = await res.json();
      if (json.status === 200) {
        alert("Review posted successfully!");
        window.location.href = `/dealer/${id}`; // Suuname tagasi konkreetse dealeri ülevaadete juurde
      } else {
        alert(`Failed to post review: ${json.message}`);
      }
    } catch (error) {
      console.error("Error posting review:", error);
      alert("An error occurred while posting the review.");
    }
  };

  // Funktsioon dealeri andmete toomiseks
  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url, { method: "GET" });
      const retobj = await res.json();
      if (retobj.status === 200) {
        const dealerobjs = Array.isArray(retobj.dealer) ? retobj.dealer : [];
        if (dealerobjs.length > 0) {
          setDealer(dealerobjs[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching dealer:", error);
    }
  };

  // Funktsioon autode andmete toomiseks
  const get_cars = async () => {
    try {
      const res = await fetch(carmodels_url, { method: "GET" });
      const retobj = await res.json();
      if (retobj.CarModels) {
        setCarmodels(retobj.CarModels);
      }
    } catch (error) {
      console.error("Error fetching car models:", error);
    }
  };

  // Fetchime dealeri ja autode andmed
  useEffect(() => {
    get_dealer();
    get_cars();
  }, []);

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>{dealer.full_name}</h1>
        <textarea
          id="review"
          cols="50"
          rows="7"
          placeholder="Write your review here..."
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        <div className="input_field">
          Purchase Date{" "}
          <input type="date" onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="input_field">
          Car Make and Model (Optional)
          <select
            name="cars"
            id="cars"
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="" selected disabled hidden>
              Choose Car Make and Model
            </option>
            {carmodels.map((carmodel) => (
              <option key={carmodel.CarModel} value={`${carmodel.CarMake} ${carmodel.CarModel}`}>
                {carmodel.CarMake} {carmodel.CarModel}
              </option>
            ))}
          </select>
        </div>
        <div className="input_field">
          Car Year{" "}
          <input
            type="number"
            onChange={(e) => setYear(e.target.value)}
            max={2023}
            min={2015}
            placeholder="Enter year (e.g., 2023)"
          />
        </div>
        <div>
          <button className="postreview" onClick={postreview}>
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;
