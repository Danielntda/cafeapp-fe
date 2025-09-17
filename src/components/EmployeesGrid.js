import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  Box,
  TextField,
} from "@mui/material";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function EmployeesGrid() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  // Fetch employees
  const fetchEmployees = (cafe = "") => {
    setLoading(true);
    let url = "http://localhost:5050/employees";
    if (cafe) url += `?cafe=${cafe}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch employees:", err);
        setLoading(false);
      });
  };

  // Fetch cafes for filter
  const fetchCafes = () => {
    fetch("http://localhost:5050/cafes")
      .then((res) => res.json())
      .then((data) => setCafes(data))
      .catch((err) => console.error("Failed to fetch cafes:", err));
  };

  useEffect(() => {
    fetchCafes();
    fetchEmployees();
  }, []);

  const handleCafeChange = (e) => {
    const value = e.target.value;
    setSelectedCafe(value);
    fetchEmployees(value);
  };

  const columnDefs = [
    { headerName: "ID", field: "id" },
    { headerName: "Name", field: "name" },
    { headerName: "Email", field: "emailAddress" },
    { headerName: "Phone", field: "phoneNumber" },
    { headerName: "Gender", field: "gender" },
    { headerName: "Cafe", field: "cafeName" },
    {
      headerName: "Days Worked",
      valueGetter: (params) => {
        if (!params.data.startDate) return 0;
        const start = new Date(params.data.startDate);
        const today = new Date();
        const diffTime = today - start;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      },
    },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setEditEmployee(params.data);
              setOpenModal(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => {
              if (window.confirm("Delete this employee?")) {
                fetch(`http://localhost:5050/employees/${params.data.id}`, { method: "DELETE" }).then(() =>
                  fetchEmployees(selectedCafe)
                );
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editEmployee ? "PUT" : "POST";
    const url = "http://localhost:5050/employees";

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    // Include ID if editing
    if (editEmployee) {
      payload.id = editEmployee.id;
    }

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      setOpenModal(false);
      setEditEmployee(null);
      fetchEmployees(selectedCafe);
    });
  };

  if (loading) {
    return (
      <Container style={{ marginTop: "2rem", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1">Loading employees...</Typography>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: "2rem" }}>
      <Typography variant="h6" gutterBottom>
        Employees
      </Typography>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <FormControl size="small" style={{ minWidth: 200 }}>
          <InputLabel>Filter by Cafe</InputLabel>
          <Select value={selectedCafe} onChange={handleCafeChange}>
            <MenuItem value="">All Cafes</MenuItem>
            {cafes.map((cafe) => (
              <MenuItem key={cafe.id} value={cafe.name}>
                {cafe.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="success"
          onClick={() => {
            setEditEmployee(null);
            setOpenModal(true);
          }}
        >
          Add Employee
        </Button>
      </div>

      <div className="ag-theme-material" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          rowData={employees}
          columnDefs={columnDefs}
          getRowId={(params) => params.data.id}
          pagination={true}
          paginationPageSize={10}
          defaultColDef={{ sortable: true, filter: true, resizable: true, flex: 1 }}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: 400,
          }}
        >
          <Typography variant="h6">{editEmployee ? "Edit Employee" : "Add Employee"}</Typography>
          <TextField name="name" label="Name" defaultValue={editEmployee?.name || ""} required />
          <TextField name="emailAddress" label="Email" defaultValue={editEmployee?.emailAddress || ""} required />
          <TextField name="phoneNumber" label="Phone" defaultValue={editEmployee?.phoneNumber || ""} required />
          <TextField name="gender" label="Gender" defaultValue={editEmployee?.gender || ""} required />
          <FormControl>
            <InputLabel>Cafe</InputLabel>
            <Select name="cafeName" defaultValue={editEmployee?.cafeName || ""}>
              <MenuItem value="">Unassigned</MenuItem>
              {cafes.map((cafe) => (
                <MenuItem key={cafe.id} value={cafe.name}>
                  {cafe.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="startDate"
            label="Start Date"
            type="date"
            defaultValue={editEmployee?.startDate || ""}
            InputLabelProps={{ shrink: true }}
            required
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="contained" type="submit">
              Submit
            </Button>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}
