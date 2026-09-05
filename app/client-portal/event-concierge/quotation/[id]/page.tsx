"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Order = {
  id: string;

  order_number?: string | null;

  full_name?: string | null;
  email?: string | null;
  phone?: string | null;

  service_type?: string | null;

  event_type?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  guest_count?: number | null;
  venue?: string | null;
  budget?: string | number | null;
  special_request?: string | null;

  amount?: number | null;
  subtotal?: number | null;
  delivery_fee?: number | null;
  total?: number | null;

  quotation_status?: string | null;
  quotation_notes?: string | null;
  quoted_at?: string | null;

  payment_status?: string | null;
  payment_channel?: string | null;
  payment_reference?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

type ApiResponse = {
  success?: boolean;
  order?: Order;
  data?: Order;
  error?: string;
};

function formatCurrency(value: number | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status?: string | null) {
  const value = (status || "").toUpperCase();

  if (value === "ACCEPTED") {
    return "accepted";
  }

  if (value === "DECLINED") {
    return "declined";
  }

  if (value === "NEGOTIATING") {
    return "negotiating";
  }

  if (value === "QUOTED") {
    return "quoted";
  }

  return "not-quoted";
}

export default function QuotationPage() {
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params?.id === "string"
      ? params.id
      : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    if (!id) {
      setError("Quotation ID is missing.");
      setLoading(false);
      return;
    }

    async function loadQuotation() {
      try {
        setLoading(true);
        setError("");

        /*
         * We use the orders endpoint because the quotation
         * belongs to an order.
         */
        const response = await fetch(
          `/api/orders/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          (await response.json()) as ApiResponse;

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to load quotation."
          );
        }

        const quotation =
          result.order || result.data;

        if (!quotation) {
          throw new Error(
            "Quotation could not be found."
          );
        }

        setOrder(quotation);
      } catch (err) {
        console.error(
          "Quotation loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load quotation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuotation();
  }, [id]);

  async function updateQuotationStatus(
    status: "ACCEPTED" | "DECLINED"
  ) {
    if (!order) return;

    const confirmed = window.confirm(
      status === "ACCEPTED"
        ? "Are you sure you want to accept this quotation?"
        : "Are you sure you want to decline this quotation?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `/api/orders/${encodeURIComponent(id)}/quotation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            quoted_amount:
              Number(order.amount ?? order.subtotal ?? 0),

            delivery_fee:
              Number(order.delivery_fee ?? 0),

            quotation_status: status,

            quotation_notes:
              order.quotation_notes || "",
          }),
        }
      );

      const result =
        (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to update quotation."
        );
      }

      const updatedOrder =
        result.order || result.data;

      if (updatedOrder) {
        setOrder(updatedOrder);
      } else {
        setOrder((current) =>
          current
            ? {
                ...current,
                quotation_status: status,
              }
            : current
        );
      }

      setSuccessMessage(
        status === "ACCEPTED"
          ? "Quotation accepted successfully."
          : "Quotation declined."
      );
    } catch (err) {
      console.error(
        "Quotation status error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update quotation."
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <style jsx>{styles}</style>

        <main className="quotation-page">
          <div className="loading-wrapper">
            <div className="loader" />

            <p className="brand-small">
              RHENNIE TASTY SHACK
            </p>

            <h1>Preparing your quotation...</h1>

            <p>
              Please wait while we retrieve
              your event quotation.
            </p>
          </div>
        </main>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <style jsx>{styles}</style>

        <main className="quotation-page">
          <div className="error-card">
            <div className="error-icon">!</div>

            <p className="brand-small">
              RHENNIE TASTY SHACK
            </p>

            <h1>
              Quotation unavailable
            </h1>

            <p>
              {error ||
                "We could not find this quotation."}
            </p>

            <button
              type="button"
              className="back-button"
              onClick={() =>
                router.push(
                  "/client-portal/quotations"
                )
              }
            >
              BACK TO QUOTATIONS
            </button>
          </div>
        </main>
      </>
    );
  }

  const quotationAmount = Number(
    order.amount ??
      order.subtotal ??
      0
  );

  const deliveryFee = Number(
    order.delivery_fee ?? 0
  );

  const quotationTotal = Number(
    order.total ??
      quotationAmount + deliveryFee
  );

  const status =
    (
      order.quotation_status ||
      "NOT QUOTED"
    ).toUpperCase();

  const statusClass =
    getStatusClass(status);

  const isAccepted =
    status === "ACCEPTED";

  const isDeclined =
    status === "DECLINED";

  const canRespond =
    status === "QUOTED" ||
    status === "NEGOTIATING";

  return (
    <>
      <style jsx>{styles}</style>

      <main className="quotation-page">
        <div className="quotation-container">
          {/* HEADER */}

          <header className="quotation-header">
            <button
              type="button"
              className="back-link"
              onClick={() =>
                router.push(
                  "/client-portal/quotations"
                )
              }
            >
              ← Back to quotations
            </button>

            <div className="header-brand">
              <span>
                RHENNIE TASTY SHACK
              </span>

              <small>
                PREMIUM CATERING
              </small>
            </div>

            <div className="header-content">
              <p className="eyebrow">
                EVENT CONCIERGE
              </p>

              <h1>
                Your Event Quotation
              </h1>

              <p>
                A personalised catering
                proposal prepared for your
                celebration.
              </p>
            </div>
          </header>

          {/* QUOTATION REFERENCE */}

          <section className="reference-card">
            <div>
              <span>
                QUOTATION REFERENCE
              </span>

              <strong>
                {order.order_number ||
                  order.id}
              </strong>
            </div>

            <div className="status-area">
              <span>
                STATUS
              </span>

              <strong
                className={`status ${statusClass}`}
              >
                {status}
              </strong>
            </div>
          </section>

          {/* SUCCESS */}

          {successMessage && (
            <div className="success-message">
              ✓ {successMessage}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="inline-error">
              {error}
            </div>
          )}

          {/* EVENT DETAILS */}

          <section className="section-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  EVENT DETAILS
                </p>

                <h2>
                  Your Celebration
                </h2>
              </div>
            </div>

            <div className="details-grid">
              <div className="detail">
                <span>
                  EVENT TYPE
                </span>

                <strong>
                  {order.event_type ||
                    order.service_type ||
                    "Event Concierge"}
                </strong>
              </div>

              <div className="detail">
                <span>
                  EVENT DATE
                </span>

                <strong>
                  {formatDate(
                    order.event_date
                  )}
                </strong>
              </div>

              <div className="detail">
                <span>
                  EVENT TIME
                </span>

                <strong>
                  {order.event_time ||
                    "—"}
                </strong>
              </div>

              <div className="detail">
                <span>
                  GUESTS
                </span>

                <strong>
                  {order.guest_count
                    ? `${order.guest_count} guests`
                    : "—"}
                </strong>
              </div>

              <div className="detail full">
                <span>
                  VENUE
                </span>

                <strong>
                  {order.venue || "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* CUSTOMER REQUEST */}

          <section className="section-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  YOUR REQUEST
                </p>

                <h2>
                  Event Requirements
                </h2>
              </div>
            </div>

            <div className="request-box">
              {order.special_request ||
                "No special request was provided."}
            </div>
          </section>

          {/* BUDGET */}

          {order.budget && (
            <section className="budget-card">
              <div>
                <span>
                  YOUR INDICATED BUDGET
                </span>

                <strong>
                  {typeof order.budget ===
                  "number"
                    ? formatCurrency(
                        order.budget
                      )
                    : order.budget}
                </strong>
              </div>

              <p>
                Your budget is considered
                during quotation preparation.
                The final quotation is based
                on your event requirements.
              </p>
            </section>
          )}

          {/* QUOTATION */}

          <section className="price-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  RHENNIE TASTY SHACK
                </p>

                <h2>
                  Quotation Summary
                </h2>
              </div>
            </div>

            <div className="price-row">
              <span>
                Catering / Event Service
              </span>

              <strong>
                {formatCurrency(
                  quotationAmount
                )}
              </strong>
            </div>

            <div className="price-row">
              <span>
                Delivery / Logistics
              </span>

              <strong>
                {formatCurrency(
                  deliveryFee
                )}
              </strong>
            </div>

            <div className="divider" />

            <div className="total-row">
              <span>
                TOTAL QUOTATION
              </span>

              <strong>
                {formatCurrency(
                  quotationTotal
                )}
              </strong>
            </div>

            {order.quoted_at && (
              <p className="quoted-date">
                Quoted on{" "}
                {formatDateTime(
                  order.quoted_at
                )}
              </p>
            )}
          </section>

          {/* NOTES */}

          {order.quotation_notes && (
            <section className="section-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    FROM RHENNIE TASTY SHACK
                  </p>

                  <h2>
                    Quotation Notes
                  </h2>
                </div>
              </div>

              <div className="notes-box">
                {order.quotation_notes}
              </div>
            </section>
          )}

          {/* CUSTOMER RESPONSE */}

          {canRespond && (
            <section className="response-card">
              <p className="eyebrow">
                YOUR RESPONSE
              </p>

              <h2>
                Are you happy with this
                quotation?
              </h2>

              <p>
                Review the quotation above
                before confirming your
                decision.
              </p>

              <div className="response-actions">
                <button
                  type="button"
                  className="decline-button"
                  disabled={actionLoading}
                  onClick={() =>
                    updateQuotationStatus(
                      "DECLINED"
                    )
                  }
                >
                  {actionLoading
                    ? "PLEASE WAIT..."
                    : "DECLINE"}
                </button>

                <button
                  type="button"
                  className="accept-button"
                  disabled={actionLoading}
                  onClick={() =>
                    updateQuotationStatus(
                      "ACCEPTED"
                    )
                  }
                >
                  {actionLoading
                    ? "PLEASE WAIT..."
                    : "ACCEPT QUOTATION"}
                </button>
              </div>
            </section>
          )}

          {/* ACCEPTED */}

          {isAccepted && (
            <section className="decision-card accepted-card">
              <div className="decision-icon">
                ✓
              </div>

              <div>
                <p className="eyebrow">
                  QUOTATION ACCEPTED
                </p>

                <h2>
                  Thank you for confirming.
                </h2>

                <p>
                  Rhennie Tasty Shack has
                  received your acceptance.
                  We will proceed with the
                  next steps for your event.
                </p>
              </div>
            </section>
          )}

          {/* DECLINED */}

          {isDeclined && (
            <section className="decision-card declined-card">
              <div className="decision-icon">
                ×
              </div>

              <div>
                <p className="eyebrow">
                  QUOTATION DECLINED
                </p>

                <h2>
                  Your response has been
                  recorded.
                </h2>

                <p>
                  If you would like to discuss
                  the quotation or make changes
                  to your event requirements,
                  please contact Rhennie Tasty
                  Shack.
                </p>
              </div>
            </section>
          )}

          {/* FOOTER */}

          <footer className="quotation-footer">
            <p>
              RHENNIE TASTY SHACK
            </p>

            <span>
              Premium Taste • Fast Delivery
            </span>
          </footer>
        </div>
      </main>
    </>
  );
}

