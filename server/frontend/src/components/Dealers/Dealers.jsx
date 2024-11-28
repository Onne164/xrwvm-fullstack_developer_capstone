import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png";
const Dealers = () => {
  const [dealersList, setDealersList] = useState([]); // Hoiab dealerite nimekirja
  const [states, setStates] = useState([]); // Hoiab osariikide nimekirja
  const dealer_url = "/djangoapp/get_dealers/";

  // Funktsioon kõigi dealerite toomiseks
  const get_dealers = async () => {
    try {
      const res = await fetch(dealer_url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json(); // Fetchitud andmed
      console.log("Fetched dealers:", data);
  
      if (data.status === 200 && Array.isArray(data.dealers.dealerships)) {
        // Võtame kasutusele `dealerships` massiivi
        const validDealers = data.dealers.dealerships.filter(
          (dealer) => dealer && dealer.state
        );
        const uniqueStates = Array.from(
          new Set(validDealers.map((dealer) => dealer.state))
        );
        console.log("Unique States:", uniqueStates);
  
        setStates(uniqueStates); // Salvestame osariigid
        setDealersList(validDealers); // Salvestame dealerite nimekirja
      } else {
        console.error("Dealers data is not valid:", data.dealers);
        setStates([]);
        setDealersList([]);
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
    }
  };
  
  // Funktsioon dealerite filtreerimiseks osariigi järgi
  const filterDealers = async (state) => {
    try {
      const dealer_url_by_state = `/djangoapp/get_dealers/${state}`;
      const res = await fetch(dealer_url_by_state, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Filtered dealers:", data);
  
      if (data.status === 200 && Array.isArray(data.dealers.dealerships)) {
        setDealersList(data.dealers.dealerships);
      } else {
        console.error("No dealers found for state:", state);
        setDealersList([]);
      }
    } catch (error) {
      console.error("Error filtering dealers:", error);
      setDealersList([]); // Kui viga, tühjenda nimekiri
    }
  };
  
  
  // Fetch kõik dealerid, kui komponent mountitakse
  useEffect(() => {
    get_dealers();
  }, []);
  
  const isLoggedIn = !!sessionStorage.getItem("username");

  return(
    <div>
        <Header/>
  
       <table className='table'>
        <tr>
        <th>ID</th>
        <th>Dealer Name</th>
        <th>City</th>
        <th>Address</th>
        <th>Zip</th>
        <th>
              <select
                name="state"
                id="state"
                defaultValue=""
                onChange={(e) => filterDealers(e.target.value)}
              >
                <option value="All">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </th>
        {isLoggedIn ? (
            <th>Review Dealer</th>
           ):<></>
        }
        </tr>
        {dealersList.map(dealer => (
  <tr key={dealer.id}> {/* Lisatud key */}
    <td>{dealer['id']}</td>
    <td><a href={'/dealer/'+dealer['id']}>{dealer['full_name']}</a></td>
    <td>{dealer['city']}</td>
    <td>{dealer['address']}</td>
    <td>{dealer['zip']}</td>
    <td>{dealer['state']}</td>
    {isLoggedIn ? (
      <td><a href={`/postreview/${dealer['id']}`}><img src={review_icon} className="review_icon" alt="Post Review"/></a></td>
    ):<></>}
  </tr>
))}
       </table>;
    </div>
  )
  }
  export default Dealers;
  