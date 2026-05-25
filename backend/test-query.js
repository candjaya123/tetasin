const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase
      .from('journal_entries')
      .select('*, journal_lines (*, accounts:chart_of_accounts (id, name, code, type))')
      .limit(1);
    
  if (error) console.error('Error fetching journal_entries:', error);
  else console.log('journal_entries data:', data);
}

test();