const styles = `
  .quotation-page {
    min-height: 100vh;
    background: #f7f5f0;
    color: #171717;
    padding: 40px 20px 80px;
  }

  .quotation-container {
    width: 100%;
    max-width: 980px;
    margin: 0 auto;
  }

  .quotation-header {
    margin-bottom: 28px;
  }

  .back-link {
    border: 0;
    background: transparent;
    padding: 0;
    margin-bottom: 38px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    color: #555;
  }

  .back-link:hover {
    color: #d87926;
  }

  .header-brand {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 36px;
  }

  .header-brand span {
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 0.25em;
    color: #d87926;
  }

  .header-brand small {
    font-size: 9px;
    letter-spacing: 0.2em;
    color: #777;
    font-weight: 700;
  }

  .eyebrow {
    margin: 0 0 8px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.22em;
    color: #d87926;
  }

  .header-content h1 {
    margin: 0;
    font-size: clamp(32px, 5vw, 58px);
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .header-content p:last-child {
    max-width: 650px;
    margin: 16px 0 0;
    color: #686868;
    line-height: 1.7;
  }

  .reference-card,
  .section-card,
  .budget-card,
  .price-card,
  .response-card,
  .decision-card {
    border: 1px solid #dedbd3;
    background: #fff;
    border-radius: 20px;
    margin-bottom: 18px;
  }

  .reference-card {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 24px;
    align-items: center;
  }

  .reference-card span,
  .detail span,
  .price-row span,
  .total-row span,
  .budget-card span {
    display: block;
    margin-bottom: 7px;
    color: #8a8a8a;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.18em;
  }

  .reference-card strong {
    font-size: 15px;
  }

  .status-area {
    text-align: right;
  }

  .status {
    display: inline-block;
    padding: 7px 12px;
    border-radius: 999px;
    font-size: 10px !important;
    letter-spacing: 0.08em !important;
  }

  .status.quoted {
    background: #f0e6ff;
    color: #7227d8;
  }

  .status.negotiating {
    background: #fff2d7;
    color: #a96700;
  }

  .status.accepted {
    background: #dff7e9;
    color: #087d40;
  }

  .status.declined {
    background: #ffe4e4;
    color: #bd2020;
  }

  .status.not-quoted {
    background: #eee;
    color: #666;
  }

  .success-message,
  .inline-error {
    padding: 15px 18px;
    border-radius: 12px;
    margin-bottom: 18px;
    font-size: 14px;
    font-weight: 700;
  }

  .success-message {
    background: #e4f8ec;
    color: #087d40;
  }

  .inline-error {
    background: #fff0f0;
    color: #b51d1d;
  }

  .section-card {
    padding: 28px;
  }

  .section-heading {
    margin-bottom: 24px;
  }

  .section-heading h2,
  .response-card h2,
  .decision-card h2 {
    margin: 0;
    font-size: 25px;
    letter-spacing: -0.025em;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }

  .detail.full {
    grid-column: 1 / -1;
  }

  .detail strong {
    font-size: 15px;
    line-height: 1.5;
  }

  .request-box,
  .notes-box {
    padding: 20px;
    border-radius: 13px;
    background: #f7f5f0;
    color: #555;
    line-height: 1.7;
    white-space: pre-wrap;
  }

  .budget-card {
    padding: 25px 28px;
    display: flex;
    justify-content: space-between;
    gap: 30px;
    align-items: center;
  }

  .budget-card strong {
    display: block;
    font-size: 24px;
  }

  .budget-card p {
    max-width: 430px;
    margin: 0;
    color: #777;
    font-size: 13px;
    line-height: 1.6;
  }

  .price-card {
    padding: 30px;
    background: #171717;
    color: #fff;
    border-color: #171717;
  }

  .price-card .eyebrow {
    color: #e3bb37;
  }

  .price-card h2 {
    margin: 0 0 25px;
    font-size: 28px;
  }

  .price-row,
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 13px 0;
  }

  .price-row span,
  .total-row span {
    color: #a9a9a9;
    margin: 0;
  }

  .price-row strong {
    font-size: 15px;
  }

  .divider {
    height: 1px;
    background: #3a3a3a;
    margin: 12px 0;
  }

  .total-row {
    padding-top: 20px;
  }

  .total-row span {
    color: #e3bb37;
  }

  .total-row strong {
    color: #e3bb37;
    font-size: clamp(25px, 5vw, 38px);
  }

  .quoted-date {
    margin: 22px 0 0;
    color: #888;
    font-size: 11px;
  }

  .response-card {
    padding: 30px;
    text-align: center;
  }

  .response-card > p:not(.eyebrow) {
    color: #777;
    line-height: 1.6;
  }

  .response-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
  }

  .response-actions button,
  .back-button {
    border: 0;
    border-radius: 10px;
    padding: 14px 20px;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.1em;
    cursor: pointer;
  }

  .accept-button {
    background: #d87926;
    color: #fff;
  }

  .decline-button {
    background: #eee;
    color: #333;
  }

  .response-actions button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .decision-card {
    display: flex;
    gap: 20px;
    padding: 25px;
    align-items: flex-start;
  }

  .decision-icon {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    font-size: 22px;
    font-weight: 900;
  }

  .decision-card p:last-child {
    color: #666;
    line-height: 1.6;
    margin-bottom: 0;
  }

  .accepted-card {
    background: #effaf3;
    border-color: #bce8ca;
  }

  .accepted-card .decision-icon {
    background: #cdeed8;
    color: #087d40;
  }

  .declined-card {
    background: #fff3f3;
    border-color: #f1cccc;
  }

  .declined-card .decision-icon {
    background: #f7d7d7;
    color: #b51d1d;
  }

  .quotation-footer {
    text-align: center;
    padding-top: 40px;
    color: #999;
  }

  .quotation-footer p {
    margin: 0 0 6px;
    color: #d87926;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.2em;
  }

  .quotation-footer span {
    font-size: 11px;
  }

  .loading-wrapper,
  .error-card {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .loading-wrapper h1,
  .error-card h1 {
    margin: 8px 0;
    font-size: 28px;
  }

  .loading-wrapper p:not(.brand-small),
  .error-card p:not(.brand-small) {
    max-width: 450px;
    color: #777;
    line-height: 1.6;
  }

  .brand-small {
    margin: 12px 0 0;
    color: #d87926;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.22em;
  }

  .loader {
    width: 42px;
    height: 42px;
    border: 3px solid #eaded5;
    border-top-color: #d87926;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-card {
    background: #fff;
    border: 1px solid #e3ded7;
    border-radius: 20px;
    padding: 50px 30px;
    min-height: auto;
    max-width: 600px;
    margin: 10vh auto;
  }

  .error-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #fff0f0;
    color: #b51d1d;
    font-size: 24px;
    font-weight: 900;
  }

  .back-button {
    margin-top: 18px;
    background: #171717;
    color: #fff;
  }

  @media (max-width: 700px) {
    .quotation-page {
      padding: 25px 14px 60px;
    }

    .reference-card,
    .budget-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .status-area {
      text-align: left;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .detail.full {
      grid-column: auto;
    }

    .response-actions {
      flex-direction: column;
    }

    .response-actions button {
      width: 100%;
    }

    .price-card {
      padding: 24px 20px;
    }

    .section-card {
      padding: 22px;
    }

    .decision-card {
      flex-direction: column;
    }
  }
`;