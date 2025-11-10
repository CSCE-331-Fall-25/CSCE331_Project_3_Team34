import "../styles/Reports.css";
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

export default function Report() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const data = useMemo(() => tableData, [tableData]);
  const columns = useMemo(() => tableColumns, [tableColumns]);
  const coreRowModel = useMemo(() => getCoreRowModel(), []);
  // const [initTableData, setTableData] = useState([]);
  // const [initTableColumns, setTableColumns] = useState([]);
  const table = useReactTable({
  data,
  columns,
  getCoreRowModel: coreRowModel,
});

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
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  const generateProductUsageChart = async () => {
    console.log("sales")
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
      console.log("WE GOT THERE");
      setTableColumns([{ accessorKey: "inventoryid", header: "ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "sales", header: "Sales", cell: info => info.getValue() }]);
      console.log(JSON.stringify(newData));
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  const generateRestockReport = async () => {
    console.log("restock")
    const response = await fetch("/api/restock-report-data");
    if (!response.ok) {
      console.log("Error in function call");
    }
    else if (response == null) {
      console.log("Error getting data");
    }
    else {
      const newData = await response.json();
      console.log("WE GOT THERE");
      setTableColumns([{ accessorKey: "itemid", header: "ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "quantity", header: "Quantity", cell: info => info.getValue() }]);
      console.log(JSON.stringify(newData));
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
      console.log("WE GOT THERE");
      setTableColumns([{ accessorKey: "menuid", header: "ID", cell: info => info.getValue() },
      { accessorKey: "name", header: "Name", cell: info => info.getValue() },
      { accessorKey: "sales", header: "Sales", cell: info => info.getValue() }]);
      console.log(JSON.stringify(newData));
      setTableData(Array.isArray(newData) ? newData.slice() : [newData]);
    }
  }

  function returnToCashier(event) {
    navigate(-1);
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Reports</h2>

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

        <div className='flexReports'>
          <div style={{ padding: '20px' }}>
            <button className="defaultButton" onClick={generateXReport}>Generate X Report</button>
          </div>
          <div style={{ padding: '20px' }}>
            <button className="defaultButton" onClick={generateZReport}>Generate Z Report</button>
          </div>
          <div style={{ padding: '20px' }}>
            <button className="defaultButton" onClick={generateProductUsageChart}>Generate Product Usage Chart</button>
          </div>
          <div style={{ padding: '20px' }}>
            <button className="defaultButton" onClick={generateRestockReport}>Generate Restock Report</button>
          </div>
          <div style={{ padding: '20px' }}>
            <button className="defaultButton" onClick={generateSalesReport}>Generate Sales Report</button>
          </div>
        </div>

        <div className='flexTimes'>
          <input className="InputStyle"
            type="text"
            placeholder="Start Time (yyyy-mm-dd hh:mm:ss)"
            value={startTime ?? ''}
            onChange={handleStartChange}/>
          <input className="InputStyle"
            type="text"
            placeholder="End Time (yyyy-mm-dd hh:mm:ss)"
            value={endTime ?? ''}
            onChange={handleEndChange}/>
        </div>

        <div className='backButton'>
          <div style={{ padding: '20px' }}>
            <button onClick={returnToCashier} className="defaultButton">Back</button>
          </div>
        </div>
    </div>
  )
}