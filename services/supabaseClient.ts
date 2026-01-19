import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://warpnfbornactphwoqpm.supabase.co';
const supabaseKey = 'sb_publishable_BtyIu6orfmE5KlJuuH7zfA_lu0xbNET';

export const supabase = createClient(supabaseUrl, supabaseKey);