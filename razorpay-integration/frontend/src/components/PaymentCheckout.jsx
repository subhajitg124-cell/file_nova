import { useEffect, useState } from 'react';

const PaymentCheckout = ({ amount, serviceId, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay checkout script
    if (window.Razorpay) {
      setIsSDKLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsSDKLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      onError('Failed to load payment system');
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!isSDKLoaded || !window.Razorpay) {
      onError('Payment system not ready. Please refresh the page.');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create order on backend
      const orderResponse = await fetch('/api/v1/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount, serviceId })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Step 2: Configure Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FileNova',
        description: 'Service Payment',
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await fetch('/api/v1/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.verified) {
              onSuccess({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                ...verifyData
              });
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError);
            onError('Payment verification failed. Please contact support.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: '', // Populate from user profile
          email: '', // Populate from user profile
          contact: '' // Populate from user profile
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            console.log('Checkout closed by user');
            setIsLoading(false);
          },
          escape: true
        },
        retry: {
          enabled: false
        },
        timeout: 600
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        onError(response.error.description || 'Payment failed');
        setIsLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      onError(error.message || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !isSDKLoaded}
      style={{
        padding: '12px 24px',
        backgroundColor: isLoading ? '#999' : '#3399cc',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontSize: '16px',
        fontWeight: '600'
      }}
    >
      {isLoading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
};

export default PaymentCheckout;
