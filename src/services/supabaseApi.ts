import { supabase } from './supabaseClient';
// Haal de lijst van tabellen op uit Supabase (alleen mogelijk als RLS dit toestaat)
export async function getSupabaseTables() {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    if (error) {
      console.error('Fout bij ophalen tabellen:', error);
      return [];
    }
    return data?.map((row: any) => row.table_name) || [];
  } catch (e) {
    console.error('Exception bij ophalen tabellen:', e);
    return [];
  }
}

// Data ophalen uit een tabel
export async function getData(table: string) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return data;
}

// Data toevoegen aan een tabel
export async function insertData(table: string, values: any) {
  const { data, error } = await supabase.from(table).insert([values]);
  if (error) {
    console.error('Supabase insert error:', error);
    throw error;
  }
  console.log('Supabase insert result:', data);
  return Array.isArray(data) ? data[0] : null;
}

// Health check: probeer een simpele select op een bestaande tabel
export async function supabaseHealthCheck() {
  try {
    const { error } = await supabase.from('family_members').select('id').limit(1);
    if (error) return false;
    return true;
  } catch (e) {
    return false;
  }
}
// Data updaten in een tabel
export async function updateData(table: string, id: string, values: any) {
  const { data, error } = await supabase.from(table).update(values).eq('id', id);
  if (error) throw error;
  return data;
}

// Data verwijderen uit een tabel
export async function deleteData(table: string, id: string) {
  const { data, error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return data;
}
