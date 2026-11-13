"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopbar from "@/components/admin/Topbar";

type UserRole = "Admin" | "Resepsionis" | "Housekeeping" | "Tamu";
type UserStatus = "Aktif" | "Nonaktif";

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
  { id: "reservations", label: "Manajemen Reservasi" },
  { id: "checkin", label: "Check-in & Check-out" },
  { id: "rooms", label: "Manajemen Kamar" },
  { id: "users", label: "Manajemen Pengguna" },
  { id: "reports", label: "Laporan" },
  { id: "housekeeping", label: "Tugas Housekeeping" },
];

const rolePermissions: Record<UserRole, Permission[]> = {
  Admin: ["dashboard", "reservations", "checkin", "rooms", "users", "reports", "housekeeping"],
  Resepsionis: ["dashboard", "reservations", "checkin"],
  Housekeeping: ["dashboard", "housekeeping"],
  Tamu: ["dashboard", "reservations"],
};

const initialUsers: User[] = [
  {
    id: 1,
    name: "Administrator",
    email: "admin@scajaya.com",
    phone: "081234567801",
    role: "Admin",
    status: "Aktif",
    permissions: rolePermissions.Admin,
  },
  {
    id: 2,
    name: "Andi Pratama",
    email: "andi@scajaya.com",
    phone: "081234567802",
    role: "Resepsionis",
    status: "Aktif",
    permissions: rolePermissions.Resepsionis,
  },
  {
    id: 3,
    name: "Siti Rahma",
    email: "siti@scajaya.com",
    phone: "081234567803",
    role: "Resepsionis",
    status: "Aktif",
    permissions: rolePermissions.Resepsionis,
  },
  {
    id: 4,
    name: "Budi Santoso",
    email: "budi@scajaya.com",
    phone: "081234567804",
    role: "Housekeeping",
    status: "Aktif",
    permissions: rolePermissions.Housekeeping,
  },
  {
    id: 5,
    name: "Dewi Lestari",
    email: "dewi@email.com",
    phone: "081234567805",
    role: "Tamu",
    status: "Nonaktif",
    permissions: rolePermissions.Tamu,
  },
];

const statusStyles: Record<UserStatus, string> = {
  Aktif: "bg-[#E7EEE5] text-[#587052]",
  Nonaktif: "bg-[#F3E2DF] text-[#A15F55]",
};

