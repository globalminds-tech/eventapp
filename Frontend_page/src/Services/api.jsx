/**
 * Centralized API Service Barrel Export
 * Aggregates all modular domain services (Auth, Event, Venue, Vendor, Sponsor, Policy, Booking, Misc, Location)
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

export default apiClient;
