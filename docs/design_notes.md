# User model

- Every behavioral event in the system must reference a pre-existing user identity.

### Purpose

- The user will be a passive entity in our system, it represents identity and not the behaviour.
- This table will represent stable attributes and identity, so that all the behavioural events can referenecs a consistant actor.

### Attributes

- user_id (system generated)
- Names
- email (unique)
- phone
- status
    - it will just be a state and not a behaviour like inactive since a week, etc.
- timestamps
    - created At
    - updated At

### What this table will not store

- strictly anything that can be directly calculated from the events.
- anything related to video
- anything related to any event

# Video model

- it is another independent entity of our system that makes up the content and not anything particularly related to the analytics goal. 
- it is simply what the system is in which we are applying the analytics too.

### purpose 

- it is being designed separately to represent the media content that the user interacts with.
- to separate core content from the behavioural events performed.

### Attributes

- video_id (system generated)
- uploader_id (references a user identity)
- title
- description
- duration_seconds
- visibility
  - public
  - private
  - unlisted
- upload_timestamp

### what will not be stored ----------

- View counts
- Like counts
- Watch time
- Engagement metrics
- Any derived statistics
- Any event-related data

# Device model

- a device represents the env in which the user accesses the system.

### purpose


- To capture stable device characteristics.
- To allow analysis of usage patterns across platforms.
- To separate device metadata from session or event data.

### Attributes

- device_id (system generated)
- user_id (owner identity)
- device_type
  - mobile
  - desktop
  - tablet
  - tv

- operating_system
- browser
- created_at

### What this table will not store

- Session timestamps
- Login state
- IP addresses
- Behavioral history
- Event metadata


