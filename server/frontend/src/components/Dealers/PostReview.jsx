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
  const [error, setError] = useState(""); // Veateadete jaoks
  const [loading, setLoading] = useState(false); // Laadimise oleku jaoks

  let curr_url = window.location.href;
  let root_url = curr_url.substring(0, curr_url.indexOf("postreview"));
  let params = useParams();
  let id = params.id;
  let dealer_url = root_url + `djangoapp/dealer/${id}/`;
  let review_url = root_url + `djangoapp/add_review/`;
  let carmodels_url = root_url + `djangoapp/get_cars/`;

  // Funktsioon arvustuse postitamiseks
  const postreview = async () => {
    setLoading(true); // Laadimise oleku käivitamine
    setError(""); // Tühjendame veateate
    let name = sessionStorage.getItem("firstname") + " " + sessionStorage.getItem("lastname");
    if (name.includes("null")) {
      name = sessionStorage.getItem("username");
    }

    if (!model || !review || !date || !year) {
      alert("All details are mandatory");
      setLoading(false);
      return;
    }

    let model_split = model.split(" ");
    let make_chosen = model_split[0];
    let model_chosen = model_split.slice(1).join(" "); // Juhul, kui mudel sisaldab rohkem kui ühte sõna

    let jsoninput = JSON.stringify({
      "name": name,
      "dealership": id,
      "review": review,
      "purchase": true,
      "purchase_date": date,
      "car_make": make_chosen,
      "car_model": model_chosen,
      "car_year": year,
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
        window.location.href = `${window.location.origin}/dealer/${id}`;
      } else {
        setError("Failed to submit review: " + (json.message || "Unknown error"));
      }
    } catch (err) {
      setError("An unexpected error occurred while submitting review.");
      console.error(err);
    } finally {
      setLoading(false); // Lõpetame laadimise
    }
  };

  // Funktsioon dealeri andmete toomiseks
  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url);
      if (!res.ok) throw new Error("Failed to fetch dealer data");
      const retobj = await res.json();

      if (retobj.status === 200) {
        setDealer(retobj.dealer);
      }
    } catch (err) {
      setError("Failed to load dealer data.");
      console.error(err);
    }
  };

  // Funktsioon automudelite toomiseks
  const get_cars = async () => {
    try {
      const res = await fetch(carmodels_url);
      if (!res.ok) throw new Error("Failed to fetch car models");
      const retobj = await res.json();

      if (retobj.cars) {
        // Filtreerime autod vastavalt praeguse dealer_id alusel
        const filteredCars = retobj.cars.filter(car => car.dealer_id === parseInt(id));
        setCarmodels(filteredCars);
      }
    } catch (err) {
      setError("Failed to load car models.");
      console.error(err);
    }
  };

  useEffect(() => {
    get_dealer();
    get_cars();
  }, []);

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>{dealer?.full_name || "Dealer Name"}</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <textarea
          id="review"
          cols="50"
          rows="7"
          placeholder="Write your review here..."
          onChange={(e) => setReview(e.target.value)}
        ></textarea>

        <div className="input_field">
          <label>
            Purchase Date
            <input type="date" onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <div className="input_field">
          <label>
            Car Make & Model
            <select
              name="cars"
              id="cars"
              onChange={(e) => setModel(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Choose Car Make and Model
              </option>
              {carmodels.map((car, index) => (
                <option key={index} value={`${car.make} ${car.model}`}>
                  {car.make} {car.model} ({car.year})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="input_field">
          <label>
            Car Year
            <input
              type="number"
              max={2023}
              min={2015}
              onChange={(e) => setYear(e.target.value)}
            />
          </label>
        </div>

        <div>
          {loading ? (
            <p>Submitting your review...</p>
          ) : (
            <button className="postreview" onClick={postreview}>
              Post Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostReview;
