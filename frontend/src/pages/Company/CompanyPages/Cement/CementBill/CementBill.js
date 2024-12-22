import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";
import { handleError, handleSuccess } from '../../../../../utils/utils';
import { ToastContainer } from 'react-toastify';
import styles from './CementBill.module.css';
import Navbar from '../../../../../components/navbar/Navbar';
import Footer from '../../../../../components/footer/Footer';

function CementBill() {

    const token = localStorage.getItem("token");
    const decodedData = jwtDecode(token);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const amountOfCement = queryParams.get('amountOfCement');
    const supplierName = queryParams.get('supplierName');
    const price = queryParams.get('price');

    const [currentDateTime, setCurrentDateTime] = useState("");
    const [cementBillInfo, setCementBillInfo] = useState({
        type: 'cement',
        recipientName: '',
        recipientPhone: '',
        location: '',
        deliveryTime: '',
        orderRequestTime: new Date().toLocaleString('en-GB', {hour12: true}).replace(',', ''),
        cementQuantity: amountOfCement,
        cementNumberBags: amountOfCement * 20,
        price: (amountOfCement * 20 * price).toFixed(2),
        supplierName: supplierName
    });

    const navigate = useNavigate();

    const handleLogout = (e) => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        handleSuccess('User Loggedout');
        setTimeout(() => {
            navigate('/company-login');
        }, 500)
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const copyCementBillInfo = { ...cementBillInfo };
        copyCementBillInfo[name] = value;
        setCementBillInfo(copyCementBillInfo);
    }

    // Phone منع ادخال احرف مثلا في ال 
    const handleKeyPress = (e) => {
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault(); // منع الإدخال إذا لم يكن رقماً
            handleError('Numbers only! Letters are not allowed');
        }
    };
    
    // Phone validation: Phone number must start with 077, 078, or 079 and be followed by 7 digits
    const handlePhoneValidation = (value) => {
        if (value.length !== 10) {
            handleError('Phone number must be exactly 10 digits long.');
            return false;
        }
    
        if (!/^(077|078|079)[0-9]{7}$/.test(value)) {
            handleError('Phone number must start with 077, 078, or 079 and be followed by 7 digits.');
            return false;
        }
    
        return true;
    };

    const handleCementBill = async (e) => {
        e.preventDefault();
        // تحديد الحقول المطلوبة
        const requiredFields = ['recipientName', 'recipientPhone', 'location', 'deliveryTime'];

        // التحقق من وجود الحقول المطلوبة
        const missingFields = requiredFields.filter(field => !cementBillInfo[field]);

        if (missingFields.length > 0) {
            return handleError(`The following fields are required: ${missingFields.join(', ')}`);
        }

       // التحقق من صحة رقم الهاتف
        if (!handlePhoneValidation(cementBillInfo.recipientPhone)) {
            return;
        }

        // Format deliveryTime to match the desired format
        const formatDateTime = (dateTime) => {
            return new Date(dateTime).toLocaleString('en-GB', {hour12: true}).replace(',', '');
        };
        const formattedDeliveryTime = formatDateTime(cementBillInfo.deliveryTime);
        const cementBillData = {
            ...cementBillInfo,
            deliveryTime: formattedDeliveryTime, // Update deliveryTime format
        };

        try {
            const url = `http://localhost:8080/auth/company/cement-order`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cementBillData)
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/company/home/pending-orders')
                }, 500)
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
            console.log(result);
        } catch (error) {
            handleError(error);
        }
    }

    useEffect(() => {
        // تحديث الوقت الحالي بالتنسيق المطلوب
        const updateCurrentDateTime = () => {
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16); // استخدم التنسيق المناسب لحقل datetime-local
            setCurrentDateTime(localDateTime);
        };

        updateCurrentDateTime(); // تحديث الوقت الحالي عند تحميل الصفحة

        const interval = setInterval(updateCurrentDateTime, 60000); // تحديث كل دقيقة

        return () => clearInterval(interval); // تنظيف الـ interval عند الخروج
    }, []);

    return(
        <section className={styles.cementBillBody}>
            <Navbar 
                one="Home"
                pathOne="/company/home"
                two="Orders"
                two1="Under preparing orders"
                pathTwo1="/company/home/under-preparing-orders"
                two2="Pending orders"
                pathTwo2="/company/home/pending-orders"
                two3="Old orders"
                pathTwo3="/company/home/old-orders"
                three="Cement"
                pathThree="/company/home/cement-order"
                four="Concrete"
                pathFour="/company/home/concrete-order"
                five="Profile"
                pathFive="/company/home/profile"
                logout={handleLogout}
            />
            
            <div className={styles.cementBillContainer}>
                <div className={styles.cementBillRow}>
                    <h1 className={styles.cementBillH1}>Cement Bill</h1>
                    <form className={styles.cementBillForm} onSubmit={handleCementBill} >
                        <div className={styles.cementBillDiv}>
                            <p className={styles.cementBillP}><strong>Company name:</strong> {decodedData.companyName}</p>
                        </div>
                        <div className={styles.cementBillDiv}>
                            <p className={styles.cementBillP}><strong>Company phone:</strong> {decodedData.companyPhone}</p>
                        </div>
                        <div className={styles.cementBillDiv}>
                            <label className={styles.cementBillLabel} htmlFor='recipientName'><strong>Recipient's name</strong></label>
                            <input
                                className={styles.cementBillInput}
                                onChange={handleChange}
                                type='text'
                                name='recipientName'
                                placeholder="Enter the recipient's name"
                                value={cementBillInfo.recipientName}
                                autoFocus
                            />
                        </div>
                        <div className={styles.cementBillDiv}>
                            <label className={styles.cementBillLabel} htmlFor='recipientPhone'><strong>Recipient's phone</strong></label>
                            <input
                                className={styles.cementBillInput}
                                onChange={handleChange}
                                onKeyPress={handleKeyPress}
                                onBlur={(e) => handlePhoneValidation(e.target.value)}
                                type='tel'
                                name='recipientPhone'
                                inputMode="numeric" 
                                maxLength="10"
                                placeholder="Enter the recipient's phone"
                                value={cementBillInfo.recipientPhone}
                            />
                        </div>
                        <div className={styles.cementBillDiv}>
                            <label className={styles.cementBillLabel} htmlFor='location'><strong>Location</strong></label>
                            <input
                                className={styles.cementBillInput}
                                onChange={handleChange}
                                type='text'
                                name='location'
                                placeholder='ex:Governorate/City/Area/Neighborhood/Street Name'
                                value={cementBillInfo.location}
                            />
                        </div>
                        <div className={styles.cementBillDiv}>
                            <label className={styles.cementBillLabel} htmlFor='deliveryTime'><strong>Delivery time</strong></label>
                            <input
                                className={styles.cementBillInputTime}
                                onChange={handleChange}
                                type='datetime-local'
                                name='deliveryTime'
                                min={currentDateTime}
                                value={cementBillInfo.deliveryTime}
                            />
                        </div>
                        <div className={styles.cementBillDiv}>
                            <p className={styles.cementBillP}><strong>Quantity is:<br /></strong> {amountOfCement} ton</p>
                        </div>
                        <div className={styles.cementBillDiv}>
                            <p className={styles.cementBillP}><strong>Number of bags:<br /></strong> {amountOfCement * 20} bags</p>
                        </div>
                        <div className={styles.cementBillDiv}>
                            <p className={styles.cementBillP}><strong>The price:<br /></strong> {(amountOfCement * 20 * price).toFixed(2)} JD</p>
                        </div>
                        <div className={styles.cementBillDiv}>
                            <p className={styles.cementBillP}><strong>Supplier name:<br /></strong> {supplierName} </p>
                        </div>
                        <button className={styles.cementBillButton} type='submit'>Confirm Order</button>
                    </form>
                </div>
            </div>

            <Footer 
                one="Home"
                pathOne="/company/home"
                two="Orders"
                two1="Under preparing orders"
                pathTwo1="/company/home/under-preparing-orders"
                two2="Pending orders"
                pathTwo2="/company/home/pending-orders"
                two3="Old orders"
                pathTwo3="/company/home/old-orders"
                three="Cement"
                pathThree="/company/home/cement-order"
                four="Concrete"
                pathFour="/company/home/concrete-order"
                five="Profile"
                pathFive="/company/home/profile"
                logout={handleLogout}
            />
            <ToastContainer />
        </section>
    );
}

export default CementBill;
