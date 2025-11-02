"use client";
import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Sidebar from "../components/Sidebar";
import SmallStat from "../components/SmallStat";
import { initialOrders, Order } from "../data/mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

export default function RetailerDashboard() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [form, setForm] = useState({ item: "", quantity: 0, currentPrice: 0 });

  const addOrder = () => {
    if (!form.item || form.quantity <= 0) return;
    const newO: Order = {
      id: uuidv4(),
      item: form.item,
      quantity: form.quantity,
      expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      currentPrice: form.currentPrice || 1,
      status: "pending",
    };
    setOrders((prev) => [newO, ...prev]);
    setForm({ item: "", quantity: 0, currentPrice: 0 });
  };
  const complete = (id: string) =>
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "completed" } : o))
    );
  const remove = (id: string) =>
    setOrders((prev) => prev.filter((o) => o.id !== id));

  const [weeklyData] = useState(() =>
    [1, 2, 3, 4, 5, 6, 7].map((d, i) => ({
      day: `D${i + 1}`,
      sold: Math.round(Math.random() * 60),
    }))
  );

  return (
    <DashboardLayout>
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-1">
          <Sidebar role="retailer" />
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
                Retailer Dashboard
              </h1>
              <p className="text-white/90 mt-1">
                Optimize pricing, manage orders and minimize store waste.
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 text-white shadow-lg">
              New Order
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SmallStat
              label="Active orders"
              value={orders.filter((o) => o.status === "pending").length}
            />
            <SmallStat
              label="Completed"
              value={orders.filter((o) => o.status === "completed").length}
            />
            <SmallStat label="Items" value={orders.length} />
          </div>

          <section
            id="manage"
            className="p-6 rounded-2xl border border-white/20 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Manage Orders
            </h3>

            <div className="flex gap-3 flex-wrap mt-4 mb-6">
              <input
                placeholder="Item"
                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-cyan-300"
                value={form.item}
                onChange={(e) =>
                  setForm((f) => ({ ...f, item: e.target.value }))
                }
              />
              <input
                type="number"
                placeholder="Qty"
                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-cyan-300"
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: Number(e.target.value) }))
                }
              />
              <input
                type="number"
                placeholder="Price"
                className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-cyan-300"
                value={form.currentPrice}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    currentPrice: Number(e.target.value),
                  }))
                }
              />
              <button
                onClick={addOrder}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-cyan-500 to-indigo-500 text-white shadow"
              >
                Add
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-zinc-700 dark:text-zinc-200 text-xs border-b border-zinc-200/60">
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Expiry</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-white/30 dark:hover:bg-white/6"
                    >
                      <td className="py-3 text-zinc-800 dark:text-zinc-100">
                        {o.item}
                      </td>
                      <td className="text-zinc-800 dark:text-zinc-100">
                        {o.quantity}
                      </td>
                      <td className="text-zinc-700 dark:text-zinc-300">
                        {new Date(o.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="text-zinc-700 dark:text-zinc-300">
                        {o.currentPrice}
                      </td>
                      <td className="capitalize text-zinc-700 dark:text-zinc-300">
                        {o.status}
                      </td>
                      <td className="space-x-2">
                        <button
                          onClick={() => complete(o.id)}
                          className="text-green-600"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => remove(o.id)}
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
              Weekly Purchases
            </h3>
            <div className="w-full h-72 mt-4">
              <ResponsiveContainer>
                <LineChart data={weeklyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.06)"
                  />
                  <XAxis dataKey="day" tick={{ fill: "var(--foreground)" }} />
                  <YAxis tick={{ fill: "var(--foreground)" }} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Line
                    type="monotone"
                    dataKey="sold"
                    stroke="#0EA5E9"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
