import { api } from './api';

/**
 * Shared Razorpay Checkout flow used by the course page and the /purchase page.
 *
 * Security model (unchanged): the server creates the order from the course price in the database,
 * Razorpay collects the payment, and the server verifies the signature and creates the enrollment.
 * The client never sends a price and never creates an enrollment itself.
 */

export interface RazorpayCourseOrder {
  razorpay_order_id: string;
  amount: number; // rupees, from the server
  currency: string;
  razorpay_key: string; // public key id
}

export interface CheckoutCallbacks {
  /** Server verified the signature and created/confirmed the enrollment. */
  onVerified: (data: any) => void;
  /** Razorpay reported success but server verification failed or could not be reached. */
  onVerificationFailed: (message: string) => void;
  /** Razorpay reported a failed payment attempt (the Razorpay modal may stay open for a retry). */
  onPaymentFailed: (description: string) => void;
  /** The learner closed the Razorpay modal. */
  onDismiss: () => void;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/** Creates the server-side Razorpay order. Throws the axios error on HTTP failure. */
export const createCourseOrder = async (courseId: string): Promise<RazorpayCourseOrder | null> => {
  const orderRes = await api.post('/payments/create-order', { courseId });
  if (!orderRes.data.success || !orderRes.data.data) return null;
  return orderRes.data.data;
};

export const openRazorpayCheckout = (params: {
  order: RazorpayCourseOrder;
  courseId: string;
  description: string;
  prefill: { name: string; email: string };
  callbacks: CheckoutCallbacks;
}) => {
  const { order, courseId, description, prefill, callbacks } = params;

  const options = {
    key: order.razorpay_key,
    amount: Math.round(order.amount * 100),
    currency: order.currency || 'INR',
    name: 'ECU FORGE MASTERCLASS',
    description,
    order_id: order.razorpay_order_id,
    handler: async function (response: any) {
      try {
        const verifyRes = await api.post('/payments/verify-signature', {
          courseId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verifyRes.data.success) {
          callbacks.onVerified(verifyRes.data.data);
        } else {
          callbacks.onVerificationFailed('Payment verification failed. Please contact support if amount was deducted.');
        }
      } catch (err: any) {
        callbacks.onVerificationFailed(err.response?.data?.message || 'Payment verification failed');
      }
    },
    prefill,
    theme: {
      color: '#00FF66',
    },
    modal: {
      ondismiss: function () {
        callbacks.onDismiss();
      },
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.on('payment.failed', function (response: any) {
    callbacks.onPaymentFailed(response.error?.description || 'Transaction declined');
  });

  rzp.open();
};
