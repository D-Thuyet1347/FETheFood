import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerInfo.css';

const CustomerInfo = () => {
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true); // Trạng thái loading
  const [error, setError] = useState(null); // Trạng thái lỗi

  // Hàm giải mã JWT token thủ công
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];  // Phần Payload của token
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');  // Chuyển đổi Base64 URL thành Base64 chuẩn
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload); // Trả về đối tượng JSON chứa thông tin người dùng
    } catch (e) {
      console.error("Error decoding token", e);
      return null;  // Nếu có lỗi trong quá trình giải mã, trả về null
    }
  };

  // Lấy userId từ token trong localStorage
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token'); // Giả sử token được lưu trong localStorage với tên 'token'
    if (token) {
      const decodedToken = parseJwt(token); // Giải mã token thủ công
      return decodedToken ? decodedToken.id : null; // Lấy ID người dùng từ token
    }
    return null;
  };

  const userId = getUserIdFromToken(); // Lấy userId từ token

  // Lấy thông tin người dùng khi component mount
  useEffect(() => {
    if (!userId) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/${userId}`);
        if (response.data.success) {
          setCustomerData(response.data.data); // Gán thông tin người dùng vào state
        } else {
          setError('Failed to fetch user data.');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching user data.');
      } finally {
        setLoading(false); // Dừng trạng thái loading
      }
    };

    fetchUserData();
  }, [userId]);

  // Xử lý thay đổi input (chỉ cho phép chỉnh sửa các trường ngoại trừ email)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') return; // Không cho phép chỉnh sửa email
    setCustomerData({ ...customerData, [name]: value });
  };

  // Xử lý cập nhật thông tin
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gửi request cập nhật thông tin
      const response = await axios.put(`http://localhost:4000/api/user/update/${userId}`, customerData);
      if (response.data.success) {
        alert('Customer information updated successfully!');
      } else {
        alert('Failed to update customer information.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating the customer information.');
    }
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (loading) {
    return <p>Loading user data...</p>;
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="customer-info">
  <h1>Customer Information</h1>
  <form onSubmit={handleSubmit}>
    <label>
      First Name:
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={customerData.firstName}
        onChange={handleChange}
        required
      />
    </label>
    <label>
      Last Name:
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={customerData.lastName}
        onChange={handleChange}
        required
      />
    </label>
    <label>
      Email:
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={customerData.email}
        disabled={true} // Không cho phép sửa email
        required
      />
    </label>
    <label>
      Phone:
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={customerData.phone}
        onChange={handleChange}
        required
        pattern="[0-9]{10}" // Chỉ cho phép nhập số (10 chữ số)
        title="Phone number must be 10 digits"
      />
    </label>
    <label>
      Address:
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={customerData.address}
        onChange={handleChange}
        required
      />
    </label>
    <button type="submit">Update</button>
  </form>
</div>

  );
};

export default CustomerInfo;
