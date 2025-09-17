import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  MenuItem,
} from "@mui/material";

export default function EmployeeFormPage({ mode = "add" }) {
  const navigate = useNavigate();
  const { id } = useParams(); // only for edit mode
  const [loading, setLoading] = useState(false);
  const [cafes, setCafes] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      id: "",
      name: "",
      emailAddress: "",
      phoneNumber: "",
      gender: "",
      startDate: "",
      cafeId: "",
    },
  });

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Fetch cafes for dropdown
  useEffect(() => {
    fetch("http://localhost:5050/cafes")
      .then((res) => res.json())
      .then((data) => setCafes(data));
  }, []);

  // Prefill form if edit mode
  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);
      fetch(`http://localhost:5050/employees/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setValue("id", data.id);
          setValue("name", data.name);
          setValue("emailAddress", data.emailAddress);
          setValue("phoneNumber", data.phoneNumber);
          setValue("gender", data.gender);
          setValue("startDate", data.startDate);
          setValue("cafeId", data.cafeId || "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [mode, id, setValue]);

  const onSubmit = async (data) => {
    const url = mode === "add"
      ? "http://localhost:5050/employees"
      : `http://localhost:5050/employees/${id}`;
    const method = mode === "add" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      navigate("/employees");
    } else {
      const err = await res.json();
      alert(`Failed: ${err.message}`);
    }
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Are you sure?")) return;
    navigate("/employees");
  };

  if (loading) {
    return (
      <Container style={{ marginTop: "2rem", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: "2rem" }}>
      <Typography variant="h6" gutterBottom>
        {mode === "add" ? "Add New Employee" : "Edit Employee"}
      </Typography>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}
      >
        <Controller
          name="id"
          control={control}
          rules={{
            required: "ID is required",
            pattern: {
              value: /^UI[A-Za-z0-9]{5,7}$/,
              message: "ID must be in format UIXXXXXXX",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Employee ID"
              error={!!errors.id}
              helperText={errors.id?.message}
              fullWidth
              disabled={mode === "edit"} // ID is immutable
            />
          )}
        />

        <Controller
          name="name"
          control={control}
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="emailAddress"
          control={control}
          rules={{
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              error={!!errors.emailAddress}
              helperText={errors.emailAddress?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          rules={{
            required: "Phone is required",
            pattern: { value: /^[89]\d{7}$/, message: "Invalid phone number" },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Phone Number"
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="gender"
          control={control}
          rules={{ required: "Gender is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Gender"
              error={!!errors.gender}
              helperText={errors.gender?.message}
              fullWidth
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </TextField>
          )}
        />

        <Controller
          name="startDate"
          control={control}
          rules={{ required: "Start Date is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="cafeId"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Café" fullWidth>
              <MenuItem value="">-- Not Assigned --</MenuItem>
              {cafes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <div style={{ display: "flex", gap: "1rem" }}>
          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
}
