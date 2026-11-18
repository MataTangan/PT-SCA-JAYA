"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";

type RoomStatus = "Available" | "Occupied" | "Reserved" | "Maintenance";
type ActiveTab = "unit" | "type";

type Room = {
  id: number;
  number: string;
  type: string;
  floor: string;
  status: RoomStatus;
};

type RoomType = {
  id: number;
  name: string;
  description: string;
  capacity: number;
  facilities: string;
  price: number;
};

const initialRooms: Room[] = [
  { id: 1, number: "S-101", type: "Superior", floor: "1", status: "Available" },
  { id: 2, number: "S-102", type: "Superior", floor: "1", status: "Occupied" },
  { id: 3, number: "S-103", type: "Superior", floor: "1", status: "Available" },
  { id: 4, number: "S-104", type: "Superior", floor: "1", status: "Maintenance" },
  { id: 5, number: "S-105", type: "Superior", floor: "1", status: "Reserved" },
  { id: 6, number: "D-201", type: "Deluxe", floor: "2", status: "Occupied" },
  { id: 7, number: "D-202", type: "Deluxe", floor: "2", status: "Available" },
  { id: 8, number: "D-203", type: "Deluxe", floor: "2", status: "Available" },
  { id: 9, number: "D-204", type: "Deluxe", floor: "2", status: "Reserved" },
  { id: 10, number: "SU-301", type: "Suite", floor: "3", status: "Occupied" },
  { id: 11, number: "SU-302", type: "Suite", floor: "3", status: "Available" },
];

const initialRoomTypes: RoomType[] = [
  {
    id: 1,
    name: "Superior",
    description: "A comfortable room for everyday stays.",
    capacity: 2,
    facilities: "Wi-Fi, AC, TV, bathroom",
    price: 450000,
  },
  {
    id: 2,
    name: "Deluxe",
    description: "A more spacious room with additional facilities.",
    capacity: 2,
    facilities: "Wi-Fi, AC, TV, work desk, bathroom",
    price: 650000,
  },
  {
    id: 3,
    name: "Suite",
    description: "A spacious room for a more comfortable stay.",
    capacity: 3,
    facilities: "Wi-Fi, AC, TV, sitting area, bathroom",
    price: 950000,
  },
];

