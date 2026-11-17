
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  const token = localStorage.getItem("campushubToken");

  const loadPayments = async () => {
    try {
      setError("");

      // Create default payment records if needed
      await fetch("http://localhost:5000/api/payments/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Payment setup failed");
        }
      });

      // Get payment records
      const response = await fetch(
        "http://localhost:5000/api/payments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load payments");
      }

      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your payments.");
      setLoading(false);
      return;
    }

    loadPayments();
  }, []);

  const payNow = async (id) => {
    try {
      setPayingId(id);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/payments/${id}/pay`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment update failed");
      }

      await loadPayments();
    } catch (err) {
      setError(err.message);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="module-page">
      <h1>💳 Payments</h1>
      <p>Manage your hostel, mess and gym payments.</p>

      {loading && <p>Loading payments...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && payments.length === 0 && !error && (
        <p>No payment records found.</p>
      )}

      <div className="module-grid">
        {payments.map((payment) => (
          <div className="module-card" key={payment.id}>
            <h2>{payment.title}</h2>

            <h3>₹{Number(payment.amount).toLocaleString("en-IN")}</h3>

            <p>
              Status: <strong>{payment.status}</strong>
            </p>

            {payment.status === "Pending" && (
              <button
                onClick={() => payNow(payment.id)}
                disabled={payingId !== null}
              >
                {payingId === payment.id ? "Processing..." : "Pay Now"}
              </button>
            )}

            {payment.status === "Paid" && (
              <p>✅ Payment Completed</p>
            )}
          </div>
        ))}
      </div>

      <br />

      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default Payments;
