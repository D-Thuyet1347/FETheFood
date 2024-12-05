import React, { useContext, useState, useEffect } from 'react';
import './SavedVouchers.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SavedVouchers = () => {
  const { setVoucherCode } = useContext(StoreContext);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherData, setVoucherData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const savedVouchers = JSON.parse(localStorage.getItem('vouchers')) || [];
    setVoucherData(savedVouchers);
  }, []);

  const handleFetchVoucherByCode = async () => {
    if (voucherCodeInput.trim() === '') {
      toast.error('Please enter a voucher code!');
      return;
    }

    const existingVoucher = voucherData.find((voucher) => voucher.code === voucherCodeInput);
    if (existingVoucher) {
      toast.error('This voucher has already been added!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/vouchers/code/${voucherCodeInput}`);
      if (response.ok) {
        const data = await response.json();
        const updatedData = [...voucherData, data];
        setVoucherData(updatedData);
        localStorage.setItem('vouchers', JSON.stringify(updatedData));
        setVoucherCodeInput(''); // Clear the input field
        toast.success('Voucher applied successfully!');
      } else {
        toast.error('Voucher does not exist in the system.');
      }
    } catch (error) {
      toast.error('An error occurred while connecting to the server.');
    }
  };

  const handleDeleteVoucher = (code) => {
    const toastId = toast(
      <div className="toast-confirmation">
        <p>Are you sure you want to delete this voucher?</p>
        <div className="button-group">
          <button
            className="confirm-button"
            onClick={() => {
              const updatedData = voucherData.filter((voucher) => voucher.code !== code);
              setVoucherData(updatedData);
              localStorage.setItem('vouchers', JSON.stringify(updatedData));
              toast.dismiss(toastId);
              toast.success('Voucher deleted successfully!');
            }}
          >
            Confirm
          </button>
          <button className="cancel-button" onClick={() => toast.dismiss(toastId)}>Cancel</button>
        </div>
      </div>,
      {
        position: 'top-right',
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  const handleUseVoucher = (code) => {
    console.log("Setting voucher code:", code); // Debug log
    setVoucherCode(code);
    toast.success('Voucher applied successfully!', {
      autoClose: 500,
      onClose: () => {
        const updatedData = voucherData.filter((voucher) => voucher.code !== code);
        setVoucherData(updatedData);
        localStorage.setItem('vouchers', JSON.stringify(updatedData));
        navigate('/cart');
      },
    });
  };

  return (
    <div className="saved-vouchers">
      <ToastContainer />
      <h1>My Vouchers</h1>

      <div className="voucher-search">
        <input
          style={{outline: 'none'}}
          type="text"
          value={voucherCodeInput}
          onChange={(e) => setVoucherCodeInput(e.target.value)}
          placeholder="Enter voucher code"
        />
        <button onClick={handleFetchVoucherByCode}>Add</button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {voucherData.length > 0 && (
        <div className="voucher-list">
          {voucherData.map((voucher, index) => (
            <div className="voucher-item" key={index}>
              <h2>{voucher.code}</h2>
              <p>Discount: {voucher.discount ? `${voucher.discount}%` : 'N/A'}</p>
              <p>
                Min Order Value: {voucher.minimumAmount ? `${voucher.minimumAmount.toLocaleString('vi-VN')} USD` : 'N/A'}
              </p>
              <p>
                Max Discount: {voucher.maximumDiscount ? `${voucher.maximumDiscount.toLocaleString('vi-VN')} USD` : 'N/A'}
              </p>
              <p>
                Valid From: {voucher.startDate ? new Date(voucher.startDate).toLocaleDateString() : 'N/A'} to{' '}
                {voucher.endDate ? new Date(voucher.endDate).toLocaleDateString() : 'N/A'}
              </p>
              <div className="voucher-actions">
                <button onClick={() => handleUseVoucher(voucher.code)}>Use</button>
                <button onClick={() => handleDeleteVoucher(voucher.code)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedVouchers;