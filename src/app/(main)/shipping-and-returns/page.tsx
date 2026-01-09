import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Truck, Package, ShieldCheck } from 'lucide-react';

export default function ShippingAndReturnsPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Shipping & Returns
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-xl text-muted-foreground">
          Everything you need to know about your order&apos;s journey and our
          return policy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We are committed to getting your order to you as quickly as
              possible. Shipping times and costs are determined by the seller
              and will be calculated at checkout.
            </p>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                How to Track Your Order
              </h3>
              <p>
                Once your order is shipped, you will receive a confirmation
                email with tracking information. You can also track your order
                status from your &quot;My Orders&quot; page in your account
                section.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Delivery Times
              </h3>
              <p>
                Estimated delivery times will be provided by the seller once the
                order is processed. Please note that these are estimates and can
                vary based on your location and other factors.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Returns & Exchanges Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We want you to be completely satisfied with your purchase. If
              you&apos;re not, we&apos;re here to help.
            </p>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Return Window
              </h3>
              <p>
                Most items can be returned within 30 days of delivery. Please
                check the seller&apos;s specific return policy on the product
                page for any exceptions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                How to Initiate a Return
              </h3>
              <p>
                To start a return, please visit our Contact Us page and send a
                message to our support team with your order number and reason
                for return. We will guide you through the process.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-green-600" />
        <h2 className="mt-4 text-2xl font-bold">Your Satisfaction is Our Priority</h2>
        <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
          Our admin team verifies payments and works with sellers to ensure a
          smooth process from purchase to delivery.
        </p>
      </div>
    </div>
  );
}
