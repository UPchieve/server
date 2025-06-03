# Updating Schools Data

We download all the school metadata from NCES using
their [Table Generator](https://nces.ed.gov/ccd/elsi/tableGenerator.aspx). For
an example generated table when updating the schools in June 2025, load table with id 654281.
If you load the table, you could probably just select "Modify" and select the latest year,
then skip the column selection.

1. Under "Select a Table Row", select "Public School".
2. Under "Select Years", select the latest year.
3. Under "Select Table Columns", select the following:
  - Information > Basic Information
      - State Abbr
      - School Name
      - School ID (12-digit)
      - Agency Name
      - Agency ID
  - Information > Contact Information
      - Location City
      - Location Zip
      - Mailing City
      - Mailing Zip
  - Characteristics > School/District Classification Information
      - National School Lunch Program
  - Characteristics > Grade Span Information
      - Lowest Grade Offered
      - Highest Grade Offered
  - Enrollments > Total Enrollment
      - Total Students, All Grades (Excludes AE)
  - Enrollments > Students in Special Programs
      - Direct Certification
      - Free and Reduced Lunch Students
          - You might see both "Free Lunch Eligible" and "Reduced-price Lunch Eligible Students".
            This field is just adding both of those together.
4. Under "Select Filters", select State > Filter by individual states.
    There are over 100,000 schools, and trying to open that as CSV melts my computer.
    If the same happens for you, break the CSV download into two:
    Alabama-Mississippi and Missouri-Wyoming.

Once you've downloaded the CSV, import into a Google Sheet for some pre-processing.

1. Remove the extra lines at the top. We want this to actually be a CSV.
2. ZERO PAD THE NCES IDS.
  In the upsert script, we use the school's NCES ID for finding existing schools
  to update, so if that NCES ID is wrong, you'll end up creating a bunch of schools
  instead of updating them.
  - Select the entire School ID column, then go to Format > Number > Custom Number Format.
  Enter 12 zeroes in the input and apply.
  - Select the entire Agency ID column, and do the same but with 7 zeroes instead.
3. Remove ‡, †, – and any other non-number characters.
  - Copy the character.
  - Go to Edit > Find and replace.
  - Paste the character into "Find" input.
  - Don't add any input to "Replace with".
  - Click "Replace all".
  - Repeat for each of the characters.
4. Update the column names so it matches the expected fields in the script.
  - School Name -> sch_name
  - State Abbr -> st
  - School ID -> ncessch
  - Agency Name -> lea_name
  - Agency ID -> leaid
  - Location City -> lcity
  - Location Zip -> lzip
  - Mailing City -> mcity
  - Mailing Zip -> mzip
  - Lowest Grade Offered - gslo
  - Highest Grade Offered - gshi
  - Total Students All Grades -> total_students
  - National School Lunch Program -> national_school_lunch_program
  - Direct Certification -> nslp_direct_certification
  - Free and Reduced Lunch Students -> frl_eligible
  
Now, download the data as CSVs from Google Sheets, and place
the files into this directory. Commit and merge, then run the `UpsertSchools`
job, passing in the school year (e.g. 2023-2024) of the data (not the year you ran it)
and the names of the files. As a sanity check, run on staging first.
