import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const PlaceOrder = () => {
  const location = useLocation();
  const { voucherCode, voucherDiscount, maximumDiscount, note: cartNote } = location.state || {};
  const { getTotalCartAmount, token, url, food_list, cartItems } = useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    state: "",
    zipcode: "",
    address: "",
    phone: "",
    note: cartNote || "" // Initialize note with cartNote if available
  });

  const navigate = useNavigate();

  // Function to decode JWT token
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];  // Payload part of the token
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');  // Convert Base64 URL to standard Base64
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload); // Return JSON object containing user information
    } catch (e) {
      console.error("Error decoding token", e);
      return null;  // Return null if there's an error during decoding
    }
  };

  // Function to get userId from token in localStorage
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage with the name 'token'
    if (token) {
      const decodedToken = parseJwt(token); // Decode the token
      return decodedToken ? decodedToken.id : null; // Get user ID from the token
    }
    return null;
  };

  const userId = getUserIdFromToken(); // Get userId from token

  useEffect(() => {
    if (!userId) {
      toast.error('User not authenticated.');
      navigate('/cart');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${url}/api/user/${userId}`);
        if (response.data.success) {
          const userData = response.data.data;
          setData((prevData) => ({
            ...prevData,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            address: userData.address || '',
            state: userData.state || '',
            zipcode: userData.zipcode || '',
            phone: userData.phone || ''
          }));
        } else {
          toast.error('Failed to fetch user data.');
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while fetching user data.');
      }
    };

    fetchUserData();
  }, [userId, url, navigate]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send request to update user information
      const response = await axios.put(`${url}/api/user/update/${userId}`, data);
      if (response.data.success) {
        toast.success('Customer information updated successfully!');
      } else {
        toast.error('Failed to update customer information.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while updating the customer information.');
    }
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    await handleSubmit(event); // Update user information before placing the order

    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id]) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });
    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
      note: data.note // Include the note in the order data
    };

    let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
    if (response.data.success) {
      const { session_url } = response.data;
      window.location.replace(session_url);
    } else {
      toast.error("Error");
    }
  };

  const discountAmount = () => {
    const subtotal = getTotalCartAmount();
    const deliveryFee = subtotal === 0 ? 0 : 2;
    const discountAmount = Math.min((subtotal + deliveryFee) * (voucherDiscount / 100), maximumDiscount);
    return discountAmount;
  };

  const calculateTotal = () => {
    const subtotal = getTotalCartAmount();
    const deliveryFee = subtotal === 0 ? 0 : 2;
    const total = subtotal + deliveryFee - discountAmount();
    return total;
  };

  return (
    <form onSubmit={placeOrder} className='place-order'>
    <ToastContainer />  
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name='firstName'
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder='First name'
          />
          <input
            required
            name='lastName'
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder='Last name'
          />
        </div>
        <input
          required
          name='email'
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder='Email address'
        />
       
        <div className="multi-fields">
          <input
            required
            name='state'
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder='State'
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name='zipcode'
            onChange={onChangeHandler}
            value={data.zipcode}
            type="text"
            placeholder='Zip code'
          />
        </div>
        <input
          required
          name='phone'
          onChange={onChangeHandler}
          value={data.phone}
          type="text"
          placeholder='Phone'
        />
        <input
          required
          name='address'
          onChange={onChangeHandler}
          value={data.address}
          type="text"
          placeholder='address'
        />
        <div className="cart-note">
          <label htmlFor="note">Add a note to your order:</label>
          <textarea
            id="note"
            name="note"
            value={data.note}
            onChange={onChangeHandler}
            placeholder="Enter your note here..."
          ></textarea>
        </div>
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Voucher: ({voucherDiscount}%)</p>
              <p>${discountAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <p>${calculateTotal()}</p>
            </div>
            <hr />
            <div className="cart-note">
              <label htmlFor="note">Note:</label>
              <p>{data.note}</p>
            </div>
          </div>
          <button type='submit'>PROCESS TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;