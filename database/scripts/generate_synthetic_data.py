import csv
import random
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Sequence, Tuple


# -----------------------------
# Configuration
# -----------------------------
RANDOM_SEED = 42

NUM_USERS = 10_000
NUM_VIDEOS = 2_000
TARGET_NUM_SESSIONS = 100_000
TARGET_NUM_EVENTS = 4_000_000

BATCH_SIZE = 10_000
PROGRESS_EVERY_EVENTS = 100_000

SESSION_LOOKBACK_DAYS = 60
SESSION_MIN_DURATION_MINUTES = 2
SESSION_MAX_DURATION_MINUTES = 90

SESSION_EVENTS_MIN = 10
SESSION_EVENTS_MAX = 80

OUTPUT_DIR = Path("generated_data")
USERS_FILE = OUTPUT_DIR / "users.csv"
VIDEOS_FILE = OUTPUT_DIR / "videos.csv"
DEVICES_FILE = OUTPUT_DIR / "devices.csv"
SESSIONS_FILE = OUTPUT_DIR / "sessions.csv"
EVENTS_FILE = OUTPUT_DIR / "events.csv"
GENRES_FILE = OUTPUT_DIR / "genres.csv"
VIDEO_GENRE_FILE = OUTPUT_DIR / "video_genre.csv"


# -----------------------------
# Genre / DOB config
# -----------------------------
GENRES = [
    "Action", "Comedy", "Drama", "Horror", "Thriller",
    "Romance", "Documentary", "Animation", "Sci-Fi", "Fantasy",
    "Mystery", "Crime", "Adventure", "Music", "Sport",
]

DOB_START = datetime(1950, 1, 1)
DOB_END = datetime(2006, 12, 31)
_DOB_RANGE_DAYS = (DOB_END - DOB_START).days


def random_dob() -> str:
    return (DOB_START + timedelta(days=random.randint(0, _DOB_RANGE_DAYS))).strftime("%Y-%m-%d")


# -----------------------------
# Event model
# -----------------------------
EVENT_TYPES = (
    "play",
    "pause",
    "seek",
    "like",
    "share",
    "comment",
    "quality_change",
    "exit",
)

GLOBAL_EVENT_WEIGHTS = {
    "play": 0.35,
    "pause": 0.20,
    "seek": 0.20,
    "exit": 0.15,
    "like": 0.03,
    "share": 0.02,
    "comment": 0.03,
    "quality_change": 0.02,
}

TRANSITIONS: Dict[str, Tuple[Sequence[str], Sequence[float]]] = {
    "play": (
        ("pause", "seek", "quality_change", "like", "comment", "share", "play", "exit"),
        (0.33, 0.22, 0.07, 0.05, 0.03, 0.03, 0.17, 0.10),
    ),
    "pause": (
        ("play", "seek", "exit", "quality_change", "like", "comment", "share", "pause"),
        (0.45, 0.18, 0.17, 0.05, 0.04, 0.03, 0.03, 0.05),
    ),
    "seek": (
        ("play", "pause", "seek", "exit", "quality_change", "like", "comment", "share"),
        (0.40, 0.20, 0.10, 0.15, 0.06, 0.03, 0.03, 0.03),
    ),
    "quality_change": (
        ("play", "pause", "seek", "exit", "quality_change", "like", "comment", "share"),
        (0.45, 0.18, 0.14, 0.12, 0.04, 0.03, 0.02, 0.02),
    ),
    "like": (
        ("play", "pause", "seek", "exit", "quality_change", "comment", "share", "like"),
        (0.40, 0.20, 0.14, 0.15, 0.04, 0.03, 0.02, 0.02),
    ),
    "comment": (
        ("pause", "play", "seek", "exit", "quality_change", "like", "share", "comment"),
        (0.26, 0.30, 0.12, 0.15, 0.05, 0.05, 0.03, 0.04),
    ),
    "share": (
        ("pause", "play", "seek", "exit", "quality_change", "like", "comment", "share"),
        (0.22, 0.34, 0.13, 0.15, 0.05, 0.05, 0.03, 0.03),
    ),
}


DEVICE_TYPES = ("mobile", "desktop", "tablet", "tv")
DEVICE_TYPE_WEIGHTS = (0.52, 0.30, 0.10, 0.08)

OS_OPTIONS: Dict[str, Tuple[Sequence[str], Sequence[float]]] = {
    "mobile": (("Android", "iOS"), (0.62, 0.38)),
    "desktop": (("Windows", "macOS", "Linux", "ChromeOS"), (0.64, 0.22, 0.10, 0.04)),
    "tablet": (("iPadOS", "Android", "Windows"), (0.60, 0.30, 0.10)),
    "tv": (("Android TV", "Tizen", "webOS", "Roku OS"), (0.40, 0.22, 0.20, 0.18)),
}

