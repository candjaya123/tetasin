const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const tenantId = '87c6111f-1dc7-40f7-9ab2-12ee4e0dbb47';

async function runCheck() {
  console.log('=== 1. Check ledger_balances view ===');
  const { data: balances, error: bError } = await supabase
    .from('ledger_balances')
    .select('*')
    .eq('tenant_id', tenantId)
    .limit(3);
  console.log('balances:', balances);
  if (bError) console.error('ledger_balances ERROR:', bError.message);

  console.log('\n=== 2. Check GEMINI_API_KEY ===');
  console.log('API Key present:', !!process.env.GEMINI_API_KEY);
  console.log('API Key prefix:', process.env.GEMINI_API_KEY?.slice(0, 10));

  console.log('\n=== 3. Try Gemini chat directly ===');
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('halo, tes koneksi singkat');
    const response = await result.response;
    console.log('Gemini response:', response.text().slice(0, 100));
  } catch (e) {
    console.error('Gemini ERROR:', e.message);
  }
}

runCheck();