const statusStyles: Record<RoomStatus, string> = {
  Available: "bg-[#E7EEE5] text-[#587052]",
  Occupied: "bg-[#E5E9EC] text-[#192B35]",
  Reserved: "bg-[#F4EBD9] text-[#9A763D]",
  Maintenance: "bg-[#F3E2DF] text-[#A15F55]",
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes);

  const [activeTab, setActiveTab] = useState<ActiveTab>("unit");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [roomForm, setRoomForm] = useState({
    number: "",
    type: "Superior",
    floor: "1",
    status: "Available" as RoomStatus,
  });

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);

  const [typeForm, setTypeForm] = useState({
    name: "",
    description: "",
    capacity: "2",
    facilities: "",
    price: "",
  });

  // Room unit search
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        room.number.toLowerCase().includes(keyword) || room.type.toLowerCase().includes(keyword);

      const matchesStatus = filterStatus === "All" || room.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [rooms, search, filterStatus]);

  // Room type search
  const filteredTypes = useMemo(() => {
    const keyword = search.toLowerCase();

    return roomTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(keyword) ||
        type.description.toLowerCase().includes(keyword),
    );
  }, [roomTypes, search]);

  // Room summary
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((room) => room.status === "Available").length;
  const occupiedRooms = rooms.filter((room) => room.status === "Occupied").length;
  const maintenanceRooms = rooms.filter((room) => room.status === "Maintenance").length;

  // Add room unit
  function openAddRoom() {
    setEditingRoom(null);
    setRoomForm({
      number: "",
      type: roomTypes[0]?.name || "",
      floor: "1",
      status: "Available",
    });
    setShowRoomModal(true);
  }

  // Edit room unit
  function openEditRoom(room: Room) {
    setEditingRoom(room);
    setRoomForm({
      number: room.number,
      type: room.type,
      floor: room.floor,
      status: room.status,
    });
    setShowRoomModal(true);
  }

  // Save room unit
  function handleRoomSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const roomNumber = roomForm.number.trim();

    if (!roomNumber) {
      alert("Room number is required.");
      return;
    }

    const duplicate = rooms.some(
      (room) =>
        room.number.toLowerCase() === roomNumber.toLowerCase() && room.id !== editingRoom?.id,
    );

    if (duplicate) {
      alert("This room number is already in use.");
      return;
    }

    if (editingRoom) {
      setRooms((current) =>
        current.map((room) =>
          room.id === editingRoom.id ? { ...room, ...roomForm, number: roomNumber } : room,
        ),
      );
    } else {
      setRooms((current) => [
        ...current,
        {
          id: Math.max(0, ...current.map((room) => room.id)) + 1,
          ...roomForm,
          number: roomNumber,
        },
      ]);
    }

    setShowRoomModal(false);
  }

  // Add room type
  function openAddType() {
    setEditingType(null);
    setTypeForm({
      name: "",
      description: "",
      capacity: "2",
      facilities: "",
      price: "",
    });
    setShowTypeModal(true);
  }

  // Edit room type
  function openEditType(type: RoomType) {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      description: type.description,
      capacity: String(type.capacity),
      facilities: type.facilities,
      price: String(type.price),
    });
    setShowTypeModal(true);
  }

  // Save room type
  function handleTypeSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = typeForm.name.trim();
    const price = Number(typeForm.price);
    const capacity = Number(typeForm.capacity);

    if (!name || !typeForm.description.trim() || !typeForm.facilities.trim()) {
      alert("All room type information is required.");
      return;
    }

    if (!Number.isInteger(price) || price <= 0) {
      alert("Room rate must be a number greater than 0.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      alert("Room capacity must be at least 1 person.");
      return;
    }

    const duplicate = roomTypes.some(
      (type) => type.name.toLowerCase() === name.toLowerCase() && type.id !== editingType?.id,
    );

    if (duplicate) {
      alert("This room type name is already in use.");
      return;
    }

    if (editingType) {
      const oldName = editingType.name;

      setRoomTypes((current) =>
        current.map((type) =>
          type.id === editingType.id
            ? {
                ...type,
                name,
                description: typeForm.description.trim(),
                capacity,
                facilities: typeForm.facilities.trim(),
                price,
              }
            : type,
        ),
      );

      if (oldName !== name) {
        setRooms((current) =>
          current.map((room) => (room.type === oldName ? { ...room, type: name } : room)),
        );
      }
    } else {
      setRoomTypes((current) => [
        ...current,
        {
          id: Math.max(0, ...current.map((type) => type.id)) + 1,
          name,
          description: typeForm.description.trim(),
          capacity,
          facilities: typeForm.facilities.trim(),
          price,
        },
      ]);
    }

    setShowTypeModal(false);
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <AdminSidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <AdminTopbar />

        <main className="w-full min-w-0 px-4 pb-10 pt-[84px] sm:px-6 md:px-8 md:pb-16 md:pt-[74px]">
          {/* Page Title */}
          <section className="mb-7">
            <h1 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
              Room Management
            </h1>
            <p className="mt-1 text-[13px] text-gray-500">
              Room types, units, facilities, status, and rates.
            </p>
          </section>

          {/* Room Summary */}
          <section className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Total Room Units", value: totalRooms, color: "#C6A46A" },
              { label: "Available Rooms", value: availableRooms, color: "#A5B1A0" },
              { label: "Occupied Rooms", value: occupiedRooms, color: "#192B35" },
              { label: "Under Maintenance", value: maintenanceRooms, color: "#C58A80" },
            ].map((item) => (
              <div
                key={item.label}
                className="min-w-0 rounded-[16px] border border-[#E2D8C8] bg-[#FFFDFA] px-4 py-4"
                style={{ borderTop: `4px solid ${item.color}` }}
              >
                <p className="font-heading text-3xl font-semibold text-[#192B35]">{item.value}</p>
                <p className="mt-2 text-xs text-gray-600 sm:text-sm">{item.label}</p>
              </div>
            ))}
          </section>

          {/* Main Panel with Two Tabs */}
          <section className="min-w-0 rounded-[20px] border border-[#E2D8C8] bg-[#FFFDFA] p-4 sm:p-5 md:p-6">
            {/* Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setActiveTab("type");
                  setSearch("");
                }}
                className={`rounded-xl border px-5 py-3 text-sm font-medium transition ${
                  activeTab === "type"
                    ? "border-[#192B35] bg-[#192B35] text-white"
                    : "border-[#E2D8C8] bg-[#FFFDFA] text-[#192B35] hover:bg-[#F5F0E8]"
                }`}
              >
                Room Types & Rates
              </button>

              <button
                onClick={() => {
                  setActiveTab("unit");
                  setSearch("");
                }}
                className={`rounded-xl border px-5 py-3 text-sm font-medium transition ${
                  activeTab === "unit"
                    ? "border-[#192B35] bg-[#192B35] text-white"
                    : "border-[#E2D8C8] bg-[#FFFDFA] text-[#192B35] hover:bg-[#F5F0E8]"
                }`}
              >
                Room Units
              </button>
            </div>

            {/* Search, Filter, and Add Button */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <input
                type="text"
                placeholder={
                  activeTab === "unit" ? "Search room number or type..." : "Search room type..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-2 text-xs outline-none focus:border-[#C6A46A] sm:w-[260px]"
              />

              {activeTab === "unit" && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#DED8CE] bg-white px-3 py-2 text-xs outline-none focus:border-[#C6A46A] sm:w-auto"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              )}

              <button
                onClick={activeTab === "unit" ? openAddRoom : openAddType}
                disabled={activeTab === "unit" && roomTypes.length === 0}
                className="w-full rounded-lg bg-[#C6A46A] px-4 py-2 text-xs font-medium text-[#192B35] transition hover:bg-[#B8955D] disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:w-auto"
              >
                {activeTab === "unit" ? "+ Add Room Unit" : "+ Add Room Type"}
              </button>
            </div>

            {/* ROOM UNITS TAB */}
            {activeTab === "unit" && (
              <>
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[650px] table-fixed text-left text-xs md:min-w-0">
                    <thead className="border-b border-[#E2D8C8] text-[11px] uppercase text-gray-500">
                      <tr>
                        <th className="w-[6%] px-2 py-3 font-medium">No.</th>
                        <th className="w-[20%] px-2 py-3 font-medium">Room</th>
                        <th className="w-[22%] px-2 py-3 font-medium">Type</th>
                        <th className="w-[18%] px-2 py-3 font-medium">Floor</th>
                        <th className="w-[22%] px-2 py-3 font-medium">Status</th>
                        <th className="w-[12%] px-2 py-3 text-center font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRooms.length > 0 ? (
                        filteredRooms.map((room, index) => (
                          <tr
                            key={room.id}
                            className="border-b border-[#EEEAE3] hover:bg-[#FAF9F6]"
                          >
                            <td className="px-2 py-3 text-gray-500">{index + 1}</td>
                            <td className="break-words px-2 py-3 font-semibold text-[#192B35]">
                              {room.number}
                            </td>
                            <td className="break-words px-2 py-3">{room.type}</td>
                            <td className="px-2 py-3">Floor {room.floor}</td>
                            <td className="px-2 py-3">
                              <span
                                className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${statusStyles[room.status]}`}
                              >
                                {room.status}
                              </span>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <button
                                onClick={() => openEditRoom(room)}
                                className="font-medium text-[#9A763D] hover:underline"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                            No room units found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-xs text-gray-400">
                  Showing {filteredRooms.length} of {totalRooms} room units.
                </p>
              </>
            )}

            {/* ROOM TYPES AND RATES TAB */}
            {activeTab === "type" && (
              <>
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[850px] table-fixed text-left text-[11px] md:min-w-0">
                    <thead className="border-b border-[#E2D8C8] text-[10px] uppercase text-gray-500">
                      <tr>
                        <th className="w-[5%] px-2 py-3 font-medium">No.</th>
                        <th className="w-[14%] px-2 py-3 font-medium">Room Type</th>
                        <th className="w-[22%] px-2 py-3 font-medium">Description</th>
                        <th className="w-[10%] px-2 py-3 font-medium">Capacity</th>
                        <th className="w-[21%] px-2 py-3 font-medium">Facilities</th>
                        <th className="w-[17%] px-2 py-3 font-medium">Rate / Night</th>
                        <th className="w-[11%] px-2 py-3 text-center font-medium">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTypes.length > 0 ? (
                        filteredTypes.map((type, index) => (
                          <tr
                            key={type.id}
                            className="border-b border-[#EEEAE3] hover:bg-[#FAF9F6]"
                          >
                            <td className="px-2 py-3 text-gray-500">{index + 1}</td>
                            <td className="break-words px-2 py-3 font-semibold text-[#192B35]">
                              {type.name}
                            </td>
                            <td className="break-words px-2 py-3 leading-5 text-gray-500">
                              {type.description}
                            </td>
                            <td className="px-2 py-3">{type.capacity} guests</td>
                            <td className="break-words px-2 py-3 leading-5">{type.facilities}</td>
                            <td className="break-words px-2 py-3 font-medium text-[#192B35]">
                              {formatRupiah(type.price)}
                            </td>
                            <td className="px-2 py-3 text-center">
                              <button
                                onClick={() => openEditType(type)}
                                className="font-medium text-[#9A763D] hover:underline"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                            No room types found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-xs text-gray-400">
                  Showing {filteredTypes.length} of {roomTypes.length} room types.
                </p>
              </>
            )}
          </section>
        </main>
      </div>

      {/* ADD / EDIT ROOM UNIT MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-3 sm:p-4">
          <div className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[20px] bg-[#FFFDFA] p-5 shadow-xl sm:p-7 md:max-h-none">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                  {editingRoom ? "Edit Room Unit" : "Add Room Unit"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">Complete the room unit information.</p>
              </div>

              <button
                onClick={() => setShowRoomModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Room Number</label>
                <input
                  required
                  value={roomForm.number}
                  onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })}
                  placeholder="Example: S-106"
                  className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Room Type</label>
                  <select
                    required
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full rounded-lg border border-[#DED8CE] bg-white px-3 py-3 text-sm outline-none focus:border-[#C6A46A]"
                  >
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Floor</label>
                  <select
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    className="w-full rounded-lg border border-[#DED8CE] bg-white px-3 py-3 text-sm outline-none focus:border-[#C6A46A]"
                  >
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                    <option value="4">Floor 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Room Status</label>
                <select
                  value={roomForm.status}
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      status: e.target.value as RoomStatus,
                    })
                  }
                  className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="rounded-lg border border-[#DED8CE] px-5 py-3 text-sm text-gray-600 hover:bg-[#F5F0E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#192B35] px-5 py-3 text-sm font-medium text-white hover:bg-[#304650]"
                >
                  {editingRoom ? "Save Changes" : "Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT ROOM TYPE MODAL */}
      {showTypeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-3 sm:p-4">
          <div className="my-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[20px] bg-[#FFFDFA] p-5 shadow-xl sm:p-7 md:max-h-none">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                  {editingType ? "Edit Room Type" : "Add Room Type"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Complete the room type details and rates.
                </p>
              </div>

              <button
                onClick={() => setShowTypeModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTypeSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Room Type Name</label>
                <input
                  required
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="Example: Executive"
                  className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Room Description</label>
                <textarea
                  required
                  rows={3}
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  placeholder="Enter room description..."
                  className="w-full resize-none rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Capacity (guests)</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={typeForm.capacity}
                  onChange={(e) => setTypeForm({ ...typeForm, capacity: e.target.value })}
                  className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Room Facilities</label>
                <textarea
                  required
                  rows={2}
                  value={typeForm.facilities}
                  onChange={(e) => setTypeForm({ ...typeForm, facilities: e.target.value })}
                  placeholder="Example: Wi-Fi, AC, TV, bathroom"
                  className="w-full resize-none rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Rate per Night (IDR)</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={typeForm.price}
                  onChange={(e) => setTypeForm({ ...typeForm, price: e.target.value })}
                  placeholder="Example: 450000"
                  className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                />
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="rounded-lg border border-[#DED8CE] px-5 py-3 text-sm text-gray-600 hover:bg-[#F5F0E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#192B35] px-5 py-3 text-sm font-medium text-white hover:bg-[#304650]"
                >
                  {editingType ? "Save Changes" : "Add Room Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
