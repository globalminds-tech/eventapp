import { useState } from "react";

// ── data ─────────────────────────────────────────────────────────────────────
const monthlyPlans = [
  {
    id: "basic",
    name: "BASIC",
    price: "99.99",
    period: "Month",
    medal: "🥉",
    features: ["10 Event", "Max100 Tickets", "Limited Support"],
  },
  {
    id: "pro",
    name: "PRO",
    price: "199.99",
    period: "Month",
    medal: "🥈",
    features: ["20 Event", "Max250 Tickets", "Limited Support"],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "999.99",
    period: "Month",
    medal: "🥇",
    features: ["50 Event", "Max300 Tickets", "Limited Support"],
  },
];

const yearlyPlans = [
  {
    id: "basic",
    name: "BASIC",
    price: "1000.99",
    period: "Year",
    medal: "🥉",
    features: ["100 Event", "Max500 Tickets", "Limited Support"],
  },
  {
    id: "pro",
    name: "PRO",
    price: "2000.99",
    period: "Year",
    medal: "🥈",
    features: ["150 Event", "Max750 Tickets", "Limited Support"],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "5000.99",
    period: "Year",
    medal: "🥇",
    features: ["200 Event", "Max10000 Tickets", "Limited Support"],
  },
];

// ── ProgressBar ───────────────────────────────────────────────────────────────
function ProgressBar({ label, display, pct }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          width: "100%",
          height: 8,
          background: "#e2e6f0",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "#3b5bdb",
            borderRadius: 99,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#666",
        }}
      >
        <span>{display}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

