import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Stack } from "@mui/material";

export default function CafeForm({ cafe, onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: cafe || {}
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <TextField
          label="Name"
          {...register("name", { required: true, minLength: 6, maxLength: 10 })}
          error={!!errors.name}
          helperText={errors.name && "Name must be 6-10 characters"}
        />
        <TextField
          label="Description"
          {...register("description", { maxLength: 256 })}
          error={!!errors.description}
          helperText={errors.description && "Max 256 characters"}
        />
        <TextField
          label="Logo URL"
          {...register("logo")}
        />
        <TextField
          label="Location"
          {...register("location", { required: true })}
          error={!!errors.location}
        />
        <Button type="submit" variant="contained" color="primary">
          {cafe ? "Update" : "Create"}
        </Button>
      </Stack>
    </form>
  );
}