BROWSER_OPTIONS: Dict[str, Tuple[Sequence[str], Sequence[float]]] = {
    "Android": (("Chrome Mobile", "Samsung Internet", "Firefox Mobile"), (0.72, 0.20, 0.08)),
    "iOS": (("Safari", "Chrome iOS", "Firefox iOS"), (0.78, 0.18, 0.04)),
    "Windows": (("Chrome", "Edge", "Firefox"), (0.65, 0.23, 0.12)),
    "macOS": (("Safari", "Chrome", "Firefox"), (0.50, 0.40, 0.10)),
    "Linux": (("Chrome", "Firefox", "Edge"), (0.55, 0.35, 0.10)),
    "ChromeOS": (("Chrome",), (1.0,)),
    "iPadOS": (("Safari", "Chrome iOS"), (0.70, 0.30)),
    "Android TV": (("Android TV Browser", "Chrome"), (0.75, 0.25)),
    "Tizen": (("Samsung Browser",), (1.0,)),
    "webOS": (("LG Web Browser",), (1.0,)),
    "Roku OS": (("Roku Browser",), (1.0,)),
}


@dataclass
class SessionRecord:
    session_id: int
    user_id: int
    device_id: int
    session_start: datetime
    session_end: datetime


@dataclass
class DeviceRecord:
    device_id: int
    user_id: int
    device_type: str
    operating_system: str
    browser: str
    created_at: datetime


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def write_batch(writer: csv.writer, batch: List[Tuple]) -> None:
    if batch:
        writer.writerows(batch)
        batch.clear()


def choose_user_segment() -> str:
    roll = random.random()
    if roll < 0.80:
        return "light"
    if roll < 0.95:
        return "medium"
    return "heavy"


def initial_sessions_for_segment(segment: str) -> int:
    if segment == "light":
        return random.randint(1, 3)
    if segment == "medium":
        return random.randint(5, 10)
    return random.randint(30, 80)


def rebalance_session_counts(
    session_counts: List[int],
    user_segments: List[str],
    target_total_sessions: int,
) -> List[int]:
    current_total = sum(session_counts)
    if current_total == target_total_sessions:
        return session_counts

    segment_indexes = defaultdict(list)
    for user_idx, segment in enumerate(user_segments):
        segment_indexes[segment].append(user_idx)

    if current_total < target_total_sessions:
        deficit = target_total_sessions - current_total
        add_order = [
            ("heavy", 0.70),
            ("medium", 0.22),
            ("light", 0.08),
        ]
        choices = [item[0] for item in add_order]
        weights = [item[1] for item in add_order]
        for _ in range(deficit):
            segment = random.choices(choices, weights=weights, k=1)[0]
            user_idx = random.choice(segment_indexes[segment])
            session_counts[user_idx] += 1
    else:
        excess = current_total - target_total_sessions
        remove_order = ["light", "medium", "heavy"]
        while excess > 0:
            removed_any = False
            for segment in remove_order:
                candidates = [
                    idx
                    for idx in segment_indexes[segment]
                    if session_counts[idx] > 1
                ]
                if not candidates:
                    continue
                user_idx = random.choice(candidates)
                session_counts[user_idx] -= 1
                excess -= 1
                removed_any = True
                if excess == 0:
                    break
            if not removed_any:
                break

    return session_counts


def timestamp_to_str(ts: datetime) -> str:
    return ts.strftime("%Y-%m-%d %H:%M:%S")


def random_session_window(now: datetime) -> Tuple[datetime, datetime]:
    lookback_seconds = SESSION_LOOKBACK_DAYS * 24 * 60 * 60
    start_offset_seconds = random.randint(0, lookback_seconds)
    session_start = now - timedelta(seconds=start_offset_seconds)

    duration_minutes = random.randint(
        SESSION_MIN_DURATION_MINUTES,
        SESSION_MAX_DURATION_MINUTES,
    )
    duration_seconds = duration_minutes * 60
    session_end = session_start + timedelta(seconds=duration_seconds)
    return session_start, session_end


def generate_users(num_users: int) -> List[int]:
    print(f"Generating users: {num_users}")
    user_ids = list(range(1, num_users + 1))

    with USERS_FILE.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["user_id", "dob"])
        batch: List[Tuple] = []

        for user_id in user_ids:
            batch.append((user_id, random_dob()))
            if len(batch) >= BATCH_SIZE:
                write_batch(writer, batch)

        write_batch(writer, batch)

    return user_ids


def generate_videos(num_videos: int) -> List[int]:
    print(f"Generating videos: {num_videos}")
    video_ids = list(range(1, num_videos + 1))

    with VIDEOS_FILE.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["video_id"])
        batch: List[Tuple[int]] = []

        for video_id in video_ids:
            batch.append((video_id,))
            if len(batch) >= BATCH_SIZE:
                write_batch(writer, batch)

        write_batch(writer, batch)

    return video_ids


