#!/usr/bin/env python3
"""
Generate seed data CSVs for 50,000 volunteer profiles with:
- Approved and onboarded status
- Phone numbers
- Various availabilities
- Multiple certifications
"""

import csv
import random
import uuid
from datetime import datetime, timedelta

# Configuration
NUM_VOLUNTEERS = 50000
OUTPUT_DIR = "."

# Certifications available in the system
CERTIFICATIONS = [
    'coachingStrategies', 'academicIntegrity', 'dei', 'communitySafety',
    'reading', 'collegePrep', 'collegeList', 'collegeApps',
    'applicationEssays', 'financialAid', 'essayPlanning', 'essayFeedback',
    'algebraOne', 'algebraTwo', 'geometry', 'trigonometry',
    'precalculus', 'calculusAB', 'calculusBC', 'statistics',
    'biology', 'chemistry', 'physicsOne', 'environmentalScience',
    'ushistory', 'worldhistory', 'humanitiesEssays'
]

# Weekday IDs (1=Monday, 7=Sunday based on typical conventions)
WEEKDAYS = list(range(1, 8))

# Timezones
TIMEZONES = [
    'America/New_York', 'America/Chicago', 'America/Denver',
    'America/Los_Angeles', 'America/Phoenix'
]

# Sample data for names
FIRST_NAMES = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
    'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
    'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
    'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna',
    'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma',
    'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra',
    'Alexander', 'Rachel', 'Patrick', 'Catherine', 'Frank', 'Carolyn', 'Jack', 'Janet',
    'Dennis', 'Ruth', 'Jerry', 'Maria', 'Tyler', 'Heather', 'Aaron', 'Diane'
]

LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
    'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
    'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
    'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
    'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza',
    'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers',
    'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell'
]

def generate_phone():
    """Generate a random US phone number"""
    area_code = random.randint(200, 999)
    exchange = random.randint(200, 999)
    number = random.randint(1000, 9999)
    return f"+1{area_code}{exchange}{number}"

def generate_referral_code():
    """Generate a unique referral code"""
    return f"VOL{random.randint(100000, 999999)}"

def generate_timestamp(days_ago_min=30, days_ago_max=365):
    """Generate a timestamp in the past"""
    days_ago = random.randint(days_ago_min, days_ago_max)
    timestamp = datetime.now() - timedelta(days=days_ago)
    return timestamp.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

def generate_users():
    """Generate users CSV"""
    print(f"Generating {NUM_VOLUNTEERS} users...")

    users = []
    used_emails = set()
    used_referral_codes = set()

    for i in range(NUM_VOLUNTEERS):
        user_id = str(uuid.uuid4())
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)

        # Generate unique email
        while True:
            email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 99999)}@example.com"
            if email not in used_emails:
                used_emails.add(email)
                break

        # Generate unique referral code
        while True:
            referral_code = generate_referral_code()
            if referral_code not in used_referral_codes:
                used_referral_codes.add(referral_code)
                break

        phone = generate_phone()
        created_at = generate_timestamp(30, 365)
        updated_at = created_at

        user = {
            'id': user_id,
            'verified': 't',
            'email_verified': 't',
            'phone_verified': 't',
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone,
            'sms_consent': 't',
            'referral_code': referral_code,
            'deactivated': 'f',
            'test_user': 'f',
            'banned': 'f',
            'deleted': 'f',
            'created_at': created_at,
            'updated_at': updated_at
        }

        users.append(user)

        if (i + 1) % 10000 == 0:
            print(f"  Generated {i + 1} users...")

    # Write to CSV
    filename = f"{OUTPUT_DIR}/users.csv"
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=users[0].keys())
        writer.writeheader()
        writer.writerows(users)

    print(f"  Wrote {filename}")
    return [u['id'] for u in users]

def generate_volunteer_profiles(user_ids):
    """Generate volunteer_profiles CSV"""
    print(f"Generating {len(user_ids)} volunteer profiles...")

    profiles = []

    for i, user_id in enumerate(user_ids):
        timezone = random.choice(TIMEZONES)
        created_at = generate_timestamp(30, 365)
        updated_at = created_at

        profile = {
            'user_id': user_id,
            'timezone': timezone,
            'approved': 't',
            'onboarded': 't',
            'created_at': created_at,
            'updated_at': updated_at
        }

        profiles.append(profile)

        if (i + 1) % 10000 == 0:
            print(f"  Generated {i + 1} profiles...")

    # Write to CSV
    filename = f"{OUTPUT_DIR}/volunteer_profiles.csv"
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=profiles[0].keys())
        writer.writeheader()
        writer.writerows(profiles)

    print(f"  Wrote {filename}")

