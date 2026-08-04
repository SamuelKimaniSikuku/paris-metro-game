/* Supabase project that carries the live rooms.
   These two values are public by design — the anon key is what every Supabase
   web app ships in its front-end. It grants nothing beyond realtime channels
   here: this project has no tables and no data. */
const SUPABASE_REF = 'jefycofotqcxfvpcgrqj';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZnljb2ZvdHFjeGZ2cGNncnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NDQyMDksImV4cCI6MjEwMTQyMDIwOX0.Hpf2xu_b263ojzQEZOMaxlh2o3GF2QCMDI5p_yeK-QM';

/* Where the game really lives. Used to warn when someone is hosting from a
   local dev copy, whose room links only work on that one machine. */
const PUBLIC_URL = 'https://samuelkimanisikuku.com/paris-metro-game/';
