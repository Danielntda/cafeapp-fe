import React from "react";
import { useLocation } from "react-router-dom";
import EmployeesGrid from "../components/EmployeesGrid";

export default function EmployeesPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cafe = params.get("cafe"); // e.g., "Cafe ABC"

  return <EmployeesGrid cafe={cafe} />;
}
