export const ROLE_SLUGS = ["guest", "receptionist", "housekeeping", "admin"] as const;
export type RoleSlug = (typeof ROLE_SLUGS)[number];

export const STAFF_ROLE_SLUGS = ["receptionist", "admin"] as const;

export const PERMISSION_CODES = {
  profileRead: "profile.read",
  profileUpdate: "profile.update",
  roleRead: "role.read",
  roleManage: "role.manage",
  roomRead: "room.read",
  roomManage: "room.manage",
  facilityManage: "facility.manage",
  rateRead: "rate.read",
  rateManage: "rate.manage",
  reservationRead: "reservation.read",
  reservationCreate: "reservation.create",
  reservationManage: "reservation.manage",
  reservationCancel: "reservation.cancel",
  availabilityRead: "availability.read",
  allocationManage: "allocation.manage",
  checkInManage: "checkin.manage",
  checkOutManage: "checkout.manage",
  paymentRead: "payment.read",
  paymentManage: "payment.manage",
  housekeepingRead: "housekeeping.read",
  housekeepingUpdate: "housekeeping.update",
  reportRead: "report.read",
} as const;

export type PermissionCode = (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];
