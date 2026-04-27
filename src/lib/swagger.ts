import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/(backend)/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'SF Service API',
        version: '1.0.0',
        description: 'API Documentation for SF Service System. \n\n' + 
                     '**Client Library:** Frontend developers can use the pre-built library located at `src/lib/api` to make API calls easier.\n\n' +
                     '**Remote Access:** If calling from a different laptop, set `NEXT_PUBLIC_API_BASE_URL` in your `.env.local` to the Backend IP.\n\n' +
                     '**Example Usage (Auth & Profiles):**\n' +
                     '```typescript\n' +
                     'import { authService } from "@/lib/api/auth.service";\n' +
                     'import { profileService } from "@/lib/api/profile.service";\n\n' +
                     'async function handleRegister() {\n' +
                     '  const { data, error } = await authService.register("email@example.com", "password123");\n' +
                     '  if (error) return console.error("Error:", error);\n' +
                     '  console.log("Success:", data.user);\n' +
                     '}\n' +
                     '```',
      },
    },
  });
  return spec;
};
