import React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Manager/Manager.css";
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Manager() {

  //Reports
  const [showReportModal, setShowReportModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("Missing");
  
  // Managment modals
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);

  // Router navigation
  const navigate = useNavigate();

  // Navigate back to the top-level login page (App shows login UI when pathname === '/')
  const handleSignOut = () => navigate('/');

  //modal to confirm sign out
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const [salesData, setSalesData] = useState({
    labels: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    datasets: [
      {
        data: Array(12).fill(0),
        borderColor: "red",
        backgroundColor: "red",
      },
    ],
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'This Years Sales',
      },
    },
  };

  const getUser = async () => {
    console.log("Getting user");
    // include credentials so session cookie is sent with the request
    const response = await fetch("/api/get-user", { credentials: 'include' });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
      setEmployeeName("Missing, Error" );
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
      setEmployeeName("Missing, Error response null");
    }
    else {
      const newData = await response.json();
      console.log(newData);
      // `newData.user` is an object { username, isEmployee } — store the username string
      const username = newData && newData.user && newData.user.username ? newData.user.username : null;
      setEmployeeName(username);
    }
  }

  const getSalesData = async () => {
    console.log("Getting Sales Data");
    const response = await fetch("/api/get-sales-data");
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(newData);
      const newSalesData = newData.sales;
      console.log(newSalesData);
      setSalesData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: newSalesData, // array from backend
        },
      ],
    }));
    }
  }

  useEffect(() => {
    getUser();
    getSalesData();
  }, []);

  /* ---------------------- Reports Variables and Funtions Start --------------------- */
  const date = new Date();
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const data = useMemo(() => tableData, [tableData]);
  const columns = useMemo(() => tableColumns, [tableColumns]);
  const coreRowModel = useMemo(() => getCoreRowModel(), []);
  const [rowSelection, setRowSelection] = useState({});
  const [labelValue, setLabel] = useState('');