const roleStyles: Record<UserRole, string> = {
  Admin: "bg-[#E5E9EC] text-[#192B35]",
  Resepsionis: "bg-[#F4EBD9] text-[#9A763D]",
  Housekeeping: "bg-[#E7EEE5] text-[#587052]",
  Tamu: "bg-[#F0E8F2] text-[#80618A]",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Tamu" as UserRole,
    status: "Aktif" as UserStatus,
    permissions: [...rolePermissions.Tamu] as Permission[],
  });

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.includes(keyword);

      const matchesRole = filterRole === "Semua" || user.role === filterRole;

      const matchesStatus = filterStatus === "Semua" || user.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const activeUsers = users.filter((user) => user.status === "Aktif").length;
  const inactiveUsers = users.filter((user) => user.status === "Nonaktif").length;

  function openAddModal() {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "Tamu",
      status: "Aktif",
      permissions: [...rolePermissions.Tamu],
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
      alert("Semua informasi pengguna harus diisi.");
      return;
    }

    const duplicateEmail = users.some(
      (user) => user.email.toLowerCase() === email && user.id !== editingUser?.id,
    );

    if (duplicateEmail) {
      alert("Email sudah digunakan oleh pengguna lain.");
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
    <div className="min-h-screen bg-[#F5F0E8] text-[#343A3D]">
      <AdminSidebar />

      <div className="ml-[210px] min-h-screen">
        <AdminTopbar />

        <main className="px-8 pb-16 pt-8">
          {/* Judul halaman */}
          <section className="mb-7">
            <h1 className="font-heading text-3xl font-semibold text-[#192B35]">
              Manajemen Pengguna
            </h1>
            <p className="mt-1 text-[13px] text-gray-500">Akun, role, dan hak akses.</p>
          </section>

          {/* Ringkasan pengguna */}
          <section className="mb-7 grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Pengguna",
                value: users.length,
                color: "#C6A46A",
              },
              {
                label: "Pengguna Aktif",
                value: activeUsers,
                color: "#A5B1A0",
              },
              {
                label: "Pengguna Nonaktif",
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

          {/* Tabel pengguna */}
          <section className="rounded-[20px] border border-[#E2D8C8] bg-[#FFFDFA] p-6">
            <div className="mb-6">
              <h2 className="font-heading text-xl font-semibold text-[#192B35]">Daftar Pengguna</h2>
              <p className="mt-1 text-sm text-gray-500">
                Informasi akun dan pengaturan akses pengguna.
              </p>
            </div>

            {/* Pencarian dan filter */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Cari nama, email, atau nomor telepon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full rounded-lg border border-[#DED8CE] bg-white px-2 text-xs outline-none focus:border-[#C6A46A] sm:w-[245px]"
              />

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="h-8 rounded-lg border border-[#DED8CE] bg-white px-2 text-xs outline-none focus:border-[#C6A46A] sm:w-[115px]"
              >
                <option value="Semua">Semua Role</option>
                <option value="Admin">Admin</option>
                <option value="Resepsionis">Resepsionis</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Tamu">Tamu</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-8 rounded-lg border border-[#DED8CE] bg-white px-2 text-xs outline-none focus:border-[#C6A46A] sm:w-[115px]"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>

              <button
                onClick={openAddModal}
                className="ml-auto h-8 rounded-lg bg-[#C6A46A] px-3 py-2.5 text-xs font-medium text-[#192B35] transition hover:bg-[#B8955D]"
              >
                + Tambah Pengguna
              </button>
            </div>

            {/* Tabel */}
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[750px] table-fixed text-left text-xs">
                <thead className="border-b border-[#E2D8C8] text-[10px] uppercase text-gray-500">
                  <tr>
                    <th className="w-[6%] px-2 py-3 font-medium">No.</th>
                    <th className="w-[20%] px-2 py-3 font-medium">Nama Pengguna</th>
                    <th className="w-[24%] px-2 py-3 font-medium">Email</th>
                    <th className="w-[15%] px-2 py-3 font-medium">No. Telepon</th>
                    <th className="w-[15%] px-2 py-3 font-medium">Role</th>
                    <th className="w-[10%] px-2 py-3 font-medium">Status</th>
                    <th className="w-[10%] px-2 py-3 text-center font-medium">Aksi</th>
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
                            Ubah
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        Pengguna tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-gray-400">
              Menampilkan {filteredUsers.length} dari {users.length} pengguna.
            </p>
          </section>
        </main>
      </div>

      {/* Modal tambah dan edit pengguna */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[20px] bg-[#FFFDFA] p-7 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-[#192B35]">
                  {editingUser ? "Ubah Pengguna" : "Tambah Pengguna"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Lengkapi informasi akun dan atur hak akses pengguna.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Informasi akun */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Informasi Akun</h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Nama Lengkap</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
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
                      placeholder="nama@email.com"
                      className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Nomor Telepon</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full rounded-lg border border-[#DED8CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#C6A46A]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EEEAE3]" />

              {/* Role dan status */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#192B35]">Role dan Status Akun</h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Role Pengguna</label>
                    <select
                      value={form.role}
                      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                      className="w-full rounded-lg border border-[#DED8CE] bg-white px-3 py-3 text-sm outline-none focus:border-[#C6A46A]"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Resepsionis">Resepsionis</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Tamu">Tamu</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Status Akun</label>
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
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EEEAE3]" />

              {/* Hak akses */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-[#192B35]">Hak Akses Pengguna</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Pilih menu yang dapat diakses oleh pengguna ini.
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

              {/* Tombol */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#DED8CE] px-5 py-3 text-sm text-gray-600 hover:bg-[#F5F0E8]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#192B35] px-5 py-3 text-sm font-medium text-white hover:bg-[#304650]"
                >
                  {editingUser ? "Simpan Perubahan" : "Tambah Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
