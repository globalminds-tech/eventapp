import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// ── GLOBAL DESIGN SYSTEM TOKENS ─────────────────────────────────────────────
export const COLORS = {
  primary: "#0284c7",       // Sky Blue
  accent: "#f97316",        // BookMyEvent Orange Accent
  dark: "#0f172a",          // Dark Slate Typography
  subText: "#64748b",       // Slate Subtitle
  bgLight: "#f8fafc",       // Light Background
  white: "#ffffff",         // Pure White
  border: "#f1f5f9",        // Light Border
  green: "#16a34a",         // Success Green
  greenBg: "#dcfce7",
  amber: "#b45309",         // Rating Amber
  amberBg: "#ffedd5",
};

export const GLOBAL_STYLES = StyleSheet.create({
  // ── Edge-to-Edge Curved Header Background Container ────────────────────────
  curvedHeaderBgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 290,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
    zIndex: 0,
  },
  softPastelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },

  // ── Brand Logo Header Row ──────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIconWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },
  logoDot: {
    width: 6,
    height: 12,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.dark,
    letterSpacing: -0.5,
  },

  // ── Floating White Search Bar ─────────────────────────────────────────────
  searchBarWrap: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  searchInputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: "600",
  },

  // ── Category Selector Pills ───────────────────────────────────────────────
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryPillSelected: {
    backgroundColor: COLORS.accent, // Orange Selected Pill
    elevation: 2,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  categoryPillUnselected: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  categoryPillTextSelected: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 13,
  },
  categoryPillTextUnselected: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Event Grid & Cards ────────────────────────────────────────────────────
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  gridCardImg: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },

  // ── Floating Pill Navigation Bar ──────────────────────────────────────────
  floatingPillNavBar: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 56,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