// const table = useReactTable({
//     data,
//     columns,
//     state: {
//       rowSelection,
//     },
//     onRowSelectionChange: setRowSelection,
//     enableRowSelection: true,           // 🔥 REQUIRED
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//   });

  const table = useReactTable({ data, columns, state: {rowSelection}, getCoreRowModel: coreRowModel, onRowSelectionChange: setRowSelection, enableRowSelection: true});
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const generateXReport = async () => {
    console.log("X");
    const response = await fetch("/api/x-report-data");
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      setTableColumns([{ accessorKey: "hour", header: "Hour", cell: info => info.getValue() },
      { accessorKey: "sales", header: "Sales", cell: info => info.getValue() }]);
      console.log(JSON.stringify(newData));
      if (newData.length == null && newData.sales == 0) {
        setLabel('No transactions today or Z-Report cleared data');
      }
      else {
        setLabel('');
      }
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  const generateZReport = async () => {
    console.log("Z");
    const response = await fetch("/api/z-report-data");
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      setTableColumns([{ accessorKey: "hour", header: "Hour", cell: info => info.getValue() },
      { accessorKey: "sales", header: "Sales", cell: info => info.getValue() }]);
      console.log(JSON.stringify(newData));
      if (newData.length == null && newData.sales == 0) {
        setLabel('No transactions today');
      }
      else {
        setLabel('');
      }
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  const generateRestockReport = async () => {
    console.log("restock")
    const response = await fetch("/api/restock-report-data");
    if (!response.ok) {
      console.log("Error in function call");
      setLabel('Error getting data');
    }
    else if (response == null) {
      console.log("Error getting data");
      setLabel('Error getting data');
    }
    else {
      const newData = await response.json();
      setTableColumns([{ accessorKey: "itemid", header: "ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "quantity", header: "Quantity", cell: info => info.getValue() }]);
      console.log(JSON.stringify(newData));
      if (newData.length == null && newData.itemid == 0) {
        setLabel('All items above minimum stock');
      }
      else {
        setLabel('');
      }
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

    const generateSalesReport = async () => {
    console.log("sales")
    const response = await fetch("/api/sales-report-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime, endTime }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      setTableColumns([{ accessorKey: "menuid", header: "ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "sales", header: "Sales", cell: info => info.getValue() }]);
      let code = 0;
      if (newData.length == null) {
        code = newData.code;
      }
      else {
        code = newData[0].code;
      }
      console.log(JSON.stringify(newData));
      let label = '';
      if ((code >> 12) & 1 == 1) {
        label = 'Error connecting to backend';
      }
      else if ((code >> 11) & 1 == 1) {
        label = 'Error completing query';
      }
      else {
        if ((code >> 10) & 1 == 1) {
          label = 'No data found for given time range';
        }
        if ((code >> 9) & 1 == 1) {
          if (label == '') {
            label += 'cannot find start year, using current year';
          }
          else {
            label += ', cannot find start year, using current year';
          }
        }
        else if ((code >> 8) & 1 == 1) {
          if (label == '') {
            label += 'cannot find start month, using current month';
          }
          else {
            label += ', cannot find start month, using current month';
          }
        }
        else if ((code >> 7) & 1 == 1) {
          if (label == '') {
            label += 'cannot find start day, using current day';
          }
          else {
            label += ', cannot find start day, using current day';
          }
        }
        if ((code >> 4) & 1 == 1) {
          if (label == '') {
            label += 'cannot find end year, using current year';
          }
          else {
            label += ', cannot find end year, using current year';
          }
        }
        else if ((code >> 3) & 1 == 1) {
          if (label == '') {
            label += 'cannot find end month, using current month';
          }
          else {
            label += ', cannot find end month, using current month';
          }
        }
        else if ((code >> 2) & 1 == 1) {
          if (label == '') {
            label += 'cannot find end day, using current day';
          }
          else {
            label += ', cannot find end day, using current day';
          }
        }
      }
      setLabel(label);
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  const generateProductUsageReport = async () => {
    console.log("product usage")
    const response = await fetch("/api/product-usage-report-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime, endTime }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      setTableColumns([{ accessorKey: "inventoryid", header: "ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "sales", header: "Sales", cell: info => info.getValue() }]);
      let code = 0;
      if (newData.length == null) {
        code = newData.code;
      }
      else {
        code = newData[0].code;
      }
      console.log(JSON.stringify(newData));
      let label = '';
      if ((code >> 12) & 1 == 1) {
        label = 'Error connecting to backend';
      }
      else if ((code >> 11) & 1 == 1) {
        label = 'Error completing query';
      }
      else {
        if ((code >> 10) & 1 == 1) {
          label = 'No data found for given time range';
        }
        if ((code >> 9) & 1 == 1) {
          if (label == '') {
            label += 'cannot find start year, using current year';
          }
          else {
            label += ', cannot find start year, using current year';
          }
        }
        else if ((code >> 8) & 1 == 1) {
          if (label == '') {
            label += 'cannot find start month, using current month';
          }
          else {
            label += ', cannot find start month, using current month';
          }
        }
        else if ((code >> 7) & 1 == 1) {
          if (label == '') {
            label += 'cannot find start day, using current day';
          }
          else {
            label += ', cannot find start day, using current day';
          }
        }
        if ((code >> 4) & 1 == 1) {
          if (label == '') {
            label += 'cannot find end year, using current year';
          }
          else {
            label += ', cannot find end year, using current year';
          }
        }
        else if ((code >> 3) & 1 == 1) {
          if (label == '') {
            label += 'cannot find end month, using current month';
          }
          else {
            label += ', cannot find end month, using current month';
          }
        }
        else if ((code >> 2) & 1 == 1) {
          if (label == '') {
            label += 'cannot find end day, using current day';
          }
          else {
            label += ', cannot find end day, using current day';
          }
        }
      }
      setLabel(label);
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  const handleShowReportModal = async () => {
    setShowReportModal(false);
  }
  /* ---------------------- Reports Variables and Funtions End ------------------------ */



  /* ---------------------- Employee Variables and Funtions Start --------------------- */
  const [employeeId, setEmployeeId] = useState('');
  const [employeeNewName, setEmployeeNewName] = useState('');
  const [employeeRole, setEmployeeRole] = useState('');
  const [employeeWage, setEmployeeWage] = useState('');
  const [employeeIsManager, setEmployeeIsManager] = useState('');
  const [employeeUsername, setEmployeeUsername] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [errorLabel, setErrorLabel] = useState(() => '');


  const getEmployeeData = async () => {
    console.log("employee data");
    const response = await fetch("/api/employee-data");
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      setTableColumns([{ accessorKey: "employeeid", header: "Employee ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "role", header: "Role", cell: info => info.getValue() },
      { accessorKey: "wage", header: "Wage", cell: info => info.getValue() },
      { accessorKey: "ismanager", header: "Manager?", cell: info => info.getValue() },
      { accessorKey: "email", header: "Email", cell: info => info.getValue() },
      { accessorKey: "username", header: "Username", cell: info => info.getValue() },
      { accessorKey: "password", header: "Password", cell: info => info.getValue() }]);
      console.log(JSON.stringify(newData));
      if (newData.error == 0) {
        setErrorLabel('No Employees');
      }
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
      table.setPageSize(newData.length + 1);
    }
  }

  const addEmployee = async () => {
    console.log("add employee");
    const response = await fetch("/api/add-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, employeeNewName, employeeRole, employeeWage, employeeIsManager, employeeUsername, employeeEmail, employeePassword }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(JSON.stringify(newData));
      console.log(newData.error);
      getEmployeeData();
      switch (newData.error) {
        case -2:
          setErrorLabel("Failed to connect to backend");
          break;
        case -1:
          setErrorLabel("Error adding employee");
          break;
        case 0:
          setErrorLabel("Employee already exists");
          break;
        case 1:
          setErrorLabel("Employee ID not found");
          break;
        case 2:
          setErrorLabel("Non-number character found in Employee ID");
          break;
        case 3:
          setErrorLabel("Name not found");
          break;
        case 4:
          setErrorLabel("Role not found");
          break;
        case 5:
          setErrorLabel("Wage not found");
          break;
        case 6:
          setErrorLabel("Multiple decimals found in wage");
          break;
        case 7:
          setErrorLabel("Invalid character found in wage");
          break;
        case 8:
          setErrorLabel("Manager privileges not found");
          break;
        case 9:
          setErrorLabel("Failes to parse manager privileges, please enter \"yes\" or \"no\"");
          break;
        case 10:
          setErrorLabel("Username not found");
          break;
        case 11:
          setErrorLabel("Email not found");
          break;
        case 12:
          setErrorLabel("Multiple \"@\" found in email");
          break;
        case 13:
          setErrorLabel("Dot found before \"@\" in email");
          break;
        case 14:
          setErrorLabel("Dot not found or only at end of email");
          break;
        case 15:
          setErrorLabel("Password not strong enough, must be at least 16 characters");
          break;
        case 16:
          setErrorLabel("Password not strong enough, upper case character not found");
          break;
        case 17:
          setErrorLabel("Password not strong enough, number not found");
          break;
        case 18:
          setErrorLabel("Password not strong enough, special character not found");
          break;
        case 19:
          setErrorLabel("\"@\" not found in email");
          break;
        case 20:
          setErrorLabel("Dot not found, at end of email, or immediately following \'@\'");
          break;
        case 55:
          setErrorLabel("");
          break;
      }
    }
  }

  const removeEmployee = async () => {
    console.log("Removing Employee");
    const response = await fetch("/api/remove-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, rowSelection }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(newData);
      getEmployeeData();
      setRowSelection([]);
      if (newData.error == -2) {
        setErrorLabel("Failed to connect to backend");
      }
      else if (newData.error == -1) {
        setErrorLabel("Error removing employee");
      }
      else if (newData.error == 0) {
        setErrorLabel("Employee not found");
      }
      else if (newData.error == 1) {
        setErrorLabel("Employee ID not found");
      }
      else if (newData.error == 2) {
        setErrorLabel("Non-numeric character found in Employee ID");
      }
      else {
        setErrorLabel("");
      }
    }
  }

  const updateEmployee = async () => {
    console.log("update employee");
    console.log(rowSelection);
    const response = await fetch("/api/update-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, employeeNewName, employeeRole, employeeWage, employeeIsManager, employeeUsername, employeeEmail, employeePassword, rowSelection }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(newData);
      getEmployeeData();
      switch (newData.error) {
        case -2:
          setErrorLabel("Failed to connect to backend");
          break;
        case -1:
          setErrorLabel("Error updating employee");
          break;
        case 0:
          setErrorLabel("Employee not found");
          break;
        case 1:
          setErrorLabel("Multiple decimals found in wage");
          break;
        case 2:
          setErrorLabel("Invalid character found in wage");
          break;
        case 3:
          setErrorLabel("Failes to parse manager privileges, please enter \"yes\" or \"no\"");
          break;
        case 4:
          setErrorLabel("Multiple \"@\" found in email");
          break;
        case 5:
          setErrorLabel("Dot found before \"@\" in email");
          break;
        case 6:
          setErrorLabel("Dot not found or only at end of email");
          break;
        case 7:
          setErrorLabel("Password not strong enough, must be at least 16 characters");
          break;
        case 8:
          setErrorLabel("Password not strong enough, upper case character not found");
          break;
        case 9:
          setErrorLabel("Password not strong enough, number not found");
          break;
        case 10:
          setErrorLabel("Password not strong enough, special character not found");
          break;
        case 11:
          setErrorLabel("\"@\" not found in email");
          break;
        case 12:
          setErrorLabel("Dot not found, at end of email, or immediately following \'@\'");
          break;
        case 13:
          setErrorLabel("No employees selected");
          break;
        case 14:
          setErrorLabel("Non-numeric character found in Employee id");
          break;
        case 15:
          setErrorLabel("Employee id not found");
          break;
        case 55:
          setErrorLabel("");
          break;
      }
    }
  }
  /* ---------------------- Employee Variables and Funtions End ----------------------- */



  /* ---------------------- Menu Variables and Funtions Start ------------------------- */
  const [menuId, setMenuId] = useState('');
  const [menuName, setMenuName] = useState('');
  const [menuType, setMenuType] = useState('');
  const [menuCalories, setMenuCalories] = useState('');
  const [menuAllergies, setMenuAllergies] = useState('');
  const [menuPriceMod, setMenuPriceMod] = useState('');
  const [menuInventoryIds, setMenuInventoryIds] = useState('');
  const [showImageDownloadModal, setShowImageDownloadModal] = useState(false);

  const getMenuData = async () => {
    console.log("menu data");
    const response = await fetch("/api/menu-data");
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      setTableColumns([{ accessorKey: "menuid", header: "Menu ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "type", header: "Type", cell: info => info.getValue() },
      { accessorKey: "calories", header: "Calories", cell: info => info.getValue() },
      { accessorKey: "allergies", header: "Allergies", cell: info => info.getValue() },
      { accessorKey: "pricemod", header: "Price Modifier", cell: info => info.getValue() },
      { accessorKey: "inventoryids", header: "Inventory ID's", cell: info => info.getValue() }]);
      console.log(JSON.stringify(newData));
      if (newData.error == -2) {
        setErrorLabel("Failed to connect to backend");
      }
      else if (newData.error == -1) {
        setErrorLabel("Error removing menu item");
      }
      else if (newData.error == 0) {
        setErrorLabel("No menu item");
      }
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  const addMenu = async () => {
    console.log("add menu");
    const response = await fetch("/api/add-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId, menuName, menuType, menuCalories, menuAllergies, menuPriceMod, menuInventoryIds }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(JSON.stringify(newData));
      console.log(newData.error);
      setReplace(false);
      getMenuData();
      switch (newData.error) {
        case -2:
          setErrorLabel("Failed to connect to backend");
          break;
        case -1:
          setErrorLabel("Error adding menu item");
          break;
        case 0:
          setErrorLabel("Menu ID already exists");
          break;
        case 1:
          setErrorLabel("Menu ID not found");
          break;
        case 2:
          setErrorLabel("Non-numeric character found in Menu ID");
          break;
        case 3:
          setErrorLabel("Name not found");
          break;
        case 4:
          setErrorLabel("Type not found");
          break;
        case 5:
          setErrorLabel("Price Modifier not found");
          break;
        case 6:
          setErrorLabel("Multiple decimals found in price modifier");
          break;
        case 7:
          setErrorLabel("Non-numeric character found in price modifier");
          break;
        case 8:
          setErrorLabel("Inventory IDs not found");
          break;
        case 9:
          setErrorLabel("Illegal character found in inventory IDs");
          break;
        case 10:
          setErrorLabel("Calories not found");
          break;
        case 11:
          setErrorLabel("Non-numeric character found in calories");
          break;
        case 12:
          setErrorLabel("Allergies not found");
          break;
        case 55:
          setErrorLabel("");
          setShowImageDownloadModal(true);
          break;
      }
    }
  }

  const removeMenu = async () => {
    console.log("Removing Menu");
    const response = await fetch("/api/remove-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId, rowSelection }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(newData);
      setRowSelection([]);
      getMenuData();
      if (newData.error == -2) {
        setErrorLabel("Failed to connect to backend");
      }
      else if (newData.error == -1) {
        setErrorLabel("Error removing menu item");
      }
      else if (newData.error == 0) {
        setErrorLabel("Menu item not found");
      }
      else if (newData.error == 1) {
        setErrorLabel("Menu ID not found");
      }
      else if (newData.error == 2) {
        setErrorLabel("Non-numeric character found in Menu ID");
      }
      else {
        setErrorLabel("");
      }
    }
  }

  const updateMenu = async () => {
    console.log("update menu");
    const response = await fetch("/api/update-menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuId, menuName, menuType, menuCalories, menuAllergies, menuPriceMod, menuInventoryIds, rowSelection }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(newData);
      setReplace(true);
      setShowImageDownloadModal(true);
      getMenuData();
      switch (newData.error) {
        case -2:
          setErrorLabel("Failed to connect to backend");
          break;
        case -1:
          setErrorLabel("Error updating menu item");
          break;
        case 0:
          setErrorLabel("Menu item doesn't exit");
          break;
        case 1:
          setErrorLabel("Menu ID not found");
          break;
        case 2:
          setErrorLabel("Non-numeric character found in Menu ID");
          break;
        case 3:
          setErrorLabel("Multiple decimals found in price modifier");
          break;
        case 4:
          setErrorLabel("Non-numeric character found in price modifier");
          break;
        case 5:
          setErrorLabel("Illegal character found in inventory IDs");
          break;
        case 6:
          setErrorLabel("Non-numeric character found in calories");
          break;
        case 15:
          setErrorLabel("Menu id not found");
          break;
        case 55:
          setErrorLabel("");
          break;
      }
    }
  }
  /* ---------------------- Menu Variables and Funtions End --------------------------- */




  /* ---------------------- Inventory Variables and Funtions Start -------------------- */
  const [inventoryId, setInventoryId] = useState('');
  const [inventoryItems, setInventoryItems] = useState('');
  const [inventoryQuantity, setInventoryQuantity] = useState('');
  const [inventoryMaxStock, setInventoryMaxStock] = useState('');
  const [inventoryMinStock, setInventoryMinStock] = useState('');

  const getInventoryData = async () => {
    console.log("inventory data");
    const response = await fetch("/api/inventory-data");
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(newData.stringify);
      setTableColumns([{ accessorKey: "inventoryid", header: "Inventory ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "quantity", header: "Quantity", cell: info => info.getValue() },
      { accessorKey: "minstock", header: "Minimum Stock", cell: info => info.getValue() },
      { accessorKey: "maxstock", header: "Maximum Stock", cell: info => info.getValue() }]);
      console.log(JSON.stringify(newData));
      if (newData.error == -2) {
        setErrorLabel("Failed to connect to backend");
      }
      else if (newData.error == -1) {
        setErrorLabel("Error getting inventory items");
      }
      else if (newData.error == 0) {
        setErrorLabel("No inventory items");
      }
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  const addInventory = async () => {
    console.log("add inventory");
    const response = await fetch("/api/add-inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventoryId, inventoryItems, inventoryQuantity, inventoryMaxStock, inventoryMinStock }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(JSON.stringify(newData));
      console.log(newData.error);
      getInventoryData();
      switch (newData.error) {
        case -2:
          setErrorLabel("Failed to connect to backend");
          break;
        case -1:
          setErrorLabel("Error adding inventory item");
          break;
        case 0:
          setErrorLabel("Inventory ID already exists");
          break;
        case 1:
          setErrorLabel("Inventory ID not found");
          break;
        case 2:
          setErrorLabel("Non-numeric character found in Inventory ID");
          break;
        case 3:
          setErrorLabel("Name not found");
          break;
        case 6:
          setErrorLabel("Multiple decimals found in quantity");
          break;
        case 7:
          setErrorLabel("Non-numeric character found in quantity");
          break;
        case 8:
          setErrorLabel("Multiple decimals found in maxstock");
          break;
        case 9:
          setErrorLabel("Non-numeric character found in maxstock");
          break;
        case 10:
          setErrorLabel("Multiple decimals found in minstock");
          break;
        case 11:
          setErrorLabel("Non-numeric character found in minstock");
          break;
        case 55:
          setErrorLabel("");
          break;
      }
    }
  }

  const removeInventory = async () => {
    console.log("Removing Inventory");
    const response = await fetch("/api/remove-inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventoryId, rowSelection }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(newData);
      getInventoryData();
      setRowSelection([]);
      if (newData.error == -2) {
        setErrorLabel("Failed to connect to backend");
      }
      else if (newData.error == -1) {
        setErrorLabel("Error removing inventory item");
      }
      else if (newData.error == 0) {
        setErrorLabel("Inventory item not found");
      }
      else if (newData.error == 1) {
        setErrorLabel("Inventory ID not found");
      }
      else if (newData.error == 2) {
        setErrorLabel("Non-numeric character found in Inventory ID");
      }
      else {
        setErrorLabel("");
      }
    }
  }

  const updateInventory = async () => {
    console.log("update inventory");
    let response = await fetch("/api/update-inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventoryId, inventoryItems, inventoryQuantity, inventoryMaxStock, inventoryMinStock, rowSelection }),
    });
    if (!response.ok) {
      console.log("Error in function call");
      setErrorLabel("Failed to connect to backend");
    }
    else if (response == null) {
      console.log("Error getting data");
      setErrorLabel("Failed to connect to backend");
    }
    else {
      const newData = await response.json();
      console.log(newData);
      getInventoryData();
      switch (newData.error) {
        case -2:
          setErrorLabel("Failed to connect to backend");
          break;
        case -1:
          setErrorLabel("Error updating inventory item");
          break;
        case 0:
          setErrorLabel("Inventory item doesn't exit");
          break;
        case 1:
          setErrorLabel("Inventory ID not found");
          break;
        case 2:
          setErrorLabel("Non-numeric character found in Inventory ID");
          break;
        case 3:
          setErrorLabel("Multiple decimals found in quantity");
          break;
        case 4:
          setErrorLabel("Non-numeric character found in quantity");
          break;
        case 5:
          setErrorLabel("Multiple decimals found in maxstock");
          break;
        case 6:
          setErrorLabel("Non-numeric character found in maxstock");
          break;
        case 7:
          setErrorLabel("Multiple decimals found in minstock");
          break;
        case 8:
          setErrorLabel("Non-numeric character found in minstock");
          break;
        case 15:
          setErrorLabel("Inventory id not found")
        case 55:
          setErrorLabel("");
          break;
      }
    }
  }
  /* ---------------------- Inventory Variables and Funtions End ---------------------- */
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [replace, setReplace] = useState(false);
  const inputRef = useRef(null);

  function handleSelectFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) {
      setMessage('File now found');
      return;
    }
    if (f.type !== 'image/png') {
      setMessage('Only PNG files are allowed.');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setMessage('');
  }

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) {
      return;
    }
    if (f.type !== 'image/png') {
      setMessage('Only PNG files are allowed.');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setMessage('');
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  async function handleUpload() {
    if (!file) {
      setMessage('Please select a PNG first.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      let ids = [];
      
      const response = await fetch("/api/get-menu-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId, rowSelection }),
      });
      let resp = await response.json();
      console.log(resp + "aasfbsdbstenb");
      switch (resp.error) {
        case 2:
          setMessage('Menu Id not found');
          break;
        case 3:
          setMessage('No menu items found to update');
          break;
        case 55:
          setMessage('Upload successful');
          break;
      }
      for (let row of resp.ids) {
        console.log(row + "aafgafg");
        ids.push(row);
      }

      console.log(ids);
      for (let name of ids) {
        console.log(name);
        const form = new FormData();
        form.append('menuId', name);
        form.append('file', file);
        form.append('replace', replace);
        
        const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setFile(null);
    setPreviewUrl(null);
    setMessage('');
    if (inputRef.current) inputRef.current.value = null;
  }

  function onClose() {
    setShowImageDownloadModal(false);
  }


  return (
    <div className = "manager-page-container">
      {showReportModal &&(
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Reports</h2>
              <label style={{ textAlign: 'center', color: 'red', display: 'block' }}>{labelValue}</label>

                <div className="table-container">
                  {columns.length > 0 && data.length > 0 && (
                    <table>
                      <thead>
                        {table.getHeaderGroups().map((hg) => (
                          <tr key={hg.id}>
                            {hg.headers.map((header) => (
                              <th key={header.id} className = "tableHeader">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="tableRow">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              <div className= "report-buttons-container">
                {/* Set up reports based on reports.jsx implemetation */}
                <button className="report-button" onClick={() => generateXReport()}>X-Report</button>
                <button className="report-button" onClick={() => generateZReport()}>Z-Report</button>
                <button className="report-button" onClick={() => generateProductUsageReport()}>Product Usage Chart</button>
                <button className="report-button" onClick={() => generateRestockReport()}>Restock Report</button>
                <button className="report-button" onClick={() => generateSalesReport()}>Sales Report</button>
              </div>
              <div className= "report-times-container">
                {/* <Calendar value={startTime} onChange={(e) => setStartTime(e.value as Date)} appendTo={null} inputClassName="rc-input" panelClassName="rc-panel" pt={{panel: { className: "rc-panel" }}}/>
                <Calendar value={endTime} onChange={(e) => setEndTime(e.value as Date)} appendTo={null} inputClassName="rc-input" panelClassName="rc-panel" unstyled /> */}
                <DatePicker selected={startTime} onChange={(date) => setStartTime(date)} />
                <DatePicker selected={endTime} onChange={(date) => setEndTime(date)} />
              </div>
              <div className= "back-container">
                <button className="back-button" onClick={handleShowReportModal}>Close</button>
              </div>
            </div>
          </div>
        )
      }
      {/* This is for all update stuff EX: adding/removing an item from menu, inventory, employee management
      I want it to be stored in a selectable table that can be clicked on to edit/remove entries
      For adding I want either 1 of 2 things, a text area to add an entry OR click add, opens a small modal with the text fields to be filled */}
      {showEmployeeModal &&(
          <div className="modal-overlay">
            <div className="modal-content">
              {/* managmentType defines what screen to open and what is going to be updated, use this variable to change funtionality on react */}
              <h2>Employee Management</h2>
              <label style={{ textAlign: 'center', color: 'red', display: 'block' }}>{errorLabel}</label>
                <div className="employeeTableContainer">
                  {columns.length > 0 && data.length > 0 && (
                    <table>
                      <thead>
                        {table.getHeaderGroups().map((hg) => (
                          <tr key={hg.id} className="row">
                            {hg.headers.map((header) => (
                              <th key={header.id} className = "tableHeader">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id} onClick={() => row.toggleSelected()} className={row.getIsSelected() ? "selected" : ""} style={{ cursor: "pointer" }}>
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="tableRow">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              <label style={{ textAlign: 'center', color: 'black', display: 'block' }}>Select rows or type ID</label>
              <div className= "management-buttons-container">
                <button className="button" onClick={() => addEmployee()}>Add </button>
                <button className="button" onClick={() => removeEmployee()}>Remove </button>
                <button className="button" onClick={() => updateEmployee()}>Update </button>
                <button className="button" onClick={() => setShowEmployeeModal(false)}>Close</button>
              </div>
              <div className= "text-box-container">
                <input className="textbox" type="text" placeholder="ID" value={employeeId ?? ''} onChange={(e) => setEmployeeId(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Name" value={employeeNewName ?? ''} onChange={(e) => setEmployeeNewName(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Role" value={employeeRole ?? ''} onChange={(e) => setEmployeeRole(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Wage" value={employeeWage ?? ''} onChange={(e) => setEmployeeWage(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Manager? (yes, no)" value={employeeIsManager ?? ''} onChange={(e) => setEmployeeIsManager(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Email" value={employeeEmail ?? ''} onChange={(e) => setEmployeeEmail(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Username" value={employeeUsername ?? ''} onChange={(e) => setEmployeeUsername(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Password" value={employeePassword ?? ''} onChange={(e) => setEmployeePassword(e.target.value)}/>
              </div>
            </div>
          </div>
        )
      }
      {showMenuModal &&(
          <div className="modal-overlay">

          {showImageDownloadModal && (
            <div className="modal-overlay">
              <div className="modal-box">
                <div className="modal-header">
                  <h3>Upload Menu Item Image (.png)</h3>
                  <button
                    className="close-btn"
                    onClick={() => { handleClear(); onClose(); }}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-grid">
                  <div
                    className="dropzone"
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    role="button"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" className="preview-img" />
                    ) : (
                      <div>
                        <p>Drag & drop a PNG here</p>
                        <p>or</p>

                        {/* Hidden input triggers on whole-box click */}
                        <input
                          ref={inputRef}
                          onChange={handleSelectFile}
                          accept="image/png"
                          type="file"
                          style={{ display: 'none' }}
                        />

                        <p className="text-sm text-gray-600">Select File</p>
                      </div>
                    )}
                  </div>
                  <div className="info-panel">
                    <div>
                      <p className="label">Selected file: {file ? `${file.name}` : 'No file selected'}</p>
                      {message && (
                        <div className="error-box">{message}</div>
                      )}
                    </div>

                    <div className="btn-row">
                    <button
                    className="btn btn-upload"
                    onClick={handleUpload}
                    disabled={loading}
                    >
                    {loading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                    className="btn btn-clear"
                    onClick={handleClear}
                    disabled={loading}
                    >
                    Clear
                    </button>
                    <button
                    className="btn btn-close"
                    onClick={() => { handleClear(); setShowImageDownloadModal(false); }}
                    >
                    Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

            <div className="modal-content">
              {/* managmentType defines what screen to open and what is going to be updated, use this variable to change funtionality on react */}
              <h2>Menu Management</h2>
              <label style={{ textAlign: 'center', color: 'red', display: 'block' }}>{errorLabel}</label>
                <div className="employeeTableContainer">
                  {columns.length > 0 && data.length > 0 && (
                    <table>
                      <thead>
                        {table.getHeaderGroups().map((hg) => (
                          <tr key={hg.id} className="row">
                            {hg.headers.map((header) => (
                              <th key={header.id} className = "tableHeader">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id} onClick={() => row.toggleSelected()} className={row.getIsSelected() ? "selected" : ""} style={{ cursor: "pointer" }}>
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="tableRow">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              <label style={{ textAlign: 'center', color: 'black', display: 'block' }}>Select rows or type ID</label>
              <div className= "management-buttons-container">
                <button className="button" onClick={() => addMenu()}>Add </button>
                <button className="button" onClick={() => removeMenu()}>Remove </button>
                <button className="button" onClick={() => updateMenu()}>Update </button>
                <button className="button" onClick={() => setShowMenuModal(false)}>Close</button>
              </div>
              <div className= "text-box-container">
                <input className="textbox" type="text" placeholder="ID" value={menuId ?? ''} onChange={(e) => setMenuId(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Name" value={menuName ?? ''} onChange={(e) => setMenuName(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Type" value={menuType ?? ''} onChange={(e) => setMenuType(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Calories" value={menuCalories ?? ''} onChange={(e) => setMenuCalories(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Allergies: Nuts, Dairy, ect." value={menuAllergies ?? ''} onChange={(e) => setMenuAllergies(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Price Modifier" value={menuPriceMod ?? ''} onChange={(e) => setMenuPriceMod(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Inventory IDs: 1, 2, ect." value={menuInventoryIds ?? ''} onChange={(e) => setMenuInventoryIds(e.target.value)}/>
              </div>
            </div>
          </div>
        )
      }
      {showInventoryModal &&(
          <div className="modal-overlay">
            <div className="modal-content">
              {/* managmentType defines what screen to open and what is going to be updated, use this variable to change funtionality on react */}
              <h2>Inventory Management</h2>
              <label style={{ textAlign: 'center', color: 'red', display: 'block' }}>{errorLabel}</label>
                <div className="employeeTableContainer">
                  {columns.length > 0 && data.length > 0 && (
                    <table>
                      <thead>
                        {table.getHeaderGroups().map((hg) => (
                          <tr key={hg.id}>
                            {hg.headers.map((header) => (
                              <th key={header.id} className = "tableHeader">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id} onClick={() => row.toggleSelected()} className={row.getIsSelected() ? "selected" : ""} style={{ cursor: "pointer" }}>
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="tableRow">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              <label style={{ textAlign: 'center', color: 'black', display: 'block' }}>Select rows or type ID</label>
              <div className= "management-buttons-container">
                {/* <button className="button" onClick={() => updateQuantity(true)}>Add Stock</button>
                <button className="button" onClick={() => updateQuantity(false)}>Remove Stock </button> */}
                <button className="button" onClick={() => addInventory()}>Add </button>
                <button className="button" onClick={() => removeInventory()}>Remove </button>
                <button className="button" onClick={() => updateInventory()}>Update </button>
                <button className="button" onClick={() => setShowInventoryModal(false)}>Close</button>
              </div>
              <div className= "menu-text-box-container">
                <input className="textbox" type="text" placeholder="ID" value={inventoryId ?? ''} onChange={(e) => setInventoryId(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Name" value={inventoryItems ?? ''} onChange={(e) => setInventoryItems(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Quantity" value={inventoryQuantity ?? ''} onChange={(e) => setInventoryQuantity(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Minimum Stock" value={inventoryMinStock ?? ''} onChange={(e) => setInventoryMinStock(e.target.value)}/>
                <input className="textbox" type="text" placeholder="Maximum Stock" value={inventoryMaxStock ?? ''} onChange={(e) => setInventoryMaxStock(e.target.value)}/>
              </div>
            </div>
          </div>
        )
      }
      {showSignOutModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSignOutModal(false)}
            >
          <div className="modal-window" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <h2>Confirm Sign Out</h2>
            <div>
              Are you sure you want to sign out?
            </div>
            </div>
            <div className= "modal-actions">
              <button className="button" onClick={handleSignOut}>Yes</button>
              <button className="button" onClick={() => setShowSignOutModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      <div className = "manager-subheader"><h1>Welcome, {employeeName === null ? "missing" : employeeName}!</h1></div>

      <div className = "manager-buttons-container">
        <button className = "button manager-button" onClick={() => {setShowReportModal(true); generateXReport(); setLabel("");}}>View Reports</button>
        <button className = "button manager-button" onClick={()=> {
            setShowInventoryModal(true);
            setErrorLabel("");
            setRowSelection([]);
            getInventoryData();}
          }
        >
          Manage Inventory
        </button>
        <button className = "button manager-button"onClick={()=> {
            setShowEmployeeModal(true);
            setErrorLabel("");
            setRowSelection([]);
            getEmployeeData();}
          }
        >
          Manage Employees
        </button>
        <button className = "button manager-button"onClick={()=> {
            setShowMenuModal(true);
            setErrorLabel("");
            setRowSelection([]);
            getMenuData();}
          }
        >
          Manage Menu
        </button>
        {/* Can be used for accessability settings in the future */}
        <button className = "button manager-button">Settings</button>
        <button className = "button manager-button" onClick={() => setShowSignOutModal(true)}>Sign Out</button>
      </div>
      <div className="line-chart">
        <Line data={salesData} options={options}/>
      </div>
    </div>
  );
}