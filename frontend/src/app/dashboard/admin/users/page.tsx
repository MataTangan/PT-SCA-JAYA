"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";

type UserRole = "Admin" | "Receptionist" | "Housekeeping" | "Guest";
type UserStatus = "Active" | "Inactive";

type Permission =
  | "dashboard"
  | "reservations"
  | "checkin"
  | "rooms"
  | "users"
  | "reports"
  | "housekeeping";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
};

const permissionOptions: { id: Permission; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "reservations", label: "Reservation Management" },
  { id: "checkin", label: "Check-in & Check-out" },
  { id: "rooms", label: "Room Management" },
  { id: "users", label: "User Management" },
  { id: "reports", label: "Reports" },
  { id: "housekeeping", label: "Housekeeping Tasks" },
];

const rolePermissions: Record<UserRole, Permission[]> = {
  Admin: ["dashboard", "reservations", "checkin", "rooms", "users", "reports", "housekeeping"],
  Receptionist: ["dashboard", "reservations", "checkin"],
  Housekeeping: ["dashboard", "housekeeping"],
  Guest: ["dashboard", "reservations"],
};

const initialUsers: User[] = [
  {
    id: 1,
    name: "Administrator",
    email: "admin@scajaya.com",
    phone: "081234567801",
    role: "Admin",
    status: "Active",
    permissions: rolePermissions.Admin,
  },
  {
    id: 2,
    name: "Andi Pratama",
    email: "andi@scajaya.com",
    phone: "081234567802",
    role: "Receptionist",
    status: "Active",
    permissions: rolePermissions.Receptionist,
  },
  {
    id: 3,
    name: "Siti Rahma",
    email: "siti@scajaya.com",
    phone: "081234567803",
    role: "Receptionist",
    status: "Active",
    permissions: rolePermissions.Receptionist,
  },
  {
    id: 4,
    name: "Budi Santoso",
    email: "budi@scajaya.com",
    phone: "081234567804",
    role: "Housekeeping",
    status: "Active",
    permissions: rolePermissions.Housekeeping,
  },
  {
    id: 5,
    name: "Dewi Lestari",
    email: "dewi@email.com",
    phone: "081234567805",
    role: "Guest",
    status: "Inactive",
    permissions: rolePermissions.Guest,
  },
];

const statusStyles: Record<UserStatus, string> = {
  Active: "bg-[#E7EEE5] text-[#587052]",
  Inactive: "bg-[#F3E2DF] text-[#A15F55]",
};