// ── PAGE 1 : My Plans ─────────────────────────────────────────────────────────
function MyPlansPage({ onUpgrade }) {
  const card = {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e4e9f4",
    padding: "28px 30px 32px",
  };

  return (
    <div
      style={{
        padding: "36px 40px",
        background: "#f5f7fc",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", marginBottom: 28 }}>
        My Plans
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Plan Information */}
        <div style={card}>
          <h2 style={{ color: "#3b5bdb", fontWeight: 700, fontSize: 17, marginBottom: 22 }}>
            Plan Information
          </h2>
          {[
            ["Current Plan", "Organizer - Enterprise"],
            ["Subscriber ID", "EP005"],
            ["Valid Upto", "February 26, 2026 at 08:08 PM"],
            ["Address", ""],
          ].map(([label, val]) => (
            <div
              key={label}
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                fontSize: 14,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{ fontWeight: 700, color: "#1a1a2e", minWidth: 116, flexShrink: 0 }}
              >
                {label}
              </span>
              <span style={{ color: "#555" }}>:</span>
              <span style={{ color: "#444" }}>{val}</span>
            </div>
          ))}
          <button
            onClick={onUpgrade}
            style={{
              marginTop: 18,
              border: "2px solid #3b5bdb",
              background: "transparent",
              color: "#3b5bdb",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.12em",
              padding: "9px 26px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            UPGRADE
          </button>
        </div>

        {/* Plan Usage */}
        <div style={card}>
          <h2 style={{ color: "#3b5bdb", fontWeight: 700, fontSize: 17, marginBottom: 22 }}>
            Plan Usage
          </h2>
          <ProgressBar label="Events Hosted" display="12 of 200 Events" pct={6} />
          <ProgressBar label="Visitors Count" display="99 of 10000 Visitors" pct={1} />
          <ProgressBar label="Created Users" display="5 of 35 Users" pct={14} />
        </div>

        {/* Account Status */}
        <div style={card}>
          <h2 style={{ color: "#3b5bdb", fontWeight: 700, fontSize: 17, marginBottom: 22 }}>
            Account Status
          </h2>
          <p style={{ fontSize: 14, color: "#333", lineHeight: 1.65, marginBottom: 14 }}>
            Your account is active and will be billed on{" "}
            <strong>Feb 26, 2026</strong>.
          </p>
          <p style={{ fontSize: 14, color: "#333", lineHeight: 1.65, marginBottom: 36 }}>
            If you cancel, your account will be closed and you'll lose your data.
          </p>
          <button
            style={{
              border: "2px solid #3b5bdb",
              background: "transparent",
              color: "#3b5bdb",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.1em",
              padding: "10px 0",
              borderRadius: 6,
              cursor: "pointer",
              width: "100%",
              fontFamily: "inherit",
            }}
          >
            CANCEL ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAGE 2 : Select Plans ─────────────────────────────────────────────────────
function SelectPlansPage({ onChoosePlan }) {
  const [yearly, setYearly] = useState(false);
  const plans = yearly ? yearlyPlans : monthlyPlans;

  return (
    <div
      style={{
        padding: "36px 40px",
        background: "#edf0fb",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", marginBottom: 28 }}>
        Select Plans
      </h1>

      {/* Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          marginBottom: 36,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.1em",
            color: !yearly ? "#3b5bdb" : "#aaa",
          }}
        >
          MONTHLY
        </span>
        <button
          onClick={() => setYearly(!yearly)}
          style={{
            width: 50,
            height: 26,
            borderRadius: 99,
            background: "#3b5bdb",
            border: "none",
            cursor: "pointer",
            position: "relative",
            padding: 0,
            outline: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: yearly ? 23 : 3,
              width: 20,
              height: 20,
              background: "#fff",
              borderRadius: "50%",
              transition: "left 0.22s ease",
              display: "block",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </button>
        <span
          style={{
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.1em",
            color: yearly ? "#3b5bdb" : "#aaa",
          }}
        >
          YEARLY
        </span>
      </div>

      {/* Plan Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e4e9f4",
              padding: "28px 28px 24px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Medal */}
            <div
              style={{
                width: 62,
                height: 62,
                background: "#dce6ff",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 16,
              }}
            >
              {plan.medal}
            </div>

            <div
              style={{
                color: "#3b5bdb",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              {plan.name}
            </div>

            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
              Starts From :
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 4,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: "#1a1a2e",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {plan.price}
              </span>
              <span style={{ fontSize: 14, color: "#777" }}>/ {plan.period}</span>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #eef0f6", margin: "0 0 16px" }} />

            <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 10 }}>
              Features :
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", flex: 1 }}>
              {plan.features.map((f) => (
                <li
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "#444",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "1.5px solid #999",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#888",
                      flexShrink: 0,
                    }}
                  >
                    ➔
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onChoosePlan(plan)}
              style={{
                width: "100%",
                background: "#3b5bdb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "13px 0",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PAGE 3 : Payment ──────────────────────────────────────────────────────────
function PaymentPage({ plan }) {
  const [coupon, setCoupon] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleProceed = async () => {
    if (!agreed) {
      alert("Please agree to the Terms & Conditions.");
      return;
    }
    try {
      // await axios.post("/api/payment/proceed", { planId: plan.id, coupon });
      alert("Redirecting to payment gateway…");
    } catch (err) {
      console.error(err);
    }
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#1a1a2e",
    marginBottom: 6,
  };

  const inputStyle = {
    width: "100%",
    border: "1px solid #d8dff0",
    borderRadius: 7,
    padding: "9px 12px",
    fontSize: 13,
    color: "#333",
    background: "#f7f9fc",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        padding: "36px 40px 40px",
        background: "#f5f7fc",
        minHeight: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", marginBottom: 28 }}>
        Payment
      </h1>

      <div style={{ display: "flex", gap: 20, flex: 1 }}>
        {/* Billing Information */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e4e9f4",
            padding: "28px 32px 32px",
            flex: 1,
          }}
        >
          <h2 style={{ color: "#3b5bdb", fontWeight: 700, fontSize: 17, marginBottom: 24 }}>
            Billing Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <div>
              <label style={labelStyle}>
                Name <span style={{ color: "#e03131" }}>*</span>
              </label>
              <input type="text" placeholder="Sakthi" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>
                Mail Id <span style={{ color: "#e03131" }}>*</span>
              </label>
              <input
                type="email"
                placeholder="sakthivelganesan@leitenindia.com"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Address</label>
            <textarea
              placeholder="Enter Address"
              rows={7}
              style={{
                ...inputStyle,
                background: "#fff",
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e4e9f4",
            padding: "28px 28px 28px",
            width: 380,
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ color: "#3b5bdb", fontWeight: 700, fontSize: 17, marginBottom: 24 }}>
            Order Summary
          </h2>

          {[
            [plan.name.charAt(0) + plan.name.slice(1).toLowerCase(), `₹${plan.price}`],
            ["Tax", "0.00 %"],
            ["Tax Total", "₹0.00"],
          ].map(([label, val]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                fontWeight: 600,
                color: "#1a1a2e",
                padding: "12px 0",
                borderBottom: "1px solid #eef0f6",
              }}
            >
              <span>{label}</span>
              <span>{val}</span>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              fontWeight: 600,
              color: "#1a1a2e",
              padding: "12px 0",
            }}
          >
            <span>Coupon Code (-)</span>
            <span>₹0.00</span>
          </div>

          {/* Coupon input */}
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              style={{
                flex: 1,
                border: "1px solid #d8dff0",
                borderRadius: 7,
                padding: "9px 12px",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
            <button
              style={{
                background: "#3b5bdb",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "9px 16px",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                letterSpacing: "0.04em",
                fontFamily: "inherit",
              }}
            >
              APPLY
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 15,
              fontWeight: 700,
              color: "#1a1a2e",
              padding: "16px 0 14px",
              borderTop: "1px solid #eef0f6",
              marginTop: 8,
            }}
          >
            <span>Total</span>
            <span>₹0.00</span>
          </div>

          {/* Terms */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                marginTop: 2,
                accentColor: "#3b5bdb",
                width: 14,
                height: 14,
                flexShrink: 0,
                cursor: "pointer",
              }}
            />
            <label htmlFor="terms" style={{ fontSize: 13, color: "#444", lineHeight: 1.55, cursor: "pointer" }}>
              By clicking "Proceed to Pay", you agree to our{" "}
              <a href="#" style={{ color: "#3b5bdb", textDecoration: "underline" }}>
                Terms &amp; Conditions
              </a>
              ,
            </label>
          </div>
        </div>
      </div>

      {/* Proceed button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}>
        <button
          onClick={handleProceed}
          style={{
            border: "2px solid #3b5bdb",
            background: "transparent",
            color: "#3b5bdb",
            fontWeight: 600,
            fontSize: 14,
            padding: "10px 26px",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "inherit",
          }}
        >
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function PlanManagement() {
  const [page, setPage] = useState("myplans");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleChoosePlan = (plan) => {
    setSelectedPlan(plan);
    setPage("payment");
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>
      {page === "myplans" && (
        <MyPlansPage onUpgrade={() => setPage("selectplans")} />
      )}
      {page === "selectplans" && (
        <SelectPlansPage onChoosePlan={handleChoosePlan} />
      )}
      {page === "payment" && selectedPlan && (
        <PaymentPage plan={selectedPlan} />
      )}
    </div>
  );
}