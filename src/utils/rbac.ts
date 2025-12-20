/**
 * Role-Based Access Control (RBAC) Utilities
 *
 * Defines user roles, permissions, and helper functions for
 * authorization checks throughout the admin panel.
 */

export type UserRole = 'super_admin' | 'staff' | 'manufacturer';

export type Resource =
  | 'quotes'
  | 'dashboard'
  | 'invoices'
  | 'airwallex'
  | 'googleAds'
  | 'settings'
  | 'auditLogs'
  | 'userManagement';

export type Action = 'view' | 'edit';

export interface Permission {
  view: boolean;
  edit: boolean;
}

export type RolePermissions = Record<Resource, Permission>;

/**
 * Permission matrix defining what each role can do
 *
 * Super Admin: Full access to everything
 * Staff: View all admin pages except audit logs and user management, full quote access
 * Manufacturer: Quotes only
 */
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    quotes: { view: true, edit: true },
    dashboard: { view: true, edit: true },
    invoices: { view: true, edit: true },
    airwallex: { view: true, edit: true },
    googleAds: { view: true, edit: true },
    settings: { view: true, edit: true },
    auditLogs: { view: true, edit: true },
    userManagement: { view: true, edit: true },
  },
  staff: {
    quotes: { view: true, edit: true },
    dashboard: { view: true, edit: false },
    invoices: { view: true, edit: false },
    airwallex: { view: true, edit: false },
    googleAds: { view: true, edit: false },
    settings: { view: true, edit: false },
    auditLogs: { view: false, edit: false },
    userManagement: { view: false, edit: false },
  },
  manufacturer: {
    quotes: { view: true, edit: true },
    dashboard: { view: false, edit: false },
    invoices: { view: false, edit: false },
    airwallex: { view: false, edit: false },
    googleAds: { view: false, edit: false },
    settings: { view: false, edit: false },
    auditLogs: { view: false, edit: false },
    userManagement: { view: false, edit: false },
  },
};

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: UserRole | undefined,
  resource: Resource,
  action: Action
): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions[resource]?.[action] ?? false;
}

/**
 * Check if a role can access any admin panel pages (not just quotes)
 */
export function canAccessAdminPanel(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === 'super_admin' || role === 'staff';
}

/**
 * Check if a role is super admin
 */
export function isSuperAdmin(role: UserRole | undefined): boolean {
  return role === 'super_admin';
}

/**
 * Check if a role is staff
 */
export function isStaff(role: UserRole | undefined): boolean {
  return role === 'staff';
}

/**
 * Check if a role is manufacturer
 */
export function isManufacturer(role: UserRole | undefined): boolean {
  return role === 'manufacturer';
}

/**
 * Get human-readable display name for a role
 */
export function getRoleDisplayName(role: UserRole | undefined): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'staff':
      return 'Staff';
    case 'manufacturer':
      return 'Manufacturer';
    default:
      return 'Unknown';
  }
}

/**
 * Get all available roles for dropdowns/selectors
 */
export function getAllRoles(): { value: UserRole; label: string }[] {
  return [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'staff', label: 'Staff' },
    { value: 'manufacturer', label: 'Manufacturer' },
  ];
}

/**
 * Validate if a string is a valid UserRole
 */
export function isValidRole(role: string): role is UserRole {
  return ['super_admin', 'staff', 'manufacturer'].includes(role);
}
