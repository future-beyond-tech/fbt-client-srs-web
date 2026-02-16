"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  initialCustomers,
  initialInvoices,
  initialVehicles,
} from "@/features/data/staticData";

const BillingContext = createContext(null);

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export function BillingProvider({ children }) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [customers, setCustomers] = useState(initialCustomers);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [latestInvoiceId, setLatestInvoiceId] = useState(
    initialInvoices[initialInvoices.length - 1]?.id ?? null,
  );

  const addVehicle = (vehicleInput) => {
    const nextId = `veh-${String(vehicles.length + 1).padStart(3, "0")}`;

    const vehicle = {
      id: nextId,
      type: vehicleInput.type,
      brand: vehicleInput.brand,
      model: vehicleInput.model,
      registrationNumber: vehicleInput.registrationNumber,
      purchasePrice: Number(vehicleInput.purchasePrice),
      sellingPrice: Number(vehicleInput.sellingPrice),
      status: vehicleInput.status || "Available",
    };

    setVehicles((prev) => [vehicle, ...prev]);
    return vehicle;
  };

  const addCustomer = (customerInput) => {
    const nextId = `cus-${String(customers.length + 1).padStart(3, "0")}`;

    const customer = {
      id: nextId,
      name: customerInput.name,
      phone: customerInput.phone,
      address: customerInput.address,
    };

    setCustomers((prev) => [customer, ...prev]);
    return customer;
  };

  const createInvoice = ({ customerId, vehicleId, gstEnabled, paymentMode }) => {
    const customer = customers.find((item) => item.id === customerId);
    const vehicle = vehicles.find((item) => item.id === vehicleId);

    if (!customer || !vehicle) {
      return null;
    }

    const subtotal = Number(vehicle.sellingPrice);
    const gstRate = gstEnabled ? 0.18 : 0;
    const gstAmount = Number((subtotal * gstRate).toFixed(2));
    const finalTotal = Number((subtotal + gstAmount).toFixed(2));
    const invoiceDate = getTodayDate();
    const serial = String(invoices.length + 1).padStart(3, "0");

    const invoice = {
      id: `inv-${serial}`,
      invoiceNumber: `SRS-${invoiceDate.replaceAll("-", "")}-${serial}`,
      invoiceDate,
      paymentMode,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      },
      vehicle: {
        id: vehicle.id,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        registrationNumber: vehicle.registrationNumber,
        sellingPrice: Number(vehicle.sellingPrice),
      },
      subtotal,
      gstRate,
      gstAmount,
      finalTotal,
    };

    setInvoices((prev) => [invoice, ...prev]);
    setLatestInvoiceId(invoice.id);

    setVehicles((prev) =>
      prev.map((item) =>
        item.id === vehicleId ? { ...item, status: "Sold" } : item,
      ),
    );

    return invoice;
  };

  const availableVehicles = useMemo(
    () => vehicles.filter((item) => item.status === "Available"),
    [vehicles],
  );

  const latestInvoice = useMemo(
    () => invoices.find((item) => item.id === latestInvoiceId) ?? invoices[0] ?? null,
    [invoices, latestInvoiceId],
  );

  const dashboardStats = useMemo(() => {
    const today = getTodayDate();

    return {
      totalVehicles: vehicles.length,
      soldVehicles: vehicles.filter((item) => item.status === "Sold").length,
      totalRevenue: invoices.reduce((sum, item) => sum + item.finalTotal, 0),
      todaysRevenue: invoices
        .filter((item) => item.invoiceDate === today)
        .reduce((sum, item) => sum + item.finalTotal, 0),
    };
  }, [vehicles, invoices]);

  const value = {
    vehicles,
    customers,
    invoices,
    availableVehicles,
    latestInvoice,
    dashboardStats,
    addVehicle,
    addCustomer,
    createInvoice,
  };

  return (
    <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
  );
}

export function useBilling() {
  const context = useContext(BillingContext);

  if (!context) {
    throw new Error("useBilling must be used within BillingProvider");
  }

  return context;
}
