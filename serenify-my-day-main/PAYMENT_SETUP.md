# 💳 Razorpay Payment Integration Setup

This guide will help you set up Razorpay payment integration for your Blissy mental wellness app.

## 🔧 Prerequisites

1. **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **Supabase Project**: Your existing Supabase project
3. **Environment Variables**: Set up the required environment variables

## 📋 Setup Steps

### 1. Razorpay Dashboard Setup

1. **Create Razorpay Account**:
   - Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
   - Sign up with your business details
   - Complete KYC verification

2. **Get API Keys**:
   - Go to Settings → API Keys
   - Generate new API keys
   - Copy the Key ID and Key Secret

3. **Configure Webhooks** (Optional but recommended):
   - Go to Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Select events: `payment.captured`, `payment.failed`

### 2. Environment Variables

Create a `.env` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Optional: Webhook URL
VITE_WEBHOOK_URL=your_webhook_url
```

### 3. Database Migration

Run the database migration to create payment tables:

```bash
# If using Supabase CLI
supabase db push

# Or run the migration manually in Supabase SQL Editor
# Copy the content from: supabase/migrations/20250118000000_add_payment_tables.sql
```

### 4. Test the Integration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Payment Flow**:
   - Navigate to `/subscription`
   - Select a plan
   - Click "Pay" button
   - Use Razorpay test cards for testing

## 🧪 Test Cards

Use these test cards for development:

| Card Number | CVV | Expiry | Result |
|-------------|-----|--------|--------|
| 4111 1111 1111 1111 | 123 | Any future date | Success |
| 4000 0000 0000 0002 | 123 | Any future date | Failure |
| 4000 0000 0000 0069 | 123 | Any future date | Failure |

## 🔒 Security Features

- **SSL Encryption**: All payments are encrypted
- **PCI DSS Compliance**: Razorpay is PCI DSS compliant
- **Webhook Verification**: Payment status verified via webhooks
- **Database Security**: Row Level Security (RLS) enabled

## 📱 Features Implemented

### ✅ Payment Processing
- Razorpay integration with order creation
- Secure payment modal
- Multiple payment methods support
- Real-time payment status updates

### ✅ Subscription Management
- Monthly and Annual plans
- Automatic subscription creation
- Subscription status tracking
- Cancellation support

### ✅ Database Schema
- `subscription_plans` - Available plans
- `user_subscriptions` - User subscription data
- `payment_history` - Payment records
- `razorpay_orders` - Order tracking

### ✅ UI Components
- Payment success/failure pages
- Subscription status display
- Premium user experience
- Loading states and error handling

## 🚀 Deployment

### Production Setup

1. **Update Environment Variables**:
   - Use production Razorpay keys
   - Set production Supabase URL
   - Configure production webhook URL

2. **Webhook Configuration**:
   - Set up webhook endpoint in production
   - Configure webhook events
   - Test webhook delivery

3. **Database**:
   - Run migrations in production
   - Verify RLS policies
   - Test payment flow

### Deployment Platforms

#### Vercel
```bash
# Set environment variables in Vercel dashboard
vercel env add VITE_RAZORPAY_KEY_ID
vercel env add VITE_RAZORPAY_KEY_SECRET
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
```

#### Netlify
```bash
# Set environment variables in Netlify dashboard
# Go to Site settings → Environment variables
```

## 🔍 Troubleshooting

### Common Issues

1. **Payment Modal Not Opening**:
   - Check if Razorpay script is loaded
   - Verify API key is correct
   - Check browser console for errors

2. **Payment Success Not Working**:
   - Verify webhook configuration
   - Check database permissions
   - Verify subscription creation logic

3. **Database Errors**:
   - Ensure RLS policies are correct
   - Check user authentication
   - Verify table permissions

### Debug Mode

Enable debug logging:

```typescript
// In your component
console.log('Razorpay loaded:', window.Razorpay);
console.log('API Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
```

## 📞 Support

- **Razorpay Support**: [support.razorpay.com](https://support.razorpay.com)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Documentation**: [razorpay.com/docs](https://razorpay.com/docs)

## 🎯 Next Steps

1. **Analytics**: Add payment analytics
2. **Refunds**: Implement refund functionality
3. **Invoices**: Generate payment invoices
4. **Reports**: Create payment reports
5. **Multi-currency**: Support multiple currencies

---

**Happy Coding! 🚀**
