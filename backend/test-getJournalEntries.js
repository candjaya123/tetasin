const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getJournalEntries(tenantId, startDate, endDate) {
    const client = supabase;
    let tableName = 'accounts';
    try {
      const { error: testError } = await client.from('accounts').select('id').limit(1);
      if (testError) tableName = 'chart_of_accounts';
    } catch (e) {
      tableName = 'chart_of_accounts';
    }

    let query = client
      .from('journal_entries')
      .select(
        *,
        journal_lines (
          *,
          accounts:+tableName+ (
            id,
            name,
            code,
            type
          )
        )
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (startDate && startDate.length >= 10) query = query.gte('date', startDate.slice(0, 10));
    if (endDate && endDate.length >= 10) query = query.lte('date', endDate.slice(0, 10));

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

getJournalEntries('60f2be96-0d80-4ff9-abe2-cbbddaf3bdcc').then(data => console.log('Data:', data)).catch(err => console.error('Error:', err.message));
