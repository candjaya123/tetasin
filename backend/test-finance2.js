const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    let tableName = 'chart_of_accounts';
    let query = supabase
      .from('journal_entries')
      .select('*, journal_lines (*, accounts:' + tableName + ' (id, name, code, type))')
      .order('date', { ascending: false })
      .limit(1);

    const { data, error } = await query;
    console.log('Error:', error);
}
check();
