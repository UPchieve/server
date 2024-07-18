# Updating School Seeds

Go to Table Generator[https://nces.ed.gov/ccd/elsi/tableGenerator.aspx] and load table with id 647516 to see the columns and filters.
You'll likely have to replicate the table, but choosing the columns for the latest school year.
For column glossary, see [here](https://nces.ed.gov/ccd/elsi/glossary.aspx?app=tableGenerator&term=11020,9558,13392,47446,47676,47407,47447,47448,47650,47246,47235,47438,47219,47677,47238,47240,47657,47210,47439,47654,13403,49759,47213,47212,47634,47635,47636,47637,47638,47639,47640,47641,47642,47643,47644,47645,47646,47647,47666,47648,47667,47668,47450,47244,47664,47665,47214,47441,47443,47442&level=PublicSchool&groupby=0).

The downloaded CSV file contains some extraneous lines that need to be deleted, some characters that should be replaced with NULL, and you'll need 
to update the column names to remove references to the school year (see the `SchoolNcesMetadataRecord` interface for expected names).
This is easy enough to do by simply importing the file into Google Sheets, making the changes, then exporting as CSV again.

## `school_nces_metadata` Columns
 * school_id - The id of the school in the `upchieve.schools` table.
 * ncessch - The id of the school in NCES.
 * created_at
 * updated_at
 * school_year         
 * st - The state code (e.g. AK, AL, etc.).
 * sch_name - The school name.
 * lea_name - The district name.
 * lcity - The city where the school is located.
 * lzip - The zip where the school is located.
 * mcity - The school's mailing address city.
 * mstate - The school's mailing address state.
 * mzip - The school's mailing address zip.
 * phone               
 * website             
 * sy_status_text - Start of year school status.
 * updated_status_text - Updated school status.
 * effective_date - The effective date of the updated school status.
 * sch_type_text - One of - Regular School, Special Education School, Career and Technical School, or Alternative Education School.
 * nogrades - No grades offered.
 * g_pk_offered - Pre-K offered.   
 * g_kg_offered - Kindergarten offered.
 * g_1_offered - Grade 1 offered.
 * g_2_offered - Grade 2 offered.
 * g_3_offered - Grade 3 offered.
 * g_4_offered - Grade 4 offered.
 * g_5_offered - Grade 5 offered.
 * g_6_offered - Grade 6 offered.
 * g_7_offered - Grade 7 offered.
 * g_8_offered - Grade 8 offered.
 * g_9_offered - Grade 9 offered.
 * g_10_offered - Grade 10 offered.
 * g_11_offered - Grade 11 offered.
 * g_12_offered - Grade 12 offered.
 * g_13_offered - Grade 13 offered.
 * g_ug_offered - Ungraded offered.
 * g_ae_offered - Adult Education offered.
 * gslo - Lowest grade offered.
 * gshi - Highest grade offered.       
 * level - School level, one of - Prekindergarten, Elementary, Middle, Secondary, High, Other, Ungraded, Adult Education, Not Applicable, Not Reported.
 * total_students - The total number of students reported.
 * is_school_wide_title1 - Whether the school is Title1.
 * is_title1_eligible - Whether the school is Title1 eligible.
 * national_school_lunch_program - Whether the school participates in National School Lunch Program, and if so, under what special provisions.
 * nslp_direct_certification - Total students whose eligibility for National School Lunch Program is determined through direct certification.
 * frl_eligible - Total students eligible for free or reduced-price lunch.

### Other Columns (Not Updated)
These columns were not updated (consider dropping).
 * fipst
 * statename
 * state_agency_no
 * union
 * st_leaid
 * leaid
 * st_schid
 * schid
 * mstreet1
 * mstreet2
 * mstreet3
 * mzip4
 * lstreet1
 * lstreet2            
 * lstreet3            
 * lzip4
 * sy_status
 * updated_status
 * sch_type        
 * recon_status   
 * out_of_state_flag
 * charter_text
 * chartauth1
 * chartauthn1
 * chartauth2
 * chartauthn2
 * igoffered
