"use client";
import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Sidebar from "../components/Sidebar";
import SmallStat from "../components/SmallStat";
import { initialShipments, Shipment } from "../data/mockData";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

const COLORS = ["#6366F1", "#F59E0B", "#EF4444"];

export default function DistributorDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    temperatureC: 4,
  });

  const addShipment = () => {
    if (!form.origin || !form.destination) return;
    const s: Shipment = {
      id: uuidv4(),
      origin: form.origin,
      destination: form.destination,
      status: "in-transit",
      temperatureC: form.temperatureC,
      eta: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    };
    setShipments((prev) => [s, ...prev]);
    setForm({ origin: "", destination: "", temperatureC: 4 });
  };
  const updateStatus = (id: string, status: Shipment["status"]) =>
    setShipments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  const remove = (id: string) =>
    setShipments((prev) => prev.filter((p) => p.id !== id));

  const pieData = [
    {
      name: "In-Transit",
      value: shipments.filter((s) => s.status === "in-transit").length,
    },
    {
      name: "Delayed",
      value: shipments.filter((s) => s.status === "delayed").length,
    },
    {
      name: "Delivered",
      value: shipments.filter((s) => s.status === "delivered").length,
    },
  ];

  return (
    <DashboardLayout>
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <Sidebar role="distributor" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-4 space-y-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                Distributor Dashboard
              </h1>
              <p className="text-white/90 mt-1">
                Monitor cold-chain health and delivery performance.
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 text-white shadow-lg">
              New Shipment
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SmallStat
              label="Active shipments"
              value={shipments.filter((s) => s.status === "in-transit").length}
            />
            <SmallStat
              label="Delayed"
              value={shipments.filter((s) => s.status === "delayed").length}
            />
            <SmallStat
              label="Delivered"
              value={shipments.filter((s) => s.status === "delivered").length}
            />
          </div>

          <section
            id="manage"
            className="p-6 rounded-2xl border border-white/20 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Manage Shipments
            </h3>

            <div className="flex gap-3 flex-wrap mt-4 mb-6">
              <input
                placeholder="Origin"
                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-indigo-300"
                value={form.origin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, origin: e.target.value }))
                }
              />
              <input
                placeholder="Destination"
                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-indigo-300"
                value={form.destination}
                onChange={(e) =>
                  setForm((f) => ({ ...f, destination: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Temp C"
                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-indigo-300"
                value={form.temperatureC}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    temperatureC: Number(e.target.value),
                  }))
                }
              />
              <button
                onClick={addShipment}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 text-white shadow"
              >
                Add
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-700 dark:text-zinc-200 text-xs border-b border-zinc-200/60">
                  <tr>
                    <th>ID</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Temp</th>
                    <th>ETA</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-white/30 dark:hover:bg-white/6"
                    >
                      <td className="py-3 text-zinc-800 dark:text-zinc-100">
                        {s.id}
                      </td>
                      <td className="text-zinc-800 dark:text-zinc-100">
                        {s.origin}
                      </td>
                      <td className="text-zinc-700 dark:text-zinc-300">
                        {s.destination}
                      </td>
                      <td className="text-zinc-700 dark:text-zinc-300">
                        {s.temperatureC}°C
                      </td>
                      <td className="text-zinc-700 dark:text-zinc-300">
                        {new Date(s.eta).toLocaleString()}
                      </td>
                      <td className="capitalize text-zinc-700 dark:text-zinc-300">
                        {s.status}
                      </td>
                      <td className="space-x-2">
                        <button
                          onClick={() => updateStatus(s.id, "delivered")}
                          className="text-green-600"
                        >
                          Delivered
                        </button>
                        <button
                          onClick={() => updateStatus(s.id, "delayed")}
                          className="text-orange-600"
                        >
                          Mark Delayed
                        </button>
                        <button
                          onClick={() => remove(s.id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            id="analytics"
            className="p-6 rounded-2xl border border-white/20 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Cold-Chain Status
            </h3>
            <div className="w-full h-72 mt-4">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
