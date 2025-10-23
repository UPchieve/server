# Volunteer Seed Data Import Guide

This directory contains CSV files to seed your dev database with 50,000 volunteer profiles.

## Generated Files

- **users.csv** - 50,000 user records with phone numbers
- **volunteer_profiles.csv** - 50,000 volunteer profiles (all approved and onboarded)
- **availabilities.csv** - ~225,000 availability records (varying schedules across weekdays)
- **certifications.csv** - Reference data for certifications
- **users_certifications.csv** - ~325,000 certification records (each volunteer has 3-10 certifications)

## What's Included

Each volunteer has:
- ✓ Approved status (`approved = true`)
- ✓ Onboarded status (`onboarded = true`)
- ✓ Phone number (US format: +1XXXXXXXXXX)
- ✓ Phone verified (`phone_verified = true`)
- ✓ Email verified (`email_verified = true`)
- ✓ SMS consent (`sms_consent = true`)
- ✓ 2-7 availability slots across different weekdays
- ✓ 3-10 certifications from various subjects (math, science, college prep, training)
- ✓ Random timezone assignment (US timezones)
- ✓ Realistic timestamps (created 30-365 days ago)

## Import Instructions

### Option 1: Using psql \copy command

Connect to your database and run these commands from the directory containing the CSV files:

```sql
\copy users(id,verified,email_verified,phone_verified,email,first_name,last_name,phone,sms_consent,referral_code,deactivated,test_user,banned,deleted,created_at,updated_at) FROM 'users.csv' CSV HEADER;

\copy volunteer_profiles(user_id,timezone,approved,onboarded,created_at,updated_at) FROM 'volunteer_profiles.csv' CSV HEADER;

\copy availabilities(id,user_id,weekday_id,available_start,available_end,timezone,created_at,updated_at) FROM 'availabilities.csv' CSV HEADER;

\copy certifications(id,name,active,created_at,updated_at) FROM 'certifications.csv' CSV HEADER;

\copy users_certifications(user_id,certification_id,created_at,updated_at) FROM 'users_certifications.csv' CSV HEADER;
```

### Option 2: Using psql with absolute paths

If you're not in the same directory as the CSV files:

```bash
psql -d your_database_name <<EOF
\copy users(id,verified,email_verified,phone_verified,email,first_name,last_name,phone,sms_consent,referral_code,deactivated,test_user,banned,deleted,created_at,updated_at) FROM '/absolute/path/to/users.csv' CSV HEADER;
\copy volunteer_profiles(user_id,timezone,approved,onboarded,created_at,updated_at) FROM '/absolute/path/to/volunteer_profiles.csv' CSV HEADER;
\copy availabilities(id,user_id,weekday_id,available_start,available_end,timezone,created_at,updated_at) FROM '/absolute/path/to/availabilities.csv' CSV HEADER;
\copy certifications(id,name,active,created_at,updated_at) FROM '/absolute/path/to/certifications.csv' CSV HEADER;
\copy users_certifications(user_id,certification_id,created_at,updated_at) FROM '/absolute/path/to/users_certifications.csv' CSV HEADER;
EOF
```

### Option 3: Import script

You can also create a bash script to automate the import:

```bash
#!/bin/bash
DBNAME="your_database_name"

echo "Importing users..."
psql -d $DBNAME -c "\copy users(id,verified,email_verified,phone_verified,email,first_name,last_name,phone,sms_consent,referral_code,deactivated,test_user,banned,deleted,created_at,updated_at) FROM 'users.csv' CSV HEADER;"

echo "Importing volunteer profiles..."
psql -d $DBNAME -c "\copy volunteer_profiles(user_id,timezone,approved,onboarded,created_at,updated_at) FROM 'volunteer_profiles.csv' CSV HEADER;"

echo "Importing availabilities..."
psql -d $DBNAME -c "\copy availabilities(id,user_id,weekday_id,available_start,available_end,timezone,created_at,updated_at) FROM 'availabilities.csv' CSV HEADER;"

echo "Importing certifications..."
psql -d $DBNAME -c "\copy certifications(id,name,active,created_at,updated_at) FROM 'certifications.csv' CSV HEADER;"

echo "Importing user certifications..."
psql -d $DBNAME -c "\copy users_certifications(user_id,certification_id,created_at,updated_at) FROM 'users_certifications.csv' CSV HEADER;"

echo "Done!"
```

## Important Notes

1. **Order matters**: Import in the order shown above due to foreign key constraints
   - `users` must be imported first
   - `certifications` should be imported before `users_certifications`
   - `volunteer_profiles` depends on `users`
   - `availabilities` depends on `users`

2. **Certifications conflict handling**: The certifications CSV uses `ON CONFLICT DO NOTHING` in case some certifications already exist in your database

3. **Password field**: The generated users don't have passwords set. If you need to log in as these users, you'll need to set passwords separately

4. **Verification**: After import, verify the counts:
   ```sql
   SELECT COUNT(*) FROM users WHERE phone IS NOT NULL;
   SELECT COUNT(*) FROM volunteer_profiles WHERE approved = true AND onboarded = true;
   SELECT COUNT(*) FROM availabilities;
   SELECT COUNT(*) FROM users_certifications;
   ```

5. **Sample queries** to verify the data:
   ```sql
   -- Find volunteers with specific certifications
   SELECT u.first_name, u.last_name, u.email, c.name
   FROM users u
   JOIN users_certifications uc ON u.id = uc.user_id
   JOIN certifications c ON uc.certification_id = c.id
   WHERE c.name = 'algebraOne'
   LIMIT 10;

   -- Find volunteers available on Mondays
   SELECT u.first_name, u.last_name, a.available_start, a.available_end
   FROM users u
   JOIN availabilities a ON u.id = a.user_id
   WHERE a.weekday_id = 1  -- Monday
   LIMIT 10;

   -- Count certifications per volunteer
   SELECT u.email, COUNT(uc.certification_id) as cert_count
   FROM users u
   JOIN users_certifications uc ON u.id = uc.user_id
   GROUP BY u.id, u.email
   ORDER BY cert_count DESC
   LIMIT 10;
   ```

## Regenerating Data

To regenerate the CSV files with different data, run:

```bash
python3 generate_volunteer_seed_data.py
```

The script will create fresh CSV files with new UUIDs and randomized data.
