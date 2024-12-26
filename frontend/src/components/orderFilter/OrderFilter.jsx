import React, { useEffect, useState } from 'react';
import { handleError } from '../../utils/utils';
import styles from './OrderFilter.module.css';
import moment from 'moment';

const OrderFilter = (props) => {
    const [dataSuppliers, setdataSuppliers] = useState([]);
    const [supplierTypes, setSupplierTypes] = useState([]);
    const [type, setType] = useState('');
    const [supplierId, setSupplier] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    useEffect(() => {
        const fetchdataSuppliers = async () => {
            try {
                const supplierProducts= "cement,concrete"
                const url = `http://localhost:8080/auth/company/data-supplier?supplierProducts=${supplierProducts}`;
                const headers = {
                    headers: {
                        'Authorization': localStorage.getItem('token'),
                    }
                };
                const response = await fetch(url, headers);
                const result = await response.json();
                setdataSuppliers(result); 
                setSupplierTypes([...new Set(result.map((supplier)=> {
                    return supplier.type
                }))]); 
            } catch (err) {
                handleError(err);
            }
        };
        fetchdataSuppliers();
    }, []);

    const submitFilter = async (e) => {
        e.preventDefault();
        try{
            const unixFromDate = fromDate && moment(fromDate).isValid() ? moment(fromDate).unix() : '';
            const unixToDate = toDate && moment(toDate).isValid() ? moment(toDate).unix() : '';
            await props.onFilter({ type, supplierId, fromDate: unixFromDate, toDate: unixToDate, selectedStatus });
        } catch (err) {
            handleError(err);
        }
    }

    return (
        <div className={styles.container}>
            <button
                className={styles.orderFilterToggleBtn}
                aria-expanded={isSidebarVisible}
                aria-label="Toggle navigation"
                onClick={toggleSidebar}
            >
                ☰ Filter
            </button>
            <aside className={`${styles.orderFilterAside} ${isSidebarVisible ? styles.active : ''}`}>
                <form className={styles.orderFilterForm}>
                    <h2 className={styles.orderFilterH2}>Filter Orders</h2>
                    {props.user === 'company' && (
                        <>
                            <label className={styles.orderFilterLabel}>
                                Type:
                                <select
                                    className={styles.orderFilterSelect}
                                    onChange={(e) => setType(e.target.value)}
                                    value={type}
                                >
                                    <option value="">All</option>
                                    {supplierTypes.map((type, index) => (
                                        <option key={index} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className={styles.orderFilterLabel}>
                                Supplier:
                                <select
                                    className={styles.orderFilterSelect}
                                    onChange={(e) => setSupplier(e.target.value)}
                                    value={supplierId}
                                >
                                    <option value="">All</option>
                                    {dataSuppliers.map((supplier, index) => (
                                        <option key={index} value={supplier.supplierId}>
                                            {supplier.supplierName}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </>
                    )}
                    {props.statuses && props.statuses.length > 0 && (
                        <label className={styles.orderFilterLabel}>
                            Status:
                            <select
                                className={styles.orderFilterSelect}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                value={selectedStatus}
                            >
                                <option value={props.statuses}>All</option>
                                {props.statuses.map((status, index) => (
                                    <option key={index} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <label className={styles.orderFilterLabel}>
                        Delivery Date From:
                        <input
                            className={styles.orderFilterInput}
                            type="date"
                            value={fromDate}
                            title='A date greater than or equal to the from date'
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </label>
                    <label className={styles.orderFilterLabel}>
                        Delivery Date To:
                        <input
                            className={styles.orderFilterInput}
                            type="date"
                            value={toDate}
                            title='A date less than or equal to the to date'
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </label>
                    <button className={styles.submitButton} onClick={(e) => {submitFilter(e)}}>Submit</button>
                </form>
            </aside>
        </div>
    );
};

export default OrderFilter;
