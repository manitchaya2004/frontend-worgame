import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qsopjsioqmqtyaocqmmx.supabase.co' 
const supabaseKey = 'sb_publishable_aH637mSDCTuKFqnFfN0XmA_LH0vI38I'

export const supabase = createClient(supabaseUrl, supabaseKey)