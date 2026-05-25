
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkFinance() {
    let tableName = 'chart_of_accounts';
    let query = supabase
      .from('journal_entries')
      .select('*, journal_lines (*, accounts:' + tableName + ' (id, name, code, type))')
      .eq('tenant_id', '60f2be96-0d80-4ff9-abe2-cbbddaf3bdcc');

    const { data, error } = await query;
    console.log('Error:', error);
    console.log('Data:', data ? data.length : null);
}
checkFinance();

