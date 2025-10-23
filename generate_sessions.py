#!/usr/bin/env python3
"""
Generate 500 sessions in various topics, all started in the last 5 minutes.
"""

import csv
import random
import uuid
from datetime import datetime, timedelta

# Configuration
NUM_SESSIONS = 500
OUTPUT_DIR = "."

# Subject IDs from test_seeds.sql (active subjects only)
SUBJECT_IDS = [
    1,   # prealgebra
    2,   # algebraOne
    3,   # algebraTwo
    4,   # geometry
    5,   # trigonometry
    6,   # precalculus
    7,   # calculusAB
    9,   # statistics
    10,  # biology
    11,  # chemistry
    12,  # physicsOne
    14,  # environmentalScience
    15,  # satMath
    16,  # satReading
    17,  # essays
    18,  # planning
    19,  # applications
    21,  # integratedMathOne
    22,  # integratedMathTwo
    23,  # integratedMathThree
    24,  # integratedMathFour
    26,  # usHistory
    25,  # reading
    20,  # humanitiesEssays
]

def read_user_ids():
    """Read student and volunteer user IDs from CSVs"""
    print("Reading student and volunteer IDs...")

    # Read student IDs
    student_ids = []
    with open('students_users.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            student_ids.append(row['id'])

    # Read volunteer IDs
    volunteer_ids = []
    with open('users.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            volunteer_ids.append(row['id'])

    print(f"  Found {len(student_ids)} students")
    print(f"  Found {len(volunteer_ids)} volunteers")

    return student_ids, volunteer_ids

def generate_timestamp_last_5_minutes():
    """Generate a timestamp within the last 5 minutes"""
    now = datetime.now()
    seconds_ago = random.randint(0, 300)  # 0-300 seconds (0-5 minutes)
    timestamp = now - timedelta(seconds=seconds_ago)
    return timestamp.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

def generate_sessions(student_ids, volunteer_ids):
    """Generate sessions CSV"""
    print(f"\nGenerating {NUM_SESSIONS} sessions...")

    sessions = []

    # Create a pool of students (allow reuse)
    available_students = student_ids.copy()
    # Create a pool of volunteers (allow reuse)
    available_volunteers = volunteer_ids.copy()

    for i in range(NUM_SESSIONS):
        session_id = str(uuid.uuid4())

        # Pick random student and volunteer
        student_id = random.choice(available_students)
        volunteer_id = random.choice(available_volunteers)

        # Pick random subject
        subject_id = random.choice(SUBJECT_IDS)

        # Generate timestamp in last 5 minutes
        created_at = generate_timestamp_last_5_minutes()
        updated_at = created_at

        # Volunteer joined a bit after session creation (0-60 seconds later)
        created_dt = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S.%f')
        volunteer_joined_dt = created_dt + timedelta(seconds=random.randint(0, 60))
        volunteer_joined_at = volunteer_joined_dt.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

        session = {
            'id': session_id,
            'student_id': student_id,
            'volunteer_id': volunteer_id,
            'subject_id': subject_id,
            'has_whiteboard_doc': 'f',
            'volunteer_joined_at': volunteer_joined_at,
            'reviewed': 'f',
            'to_review': 'f',
            'student_banned': 'f',
            'created_at': created_at,
            'updated_at': updated_at
        }

        sessions.append(session)

        if (i + 1) % 100 == 0:
            print(f"  Generated {i + 1} sessions...")

    # Write to CSV
    filename = f"{OUTPUT_DIR}/sessions.csv"
    with open(filename, 'w', newline='') as f:
        fieldnames = [
            'id', 'student_id', 'volunteer_id', 'subject_id',
            'has_whiteboard_doc', 'volunteer_joined_at', 'reviewed',
            'to_review', 'student_banned', 'created_at', 'updated_at'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(sessions)

    print(f"  Wrote {filename}")

    # Print statistics
    subject_counts = {}
    for session in sessions:
        subject_id = session['subject_id']
        subject_counts[subject_id] = subject_counts.get(subject_id, 0) + 1

    print(f"\nSubject distribution:")
    for subject_id in sorted(subject_counts.keys()):
        count = subject_counts[subject_id]
        print(f"  - Subject ID {subject_id}: {count} sessions")

def main():
    print(f"Starting generation of {NUM_SESSIONS} sessions...\n")

    # Read user IDs
    student_ids, volunteer_ids = read_user_ids()

    # Generate sessions
    generate_sessions(student_ids, volunteer_ids)

    print("\n" + "="*60)
    print("✓ Generation complete!")
    print("="*60)
    print("\nGenerated file:")
    print("  - sessions.csv (500 sessions)")
    print("\nAll sessions started in the last 5 minutes.")
    print("\nTo import into PostgreSQL, use:")
    print("  \\copy sessions(id,student_id,volunteer_id,subject_id,has_whiteboard_doc,volunteer_joined_at,reviewed,to_review,student_banned,created_at,updated_at) FROM 'sessions.csv' CSV HEADER;")
    print()

if __name__ == "__main__":
    main()
