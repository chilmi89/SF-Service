'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// SwaggerUI needs to be client-rendered
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <section className="container mx-auto p-4 bg-white min-h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">API Documentation</h1>
        <p className="text-gray-600">Explore the API endpoints for SF-Service</p>
      </div>
      <SwaggerUI url="/api/swagger" />
    </section>
  );
}
