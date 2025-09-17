import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { useNavigate } from "react-router-dom";
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

export default function CafesGrid() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editCafe, setEditCafe] = useState(null);
  const navigate = useNavigate();

  const fetchCafes = (loc = "") => {
    setLoading(true);
    const url = loc ? `http://localhost:5050/cafes?location=${loc}` : "http://localhost:5050/cafes";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCafes(data);
        setLoading(false);
        if (!loc) {
          const unique = [...new Set(data.map((c) => c.location))];
          setLocations(unique);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch cafes:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    fetchCafes(value);
  };

  const columnDefs = [
    {
      headerName: "Logo",
      field: "logo",
      cellRenderer: (params) =>
        params.value ? <img src={params.value} alt="cafe logo" style={{ height: 40 }} /> : "—",
      width: 100,
    },
    { headerName: "Name", field: "name" },
    { headerName: "Description", field: "description" },
    {
      headerName: "Employees",
      field: "employees",
      cellRenderer: (params) => (
        <span
          style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
          onClick={() => navigate(`/employees?cafe=${params.data.name}`)}
        >
          {params.value}
        </span>
      ),
    },
    { headerName: "Location", field: "location" },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setEditCafe(params.data);
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
              if (window.confirm("Delete this café and all employees?")) {
                fetch(`http://localhost:5050/cafes/${params.data.id}`, { method: "DELETE" }).then(() =>
                  fetchCafes(location)
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

    const method = editCafe ? "PUT" : "POST";
    const url = "http://localhost:5050/cafes"; // always same URL

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    // Include ID if editing
    if (editCafe) {
      payload.id = editCafe.id;
    }

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      setOpenModal(false);
      setEditCafe(null);
      fetchCafes(location);
    });
  };


  if (loading) {
    return (
      <Container style={{ marginTop: "2rem", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1">Loading cafes...</Typography>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: "2rem" }}>
      <Typography variant="h6" gutterBottom>
        Cafes
      </Typography>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <FormControl size="small" style={{ minWidth: 200 }}>
          <InputLabel>Filter by Location</InputLabel>
          <Select value={location} onChange={handleLocationChange}>
            <MenuItem value="">All Locations</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="success"
          onClick={() => {
            setEditCafe(null);
            setOpenModal(true);
          }}
        >
          Add Cafe
        </Button>
      </div>

      <div className="ag-theme-material" style={{ height: 500, width: "100%" }}>
        <AgGridReact
          rowData={cafes}
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
          <Typography variant="h6">{editCafe ? "Edit Cafe" : "Add Cafe"}</Typography>
          <TextField
            name="name"
            label="Name"
            defaultValue={editCafe?.name || ""}
            inputProps={{ minLength: 6, maxLength: 10 }}
            required
          />
          <TextField
            name="description"
            label="Description"
            defaultValue={editCafe?.description || ""}
            inputProps={{ maxLength: 256 }}
            required
          />
          <TextField
            name="logo"
            label="Logo URL"
            defaultValue={editCafe?.logo || ""}
          />
          <TextField
            name="location"
            label="Location"
            defaultValue={editCafe?.location || ""}
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
