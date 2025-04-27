import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tygemzgwvfzfwpzsbabv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5Z2Vtemd3dmZ6ZndwenNiYWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NDc0NDksImV4cCI6MjA2MTMyMzQ0OX0.XJmqRknnOJKJ_jZDvmft0U5F_bJA-06HWhIrH8KR-q0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

