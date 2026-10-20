import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createPaymentOrder, verifyPayment } from "../../api/payment.api.js";

import { loadRazorpay } from "../../utils/loadRazorpay.js";

export default function RazorpayPaymentButton({
  orderId,
  customerName = "",
  customerEmail = "",
  customerPhone = "",
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handlePayment() {
    if (loading || !orderId) return;

    setLoading(true);
    setMessage("");

    let checkout;

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error("Unable to load Razorpay Checkout. Please try again.");
      }

      // Reuse the same checkout key for retries of this local order.
      const storageKey = `checkout-key:${orderId}`;

      let checkoutKey = sessionStorage.getItem(storageKey);

      if (!checkoutKey) {
        if (globalThis.crypto?.randomUUID) {
          checkoutKey = globalThis.crypto.randomUUID();
        } else {
          checkoutKey = [
            Date.now().toString(36),
            Math.random().toString(36).slice(2),
            Math.random().toString(36).slice(2),
          ].join("-");
        }

        sessionStorage.setItem(storageKey, checkoutKey);
      }

      const paymentOrder = await createPaymentOrder({
        orderId,
        checkoutKey,
      });

      if (
        !paymentOrder?.keyId ||
        !paymentOrder?.razorpayOrderId ||
        !Number.isFinite(Number(paymentOrder?.amount)) ||
        Number(paymentOrder.amount) <= 0 ||
        !paymentOrder?.currency
      ) {
        throw new Error(
          "The server returned incomplete payment details. Please contact support.",
        );
      }

      let callbackHandled = false;

      const options = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "Your Store",
        description: `Payment for order ${orderId}`,
        order_id: paymentOrder.razorpayOrderId,

        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },

        handler: async (response) => {
          if (callbackHandled) return;
          callbackHandled = true;

          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (result?.paid === true) {
              sessionStorage.removeItem(storageKey);

              navigate(`/orders/${orderId}`, {
                replace: true,
                state: { paymentSuccess: true },
              });
              return;
            }

            setMessage(
              "Payment is not confirmed yet. Check your order status before retrying.",
            );
          } catch (error) {
            setMessage(
              error?.response?.data?.message ||
                "We couldn't confirm your payment yet. Check your order status before trying again.",
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage(
              "Checkout was closed. Check your order status before retrying.",
            );
          },
        },

        theme: {
          color: "#F97316",
        },
      };

      checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        setLoading(false);
        setMessage(
          response?.error?.description ||
            "This payment attempt failed. Check the order status before retrying.",
        );
      });

      checkout.open();
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start payment.",
      );

      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading || !orderId}
        className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
      >
        {loading ? "Processing..." : "Pay securely with Razorpay"}
      </button>

      {message && (
        <p
          role="status"
          className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-5 text-amber-800"
        >
          {message}
        </p>
      )}
    </div>
  );
}