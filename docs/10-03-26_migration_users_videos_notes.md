### This migration is being made to carry out these changes:

- users table: 
  - to add date of birth field in each user to get analytics with different age groups users.

- videos table: 
  - adding functionality for a video to have a specific genre too, to open new analytics insights.
  
- new table:
  - genre table will be added
  - video_genre table will be added which will have pkey ref of both videos and genre tables to store genre of each video.

  - This is not a simple enum col in each video because there will be many to many relationship between a genre and a video. i.e. there can be more than one genre of a video and there can be many videos of a particular genre.

