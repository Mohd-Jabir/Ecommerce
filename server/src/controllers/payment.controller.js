import {
  createPaymentOrder as createPaymentOrderService,
  verifyCheckoutPayment,
  getPaymentStatus,
  processRazorpayWebhook,
} from "../services/payment.service.js";

export async function createPaymentOrder(req, res, next) {
  try {
    const result = await createPaymentOrderService(req.user, req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const result = await verifyCheckoutPayment(req.user, req.body);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function paymentStatus(req, res, next) {
  try {
    const result = await getPaymentStatus(req.user, req.params.paymentId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function razorpayWebhook(req, res, next) {
  try {
    const result = await processRazorpayWebhook(
      req.body,
      req.headers["x-razorpay-signature"],
      req.headers["x-razorpay-event-id"],
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