def generate_genres() -> List[Tuple[int, str]]:
    print(f"Generating genres: {len(GENRES)}")
    genre_records: List[Tuple[int, str]] = [(i + 1, name) for i, name in enumerate(GENRES)]
    with GENRES_FILE.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["genre_id", "name"])
        writer.writerows(genre_records)
    return genre_records


def generate_video_genre(
    video_ids: Sequence[int],
    genre_records: List[Tuple[int, str]],
) -> int:
    print("Generating video_genre mappings")
    genre_ids = [g[0] for g in genre_records]
    count = 0
    with VIDEO_GENRE_FILE.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["video_id", "genre_id"])
        batch: List[Tuple[int, int]] = []
        for video_id in video_ids:
            num_genres = random.choices([1, 2, 3], weights=[0.50, 0.35, 0.15], k=1)[0]
            for gid in random.sample(genre_ids, num_genres):
                batch.append((video_id, gid))
                count += 1
                if len(batch) >= BATCH_SIZE:
                    write_batch(writer, batch)
        write_batch(writer, batch)
    print(f"Generated video_genre rows: {count}")
    return count


def devices_per_user() -> int:
    roll = random.random()
    if roll < 0.72:
        return 1
    if roll < 0.94:
        return 2
    return random.randint(3, 5)


def random_device_created_at(now: datetime) -> datetime:
    max_age_days = 365
    offset_days = random.randint(0, max_age_days)
    offset_seconds = random.randint(0, 24 * 60 * 60 - 1)
    return now - timedelta(days=offset_days, seconds=offset_seconds)


def choose_device_profile() -> Tuple[str, str, str]:
    device_type = random.choices(DEVICE_TYPES, weights=DEVICE_TYPE_WEIGHTS, k=1)[0]
    os_values, os_weights = OS_OPTIONS[device_type]
    operating_system = random.choices(os_values, weights=os_weights, k=1)[0]
    browser_values, browser_weights = BROWSER_OPTIONS[operating_system]
    browser = random.choices(browser_values, weights=browser_weights, k=1)[0]
    return device_type, operating_system, browser


def generate_devices(user_ids: Sequence[int]) -> Tuple[List[DeviceRecord], Dict[int, List[int]]]:
    print("Generating devices")
    now = datetime.now()

    devices: List[DeviceRecord] = []
    user_to_device_ids: Dict[int, List[int]] = defaultdict(list)
    device_id = 1

    with DEVICES_FILE.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["device_id", "user_id", "device_type", "operating_system", "browser", "created_at"])
        batch: List[Tuple[int, int, str, str, str, str]] = []

        for user_id in user_ids:
            count = devices_per_user()
            for _ in range(count):
                device_type, operating_system, browser = choose_device_profile()
                created_at = random_device_created_at(now)

                record = DeviceRecord(
                    device_id=device_id,
                    user_id=user_id,
                    device_type=device_type,
                    operating_system=operating_system,
                    browser=browser,
                    created_at=created_at,
                )
                devices.append(record)
                user_to_device_ids[user_id].append(device_id)

                batch.append(
                    (
                        record.device_id,
                        record.user_id,
                        record.device_type,
                        record.operating_system,
                        record.browser,
                        timestamp_to_str(record.created_at),
                    )
                )

                device_id += 1

                if len(batch) >= BATCH_SIZE:
                    write_batch(writer, batch)

        write_batch(writer, batch)

    print(f"Generated devices: {len(devices)}")
    return devices, user_to_device_ids


def generate_sessions(
    user_ids: Sequence[int],
    user_to_device_ids: Dict[int, List[int]],
    target_num_sessions: int,
) -> List[SessionRecord]:
    print(f"Generating sessions: target={target_num_sessions}")
    now = datetime.now()

    user_segments: List[str] = []
    session_counts: List[int] = []

    for _ in user_ids:
        segment = choose_user_segment()
        user_segments.append(segment)
        session_counts.append(initial_sessions_for_segment(segment))

    session_counts = rebalance_session_counts(session_counts, user_segments, target_num_sessions)

    sessions: List[SessionRecord] = []
    session_id = 1
    with SESSIONS_FILE.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["session_id", "user_id", "device_id", "started_at", "ended_at"])
        batch: List[Tuple[int, int, int, str, str]] = []

        for user_id, count in zip(user_ids, session_counts):
            user_devices = user_to_device_ids[user_id]
            primary_device = user_devices[0]
            for _ in range(count):
                session_start, session_end = random_session_window(now)
                if len(user_devices) == 1:
                    device_id = user_devices[0]
                else:
                    if random.random() < 0.72:
                        device_id = primary_device
                    else:
                        device_id = random.choice(user_devices)

                session = SessionRecord(
                    session_id=session_id,
                    user_id=user_id,
                    device_id=device_id,
                    session_start=session_start,
                    session_end=session_end,
                )
                sessions.append(session)
                batch.append(
                    (
                        session.session_id,
                        session.user_id,
                        session.device_id,
                        timestamp_to_str(session.session_start),
                        timestamp_to_str(session.session_end),
                    )
                )
                session_id += 1

                if len(batch) >= BATCH_SIZE:
                    write_batch(writer, batch)

        write_batch(writer, batch)

    print(f"Generated sessions: {len(sessions)}")
    return sessions


