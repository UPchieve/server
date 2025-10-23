#!/usr/bin/env python3
"""
Update student_profiles.csv to only use the actual school and student_partner_org IDs
that are in the database, while keeping the same user_ids.
"""

import csv
import random

# Valid School IDs (actual database IDs)
VALID_SCHOOL_IDS = [
    '0180b96e-0fe9-be8b-020c-5c6375afda17',
    '0180b96e-0fe9-e7ec-df77-d64d1862ba24',
    '0180b96e-0fe9-2a80-24d8-fb5c3322324e',
    '0180b96e-0fe9-1534-5d02-756b4e686fad',
]

# Valid Student Partner Org IDs (actual database IDs)
VALID_SPO_IDS = [
    '0180b96e-0f8c-1ebd-92f4-ad5195e4f6ca',
    '0180b96e-0f8c-5d8d-3d69-6b3aa199866d',
    '0180b96e-0f8c-fefb-d2cd-d565a7467abe',
    'ab391ceb-f39b-484b-a6bf-2d701a2b8907',
    'eb8d9795-542f-411f-84fe-20b745a0377c',
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
        if profile['school_id']:
            if profile['school_id'] not in VALID_SCHOOL_IDS:
                # Invalid school_id - replace with valid one or make empty
                profile['school_id'] = random.choice(VALID_SCHOOL_IDS) if random.random() < 0.7 else ''
                updated = True

        # Check and update student_partner_org_id
        if profile['student_partner_org_id']:
            if profile['student_partner_org_id'] not in VALID_SPO_IDS:
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

    # Show distribution
    school_dist = {}
    for p in profiles:
        if p['school_id']:
            school_dist[p['school_id']] = school_dist.get(p['school_id'], 0) + 1

    spo_dist = {}
    for p in profiles:
        if p['student_partner_org_id']:
            spo_dist[p['student_partner_org_id']] = spo_dist.get(p['student_partner_org_id'], 0) + 1

    print(f"\nSchool distribution:")
    for school_id, count in school_dist.items():
        print(f"  - {school_id}: {count} students")

    print(f"\nStudent Partner Org distribution:")
    for spo_id, count in spo_dist.items():
        print(f"  - {spo_id}: {count} students")

if __name__ == "__main__":
    update_student_profiles()
