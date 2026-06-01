import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabaseAdmin.rpc('get_table_schema');
  // Wait, maybe we can just query the database using standard REST if RPC is not there?
  // Supabase JS doesn't support querying information_schema directly easily without a function or pg hook.
  // Let's use a raw query if we had pg, but we can just use the previous script and insert a dummy row and delete it? 
  // No, just checking the supabase UI or running a direct query. 
  
  // Let's create an RPC or just try fetching a specific column created_at to see if it exists.
  const tables = ['orders', 'layanan', 'profiles'];
  for (const table of tables) {
    const { data, error } = await supabaseAdmin.from(table).select('created_at').limit(1);
    if (error) {
      console.log(`${table} created_at Error:`, error.message);
    } else {
      console.log(`${table} created_at:`, data);
    }
  }
}

main();