def session_event_count_distribution(
    num_sessions: int,
    target_total_events: int,
) -> List[int]:
    counts = [random.randint(SESSION_EVENTS_MIN, SESSION_EVENTS_MAX) for _ in range(num_sessions)]

    current_total = sum(counts)
    if current_total == target_total_events:
        return counts

    if current_total < target_total_events:
        deficit = target_total_events - current_total
        while deficit > 0:
            idx = random.randrange(num_sessions)
            if counts[idx] < SESSION_EVENTS_MAX:
                counts[idx] += 1
                deficit -= 1
    else:
        excess = current_total - target_total_events
        while excess > 0:
            idx = random.randrange(num_sessions)
            if counts[idx] > SESSION_EVENTS_MIN:
                counts[idx] -= 1
                excess -= 1

    return counts


def next_event_type(previous_event_type: str) -> str:
    options, weights = TRANSITIONS.get(previous_event_type, (EVENT_TYPES, [GLOBAL_EVENT_WEIGHTS[event] for event in EVENT_TYPES]))
    return random.choices(options, weights=weights, k=1)[0]


def generate_event_types_for_session(count: int) -> List[str]:
    if count == 1:
        return ["play"]

    events = ["play"]
    while len(events) < count - 1:
        candidate = next_event_type(events[-1])
        if candidate == "exit" and len(events) < count - 3:
            continue
        events.append(candidate)

    events.append("exit")
    return events


def generate_event_timestamps(
    session_start: datetime,
    session_end: datetime,
    count: int,
) -> List[str]:
    duration_seconds = int((session_end - session_start).total_seconds())
    if duration_seconds <= 0:
        return [timestamp_to_str(session_start)] * count

    offsets = sorted(random.randint(0, duration_seconds) for _ in range(count))
    if count > 0:
        offsets[0] = 0
    if count > 1:
        offsets[-1] = duration_seconds

    timestamps = [session_start + timedelta(seconds=offset) for offset in offsets]
    return [timestamp_to_str(ts) for ts in timestamps]


def generate_events(
    sessions: Sequence[SessionRecord],
    video_ids: Sequence[int],
    target_num_events: int,
) -> int:
    print(f"Generating events: target={target_num_events}")
    session_counts = session_event_count_distribution(len(sessions), target_num_events)

    event_id = 1
    written = 0
    with EVENTS_FILE.open("w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["event_id", "session_id", "video_id", "event_type", "event_timestamp"])
        batch: List[Tuple[int, int, int, str, str]] = []

        for session, event_count in zip(sessions, session_counts):
            event_types = generate_event_types_for_session(event_count)
            event_timestamps = generate_event_timestamps(session.session_start, session.session_end, event_count)

            for event_type, event_timestamp in zip(event_types, event_timestamps):
                video_id = random.choice(video_ids)
                batch.append(
                    (
                        event_id,
                        session.session_id,
                        video_id,
                        event_type,
                        event_timestamp,
                    )
                )
                event_id += 1
                written += 1

                if len(batch) >= BATCH_SIZE:
                    write_batch(writer, batch)

                if written % PROGRESS_EVERY_EVENTS == 0:
                    print(f"Generated events: {written}")

        write_batch(writer, batch)

    print(f"Generated events: {written}")
    return written


def main() -> None:
    random.seed(RANDOM_SEED)
    ensure_output_dir()

    user_ids = generate_users(NUM_USERS)
    video_ids = generate_videos(NUM_VIDEOS)
    genre_records = generate_genres()
    total_video_genre = generate_video_genre(video_ids, genre_records)
    devices, user_to_device_ids = generate_devices(user_ids)
    sessions = generate_sessions(user_ids, user_to_device_ids, TARGET_NUM_SESSIONS)
    total_events = generate_events(sessions, video_ids, TARGET_NUM_EVENTS)

    print("Done")
    print(f"users={len(user_ids)}")
    print(f"videos={len(video_ids)}")
    print(f"genres={len(genre_records)}")
    print(f"video_genre rows={total_video_genre}")
    print(f"devices={len(devices)}")
    print(f"sessions={len(sessions)}")
    print(f"events={total_events}")
    print(f"Output directory: {OUTPUT_DIR.resolve()}")


if __name__ == "__main__":
    main()
