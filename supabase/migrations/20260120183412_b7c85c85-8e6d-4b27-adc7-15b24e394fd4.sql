-- Add flight_number column for the actual flight identifier (separate from internal GenDec number)
ALTER TABLE public.general_declarations 
ADD COLUMN flight_number TEXT;