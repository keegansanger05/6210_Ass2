import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkejirsnddgzttzcekeu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZWppcnNuZGRnenR0emNla2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQ3Nzk1OCwiZXhwIjoyMDYyMDUzOTU4fQ.AUyCK58EakF6iBQZNI5E-wA33lKYjPWu6KJrnhKCBoQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