const roleStyles: Record<UserRole, string> = {
  Admin: "bg-[#E5E9EC] text-[#192B35]",
  Receptionist: "bg-[#F4EBD9] text-[#9A763D]",
  Housekeeping: "bg-[#E7EEE5] text-[#587052]",
  Guest: "bg-[#F0E8F2] text-[#80618A]",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Guest" as UserRole,
    status: "Active" as UserStatus,
    permissions: [...rolePermissions.Guest] as Permission[],
  });

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.includes(keyword);

      const matchesRole = filterRole === "All" || user.role === filterRole;
      const matchesStatus = filterStatus === "All" || user.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const activeUsers = users.filter((user) => user.status === "Active").length;
  const inactiveUsers = users.filter((user) => user.status === "Inactive").length;

  function openAddModal() {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "Guest",
      status: "Active",
      permissions: [...rolePermissions.Guest],
    });
    setShowModal(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      permissions: [...user.permissions],
    });
    setShowModal(true);
  }

  function handleRoleChange(role: UserRole) {
    setForm((current) => ({
      ...current,
      role,
      permissions: [...rolePermissions[role]],
    }));
  }

  function togglePermission(permission: Permission) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name || !email || !phone) {
      alert("All user information must be filled in.");
      return;
    }

    const duplicateEmail = users.some(
      (user) => user.email.toLowerCase() === email && user.id !== editingUser?.id,
    );

    if (duplicateEmail) {
      alert("This email is already being used by another user.");
      return;
    }

    if (editingUser) {
      setUsers((current) =>
        current.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                ...form,
                name,
                email,
                phone,
              }
            : user,
        ),
      );
    } else {
      setUsers((current) => [
        ...current,
        {
          id: Math.max(0, ...current.map((user) => user.id)) + 1,
          ...form,
          name,
          email,
          phone,
        },
      ]);
    }

    setShowModal(false);
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F5F0E8] text-[#343A3D]">
      <AdminSidebar />

      <div className="min-h-screen min-w-0 w-full md:ml-[210px] md:w-[calc(100%-210px)]">
        <AdminTopbar />

        {/* Space for fixed Topbar */}
        <div className="h-[60px] md:h-[50px]" />

        <main className="w-full min-w-0 px-4 pb-10 pt-6 sm:px-6 md:px-8 md:pb-16 md:pt-8">
          {/* Page Title */}
          <section className="mb-7">
            <h1 className="font-heading text-2xl font-semibold text-[#192B35] sm:text-3xl">
              User Management
            </h1>
            <p className="mt-1 text-[13px] text-gray-500">
              Accounts, roles, and access permissions.
            </p>
          </section>

          {/* User Summary */}
          <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "Total Users",
                value: users.length,
                color: "#C6A46A",
              },
              {
                label: "Active Users",
                value: activeUsers,
                color: "#A5B1A0",
              },
              {
                label: "Inactive Users",
                value: inactiveUsers,
                color: "#C58A80",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border border-[#E2D8C8] bg-[#FFFDFA] px-5 py-4"
                style={{ borderTop: `4px solid ${item.color}` }}
              >
                <p className="font-heading text-3xl font-semibold text-[#192B35]">{item.value}</p>
                <p className="mt-2 text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </section>

          {/* User Table */}
          <section className="min-w-0 rounded-[20px] border border-[#E2D8C8] bg-[#FFFDFA] p-4 sm:p-5 md:p-6">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-semibold text-[#192B35]">User List</h2>
              <p className="mt-1 text-sm text-gray-500">
                User account information and access settings.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <input
                type="text"
                placeholder="Search name, email, or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full rounded-lg border border-[#DED8CE] bg-white px-2 text-xs outline-none focus:border-[#C6A46A] sm:w-[245px]"
              />

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="h-8 w-full rounded-lg border border-[#DED8CE] bg-white px-2 text-xs outline-none focus:border-[#C6A46A] sm:w-[115px]"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Guest">Guest</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-8 w-full rounded-lg border border-[#DED8CE] bg-white px-2 text-xs outline-none focus:border-[#C6A46A] sm:w-[115px]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                onClick={openAddModal}
                className="h-8 w-full rounded-lg bg-[#C6A46A] px-3 py-2.5 text-xs font-medium text-[#192B35] transition hover:bg-[#B8955D] sm:ml-auto sm:w-auto"
              >
                + Add User
              </button>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[750px] table-fixed text-left text-xs md:min-w-0">
                <thead className="border-b border-[#E2D8C8] text-[10px] uppercase text-gray-500">
                  <tr>
                    <th className="w-[6%] px-2 py-3 font-medium">No.</th>
                    <th className="w-[20%] px-2 py-3 font-medium">User Name</th>
                    <th className="w-[24%] px-2 py-3 font-medium">Email</th>
                    <th className="w-[15%] px-2 py-3 font-medium">Phone Number</th>
                    <th className="w-[15%] px-2 py-3 font-medium">Role</th>
                    <th className="w-[10%] px-2 py-3 font-medium">Status</th>
                    <th className="w-[10%] px-2 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={user.id} className="border-b border-[#EEEAE3] hover:bg-[#FAF9F6]">
                        <td className="px-2 py-4 text-gray-500">{index + 1}</td>
                        <td className="break-words px-2 py-4 font-semibold text-[#192B35]">
                          {user.name}
                        </td>
                        <td className="break-all px-2 py-4 text-gray-600">{user.email}</td>
                        <td className="px-2 py-4">{user.phone}</td>
                        <td className="px-2 py-4">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${roleStyles[user.role]}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-2 py-4">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium ${statusStyles[user.status]}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <button
                            onClick={() => openEditModal(user)}
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
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Showing {filteredUsers.length} of {users.length} users.
            </p>
          </section>
        </main>
      </div>

      {/* Add and Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-3 sm:p-4">
          <div className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[20px] bg-[#FFFDFA] p-5 shadow-xl sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                  {editingUser ? "Edit User" : "Add User"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Complete the account information and set user access permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Information */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Account Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Full Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@email.com"
                      className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Example: 081234567890"
                      className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EEEAE3]" />

              {/* Role and Status */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#192B35]">
                  Role and Account Status
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">User Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                      className="w-full rounded-lg border border-[#DED8CE] bg-white px-3 py-3 text-sm outline-none focus:border-[#C6A46A]"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Guest">Guest</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Account Status</label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as UserStatus,
                        })
                      }
                      className="w-full rounded-lg border border-[#DED8CE] bg-white px-3 py-3 text-sm outline-none focus:border-[#C6A46A]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EEEAE3]" />

              {/* Access Permissions */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-[#192B35]">User Access Permissions</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Select the menus this user can access.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E2D8C8] bg-[#FAF9F6] p-4 sm:grid-cols-2">
                  {permissionOptions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="h-4 w-4 accent-[#192B35]"
                      />
                      {permission.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse justify-end gap-3 pt-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#DED8CE] px-5 py-3 text-sm text-gray-600 hover:bg-[#F5F0E8]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#192B35] px-5 py-3 text-sm font-medium text-white hover:bg-[#304650]"
                >
                  {editingUser ? "Save Changes" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
