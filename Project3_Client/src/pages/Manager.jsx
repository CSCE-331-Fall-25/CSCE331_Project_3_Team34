import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Manager/Manager.css";
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

//Component imports
import SignOutButton from '../Components/SignOut.jsx';

export default function Manager() {

  //Reports
  const [showReportModal, setShowReportModal] = useState(false);
  const employeeName = "Name"; // This should be fetched from backend or context

  // Managment modal
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [managmentType, setManagmentType] = useState("");
  const [inputContent, setInputContent] = useState("Test");

  // Router navigation
  const navigate = useNavigate();

 

  //modal to confirm sign out
  const [showSignOutModal, setShowSignOutModal] = useState(false);


  /* ---------------------- Reports Variables and Funtions Start --------------------- */
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const data = useMemo(() => tableData, [tableData]);
  const columns = useMemo(() => tableColumns, [tableColumns]);
  const coreRowModel = useMemo(() => getCoreRowModel(), []);
  const [labelValue, setLabel] = useState('');
  const table = useReactTable({ data, columns, getCoreRowModel: coreRowModel });

  function handleStartChange(event) {
    setStartTime(event.target.value);
  }

  function handleEndChange(event) {
    setEndTime(event.target.value);
  }

  const generateXReport = async () => {
    console.log("X");
    const response = await fetch("/api/x-report-data");
    if (!response.ok) {
      console.log("Error in function call");
    }
    else if (response == null) {
      console.log("Error getting data");
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
    }
    else if (response == null) {
      console.log("Error getting data");
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
    }
    else if (response == null) {
      console.log("Error getting data");
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
    }
    else if (response == null) {
      console.log("Error getting data");
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
    console.log("bruh");
    setShowReportModal(false);
  }
  /* ---------------------- Reports Variables and Funtions End --------------------- */

  return (
    <div className = "manager-page-container">
      {showReportModal &&(
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Reports</h2>
              <label style={{ textAlign: 'center', color: 'red', display: 'block' }}>{labelValue}</label>

              <div className="tableContainer">
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
                <input className="report-time-button"
                  type="text"
                  placeholder="Start Time (yyyy-mm-dd hh:mm:ss)"
                  value={startTime ?? ''}
                  onChange={handleStartChange}/>
                <input className="report-time-button"
                  type="text"
                  placeholder="End Time (yyyy-mm-dd hh:mm:ss)"
                  value={endTime ?? ''}
                  onChange={handleEndChange}/>
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
      {showManagementModal &&(
          <div className="modal-overlay">
            <div className="modal-content">
              {/* managmentType defines what screen to open and what is going to be updated, use this variable to change funtionality on react */}
              <h2>{managmentType} Management</h2>
              <div className="input-container">
                <input
                  type="text"
                  value={inputContent}
                  onChange={e => setInputContent(e.target.value)}
                  aria-label={`${managmentType} input`}
                />
              </div>
              <div className= "report-buttons-container">
                <button className="button">Add </button>
                <button className="button">Remove </button>
                <button className="button">Update </button>
                <button className="button" onClick={() => setShowManagementModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )
      }
      {showSignOutModal && <SignOutButton />}
      <div className = "manager-subheader"><h1>Welcome, {employeeName}!</h1></div>

      <div className = "manager-buttons-container">
        <button className = "button manager-button" onClick={() => setShowReportModal(true)}>View Reports</button>
        <button className = "button manager-button" onClick={()=> {
            setManagmentType("Inventory");
            setShowManagementModal(true);}
          }
        >
          Manage Inventory
        </button>
        <button className = "button manager-button"onClick={()=> {
            setManagmentType("Employee");
            setShowManagementModal(true);}
          }
        >
          Employee Management
        </button>
        <button className = "button manager-button"onClick={()=> {
            setManagmentType("Menu");
            setShowManagementModal(true);}
          }
        >
          Menu Management
        </button>
        {/* Can be used for accessability settings in the future */}
        <button className = "button manager-button">Settings</button>
  <button className = "button manager-button" onClick={() => setShowSignOutModal(true)}>Sign Out</button>
      </div>
      
    </div>
  );
}