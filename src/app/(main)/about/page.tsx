export default function AboutPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="prose prose-lg mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            About Our Platform
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            This overview details the architecture and functional ecosystem of the e-commerce platform developed by{' '}
            <strong className="font-semibold text-foreground">Emeche Somtochukwu Victor</strong>, under the leadership of{' '}
            <strong className="font-semibold text-foreground">Enyinnaya Wisdom Chukwuemeka</strong>.
          </p>
          <p className="mt-2 text-muted-foreground">
            The platform is designed as a high-performance, scalable solution built to handle modern digital commerce demands.
          </p>
        </div>

        <hr className="my-12" />

        <section>
          <h2 className="text-3xl font-bold">🏗️ Core Architecture & Development</h2>
          <p>
            The development team prioritized a <strong className="font-semibold text-foreground">Modular Microservices Architecture</strong>. This approach ensures that different parts of the system (like payments or inventory) can be updated or scaled without affecting the entire platform.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong className="font-semibold">Lead Developer:</strong> Emeche Somtochukwu Victor</li>
            <li><strong className="font-semibold">Project Lead/Visionary:</strong> Enyinnaya Wisdom Chukwuemeka</li>
            <li><strong className="font-semibold">Tech Stack Focus:</strong> The platform utilizes a robust backend for data integrity, a responsive frontend for user experience, and cloud-native hosting for 99.9% uptime.</li>
          </ul>
        </section>

        <hr className="my-12" />

        <section>
          <h2 className="text-3xl font-bold">🛠️ Key Features & Components</h2>
          <p>
            The platform is divided into three primary "environments": the Customer Storefront, the Vendor/Merchant Portal, and the Admin Dashboard.
          </p>

          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-2xl font-semibold">1. Customer Storefront (The User Experience)</h3>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li><strong className="font-semibold">Smart Search & Filtering:</strong> Utilizes advanced algorithms to allow users to find products by category, price, brand, or rating.</li>
                <li><strong className="font-semibold">Dynamic Product Pages:</strong> High-resolution galleries, detailed descriptions, and real-time stock status.</li>
                <li><strong className="font-semibold">Multi-Gateway Payment System:</strong> Integration with secured providers (like Stripe, Flutterwave, or PayPal) to ensure safe transactions.</li>
                <li><strong className="font-semibold">User Profiles & Order History:</strong> A personalized dashboard where customers can track shipments and manage preferences.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold">2. Vendor Management (The Merchant Tools)</h3>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li><strong className="font-semibold">Inventory Management:</strong> Automated alerts when stock is low and easy bulk-uploading of products.</li>
                <li><strong className="font-semibold">Sales Analytics:</strong> Visual charts and data points showing daily, weekly, and monthly revenue trends.</li>
                <li><strong className="font-semibold">Order Fulfillment System:</strong> A streamlined workflow to move orders from "Pending" to "Shipped."</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold">3. Backend & Security Components</h3>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li><strong className="font-semibold">Secure Authentication:</strong> Implementation of OAuth and JWT (JSON Web Tokens) to protect user data.</li>
                <li><strong className="font-semibold">Database Management:</strong> Optimized schemas to handle thousands of concurrent queries without latency.</li>
                <li><strong className="font-semibold">API Integration:</strong> Seamless connection with third-party logistics (shipping) and marketing tools (email newsletters).</li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="my-12" />

        <section>
          <h2 className="text-3xl font-bold">🚀 Performance Highlights</h2>
          <p>
            Under the guidance of <strong className="font-semibold text-foreground">Enyinnaya Wisdom Chukwuemeka</strong>, the development focused on two critical metrics:
          </p>
          <ol className="list-decimal pl-6 mt-4 space-y-2">
            <li><strong className="font-semibold">Speed:</strong> Optimized image compression and lazy loading to ensure the site loads in under 2 seconds.</li>
            <li><strong className="font-semibold">Security:</strong> End-to-end SSL encryption and regular security patches to prevent data breaches.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
