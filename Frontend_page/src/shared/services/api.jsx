/**
 * Centralized API Service Barrel Export
 * Aggregates all modular domain services (Auth, Catalog, Event, Venue, Vendor, Sponsor, Exhibitor, Superuser)
 * Maintains 100% backwards compatibility for existing imports across the project.
 */
import apiClient, { BASE_URL } from "./client";
export { BASE_URL };
export const api = apiClient;

export * from "./authService";
export * from "./eventService";
export * from "./venueService";
export * from "./vendorService";
export * from "./sponsorService";
export * from "./policyService";
export * from "./bookingService";
export * from "./miscService";
export * from "./locationService";

// Clean Layered Feature API Exports
export * from "@/features/auth/api/auth.api";
export * from "@/features/catalog/api/category.api";
export * from "@/features/events/api/event.api";
export * from "@/features/venue/api/venue.api";
export * from "@/features/vendor/api/vendor.api";
export * from "@/features/sponsor/api/sponsor.api";
export * from "@/features/exhibitor/api/exhibitor.api";
export * from "@/features/superuser/api/superuser.api";
export * from "@/features/users/api/user.api";

export default apiClient;