def generate_availabilities(user_ids):
    """Generate availabilities CSV with variety"""
    print(f"Generating availabilities for {len(user_ids)} volunteers...")

    availabilities = []

    for i, user_id in enumerate(user_ids):
        timezone = random.choice(TIMEZONES)

        # Each volunteer has 2-7 availability slots across different days
        num_slots = random.randint(2, 7)
        selected_weekdays = random.sample(WEEKDAYS, min(num_slots, len(WEEKDAYS)))

        for weekday_id in selected_weekdays:
            # Generate random time slot (in hours, 0-23)
            start_hour = random.randint(6, 20)  # Between 6 AM and 8 PM
            duration = random.choice([2, 3, 4, 5, 6])  # 2-6 hour blocks
            end_hour = min(start_hour + duration, 23)

            created_at = generate_timestamp(30, 365)
            updated_at = created_at

            availability = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'weekday_id': weekday_id,
                'available_start': start_hour,
                'available_end': end_hour,
                'timezone': timezone,
                'created_at': created_at,
                'updated_at': updated_at
            }

            availabilities.append(availability)

        if (i + 1) % 10000 == 0:
            print(f"  Generated availabilities for {i + 1} volunteers...")

    # Write to CSV
    filename = f"{OUTPUT_DIR}/availabilities.csv"
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=availabilities[0].keys())
        writer.writeheader()
        writer.writerows(availabilities)

    print(f"  Wrote {filename} with {len(availabilities)} records")

def generate_users_certifications(user_ids):
    """Generate users_certifications CSV"""
    print(f"Generating certifications for {len(user_ids)} volunteers...")

    # First, we need to output a certifications CSV with known IDs
    print("  Generating certifications reference...")
    certifications_data = []
    cert_id_map = {}

    for idx, cert_name in enumerate(CERTIFICATIONS, start=1):
        cert_id_map[cert_name] = idx
        certifications_data.append({
            'id': idx,
            'name': cert_name,
            'active': 't',
            'created_at': generate_timestamp(400, 730),
            'updated_at': generate_timestamp(400, 730)
        })

    # Write certifications CSV
    cert_filename = f"{OUTPUT_DIR}/certifications.csv"
    with open(cert_filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['id', 'name', 'active', 'created_at', 'updated_at'])
        writer.writeheader()
        writer.writerows(certifications_data)

    print(f"  Wrote {cert_filename}")

    # Generate user-certification mappings
    user_certs = []

    for i, user_id in enumerate(user_ids):
        # Each volunteer has passed 3-10 certifications
        num_certs = random.randint(3, 10)
        selected_certs = random.sample(CERTIFICATIONS, min(num_certs, len(CERTIFICATIONS)))

        for cert_name in selected_certs:
            created_at = generate_timestamp(10, 180)
            updated_at = created_at

            user_cert = {
                'user_id': user_id,
                'certification_id': cert_id_map[cert_name],
                'created_at': created_at,
                'updated_at': updated_at
            }

            user_certs.append(user_cert)

        if (i + 1) % 10000 == 0:
            print(f"  Generated certifications for {i + 1} volunteers...")

    # Write to CSV
    filename = f"{OUTPUT_DIR}/users_certifications.csv"
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=user_certs[0].keys())
        writer.writeheader()
        writer.writerows(user_certs)

    print(f"  Wrote {filename} with {len(user_certs)} records")

def main():
    print(f"Starting generation of seed data for {NUM_VOLUNTEERS} volunteers...\n")

    # Generate all data
    user_ids = generate_users()
    generate_volunteer_profiles(user_ids)
    generate_availabilities(user_ids)
    generate_users_certifications(user_ids)

    print("\n" + "="*60)
    print("✓ Generation complete!")
    print("="*60)
    print("\nGenerated files:")
    print("  - users.csv (50,000 records)")
    print("  - volunteer_profiles.csv (50,000 records)")
    print("  - availabilities.csv (~200,000 records)")
    print("  - certifications.csv (reference data)")
    print("  - users_certifications.csv (~300,000 records)")
    print("\nTo import these into PostgreSQL, use:")
    print("  \\copy users(id,verified,email_verified,phone_verified,email,first_name,last_name,phone,sms_consent,referral_code,deactivated,test_user,banned,deleted,created_at,updated_at) FROM 'users.csv' CSV HEADER;")
    print("  \\copy volunteer_profiles(user_id,timezone,approved,onboarded,created_at,updated_at) FROM 'volunteer_profiles.csv' CSV HEADER;")
    print("  \\copy availabilities(id,user_id,weekday_id,available_start,available_end,timezone,created_at,updated_at) FROM 'availabilities.csv' CSV HEADER;")
    print("  \\copy certifications(id,name,active,created_at,updated_at) FROM 'certifications.csv' CSV HEADER ON CONFLICT DO NOTHING;")
    print("  \\copy users_certifications(user_id,certification_id,created_at,updated_at) FROM 'users_certifications.csv' CSV HEADER;")
    print()

if __name__ == "__main__":
    main()
