#!/usr/bin/env python3
"""
Generate seed data CSVs for 500 student accounts.
Uses existing schools, student partner orgs, and grade_levels from test_seeds.sql.
"""

import csv
import random
import uuid
from datetime import datetime, timedelta

# Configuration
NUM_STUDENTS = 500
OUTPUT_DIR = "."

# School IDs from test_seeds.sql
SCHOOL_IDS = [
    '01919662-87fb-9261-542c-58cbced78fc3',  # Unapproved School
    '01919662-87fb-76b3-54f8-db306e73e181',  # Approved School
    '01919662-87fb-d63d-788d-7417e752f5d0',  # Approved Partner School
    '01919662-87fb-6ad2-8227-c1e38adf0907',  # Another Approved Partner School
]

# Student Partner Org IDs from test_seeds.sql
STUDENT_PARTNER_ORG_IDS = [
    '01919662-87dc-1b9c-e053-326c64a2edbc',  # College Mentors
    '01919662-87dc-5f50-e53d-d0a5687d4bfc',  # Community Org
    '01919662-87dc-5824-8bf6-e5e408bf6f40',  # School Helpers
    '01919662-87dc-9530-b5f1-ccc08f9bd619',  # College Learners
    '01919662-87dc-57b3-892e-791e974fd03a',  # All The Students
    '01919662-87fe-5dbc-4b00-412d50590a2b',  # Approved Partner School
    '01919662-8800-b5d6-dff4-97b4627082b9',  # Another Approved Partner School
    '6e074695-be6f-49db-a3a8-cd242c61f6a4',  # Dummy Org
    'c631f993-a53c-4fdb-8ec2-35142a7eb575',  # Dummy School Org
]

# Grade level IDs from seeds.sql (already exist in database)
GRADE_LEVEL_IDS = [1, 2, 3, 4, 5, 6]  # 8th, 9th, 10th, 11th, 12th, College

# Sample data for names
FIRST_NAMES = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
    'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas',
    'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Sebastian', 'Emily', 'Jack',
    'Elizabeth', 'Owen', 'Mila', 'Theodore', 'Ella', 'Aiden', 'Avery', 'Jackson',
    'Sofia', 'Logan', 'Camila', 'Carter', 'Aria', 'Luke', 'Scarlett', 'Gabriel',
    'Victoria', 'Jayden', 'Madison', 'Elijah', 'Luna', 'Julian', 'Grace', 'Mateo',
    'Chloe', 'Grayson', 'Penelope', 'Isaac', 'Layla', 'Levi', 'Riley', 'Wyatt',
    'Zoey', 'Leo', 'Nora', 'Asher', 'Lily', 'Lincoln', 'Eleanor', 'Maverick',
    'Hannah', 'Jaxon', 'Lillian', 'Joshua', 'Addison', 'Nathan', 'Aubrey', 'Ezra',
    'Ellie', 'David', 'Stella', 'Isaiah', 'Natalie', 'Ryan', 'Zoe', 'Caleb'
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
    'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
]

def generate_referral_code():
    """Generate a unique referral code"""
    return f"STU{random.randint(100000, 999999)}"

def generate_timestamp(days_ago_min=30, days_ago_max=365):
    """Generate a timestamp in the past"""
    days_ago = random.randint(days_ago_min, days_ago_max)
    timestamp = datetime.now() - timedelta(days=days_ago)
    return timestamp.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

def generate_students():
    """Generate student users and profiles"""
    print(f"Generating {NUM_STUDENTS} students...")

    users = []
    student_profiles = []
    used_emails = set()
    used_referral_codes = set()

    for i in range(NUM_STUDENTS):
        user_id = str(uuid.uuid4())
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)

        # Generate unique email
        while True:
            email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 99999)}@student.example.com"
            if email not in used_emails:
                used_emails.add(email)
                break

        # Generate unique referral code
        while True:
            referral_code = generate_referral_code()
            if referral_code not in used_referral_codes:
                used_referral_codes.add(referral_code)
                break

        created_at = generate_timestamp(30, 365)
        updated_at = created_at

        # Create user record
        user = {
            'id': user_id,
            'verified': 't',
            'email_verified': 't',
            'phone_verified': 'f',  # Most students don't have phone verified
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'referral_code': referral_code,
            'deactivated': 'f',
            'test_user': 'f',
            'banned': 'f',
            'deleted': 'f',
            'created_at': created_at,
            'updated_at': updated_at
        }

        users.append(user)

        # Create student profile with variety
        # 70% of students have a school
        school_id = random.choice(SCHOOL_IDS) if random.random() < 0.7 else ''

        # 60% of students belong to a student partner org
        spo_id = random.choice(STUDENT_PARTNER_ORG_IDS) if random.random() < 0.6 else ''

        # Random grade level
        grade_level_id = random.choice(GRADE_LEVEL_IDS)

        student_profile = {
            'user_id': user_id,
            'school_id': school_id,
            'student_partner_org_id': spo_id,
            'grade_level_id': grade_level_id,
            'created_at': created_at,
            'updated_at': updated_at
        }

        student_profiles.append(student_profile)

        if (i + 1) % 100 == 0:
            print(f"  Generated {i + 1} students...")

    # Write users CSV
    users_filename = f"{OUTPUT_DIR}/students_users.csv"
    with open(users_filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=users[0].keys())
        writer.writeheader()
        writer.writerows(users)
    print(f"  Wrote {users_filename}")

    # Write student profiles CSV
    profiles_filename = f"{OUTPUT_DIR}/student_profiles.csv"
    with open(profiles_filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=student_profiles[0].keys())
        writer.writeheader()
        writer.writerows(student_profiles)
    print(f"  Wrote {profiles_filename}")

def main():
    print(f"Starting generation of seed data for {NUM_STUDENTS} students...\n")

    # Generate all data
    generate_students()

    print("\n" + "="*60)
    print("✓ Generation complete!")
    print("="*60)
    print("\nGenerated files:")
    print("  - students_users.csv (500 student user records)")
    print("  - student_profiles.csv (500 student profile records)")
    print("\nNote: Uses existing schools, student partner orgs, and grade_levels from test_seeds.sql")
    print("\nTo import these into PostgreSQL, use:")
    print("  \\copy users(id,verified,email_verified,phone_verified,email,first_name,last_name,referral_code,deactivated,test_user,banned,deleted,created_at,updated_at) FROM 'students_users.csv' CSV HEADER;")
    print("  \\copy student_profiles(user_id,school_id,student_partner_org_id,grade_level_id,created_at,updated_at) FROM 'student_profiles.csv' CSV HEADER;")
    print()

if __name__ == "__main__":
    main()
