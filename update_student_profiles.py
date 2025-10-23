#!/usr/bin/env python3
"""
Update student_profiles.csv to only use schools and student_partner_orgs
that actually exist in test_seeds.sql, while keeping the same user_ids.
"""

import csv
import random

# Valid School IDs from test_seeds.sql (all 4 schools)
VALID_SCHOOL_IDS = [
    '01919662-87fb-9261-542c-58cbced78fc3',  # Unapproved School
    '01919662-87fb-76b3-54f8-db306e73e181',  # Approved School
    '01919662-87fb-d63d-788d-7417e752f5d0',  # Approved Partner School
    '01919662-87fb-6ad2-8227-c1e38adf0907',  # Another Approved Partner School
]

# Valid Student Partner Org IDs from test_seeds.sql (9 orgs)
VALID_SPO_IDS = [
    '01919662-87dc-1b9c-e053-326c64a2edbc',  # College Mentors
    '01919662-87dc-5f50-e53d-d0a5687d4bfc',  # Community Org
    '01919662-87dc-5824-8bf6-e5e408bf6f40',  # School Helpers
    '01919662-87dc-9530-b5f1-ccc08f9bd619',  # College Learners
    '01919662-87dc-57b3-892e-791e974fd03a',  # All The Students
    '01919662-87fe-5dbc-4b00-412d50590a2b',  # Approved Partner School (SPO)
    '01919662-8800-b5d6-dff4-97b4627082b9',  # Another Approved Partner School (SPO)
    '6e074695-be6f-49db-a3a8-cd242c61f6a4',  # Dummy Org
    'c631f993-a53c-4fdb-8ec2-35142a7eb575',  # Dummy School Org
]

def update_student_profiles():
    """Update student_profiles.csv with valid IDs only"""
    print("Reading student_profiles.csv...")

    # Read existing profiles
    profiles = []
    with open('student_profiles.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            profiles.append(row)

    print(f"Found {len(profiles)} student profiles")

    # Update profiles with valid IDs
    updated_count = 0
    for profile in profiles:
        updated = False

        # Check and update school_id
        if profile['school_id'] and profile['school_id'] not in VALID_SCHOOL_IDS:
            # Invalid school_id - replace with valid one or make empty
            profile['school_id'] = random.choice(VALID_SCHOOL_IDS) if random.random() < 0.7 else ''
            updated = True

        # Check and update student_partner_org_id
        if profile['student_partner_org_id'] and profile['student_partner_org_id'] not in VALID_SPO_IDS:
            # Invalid SPO id - replace with valid one or make empty
            profile['student_partner_org_id'] = random.choice(VALID_SPO_IDS) if random.random() < 0.6 else ''
            updated = True

        if updated:
            updated_count += 1

    # Write updated profiles back to CSV
    print(f"Updated {updated_count} profiles with invalid IDs")
    print("Writing updated student_profiles.csv...")

    with open('student_profiles.csv', 'w', newline='') as f:
        fieldnames = ['user_id', 'school_id', 'student_partner_org_id', 'grade_level_id', 'created_at', 'updated_at']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(profiles)

    print("✓ Done!")

    # Print statistics
    schools_count = sum(1 for p in profiles if p['school_id'])
    spo_count = sum(1 for p in profiles if p['student_partner_org_id'])
    print(f"\nStatistics:")
    print(f"  - {schools_count} students with schools ({schools_count/len(profiles)*100:.1f}%)")
    print(f"  - {spo_count} students with partner orgs ({spo_count/len(profiles)*100:.1f}%)")

if __name__ == "__main__":
    update_student_profiles()
