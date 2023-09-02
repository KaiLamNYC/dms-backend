# Deadman's Switch

## Overview

The Deadman's Switch is a powerful full-stack application designed to provide users with a reliable mechanism for sending critical information or messages when they are unable to do so themselves. This project is particularly useful for situations where individuals may be in high-risk or isolated environments and need a fail-safe means of communication.

### Key Features

- **Email Payloads**: Users can compose and send email payloads containing crucial information or messages.

- **Disarm Password**: To ensure security, a disarm password can be set for each payload. This password is required to prevent automatic triggering.

- **Check-In Intervals**: Users can configure the frequency at which they need to check in to confirm their well-being. This prevents the automatic sending of the payload.

- **Email Notifications**: The system sends email notifications with unique check-in links at specified intervals to the user's chosen recipient email address.

- **Automatic Triggering**: If the user fails to check in within the specified time frame or if they explicitly trigger the payload, the system will automatically send the payload to the recipient email.

### Use Cases

- **Emergency Situations**: In cases of accidents, health emergencies, or dangerous situations, the Deadman's Switch ensures that vital information reaches the intended recipient promptly.

- **Remote Workers**: For individuals working in remote or hazardous environments, this system serves as a lifeline to request assistance or report incidents.

- **Journalists and Activists**: Journalists and activists in potentially risky situations can use this tool to send out alerts if their safety is compromised.

- **Travelers**: Travelers exploring remote areas can set up a Deadman's Switch as a safety measure in case they go off the grid unexpectedly.

- **Peace of Mind**: For anyone who wants peace of mind knowing that there's a reliable method to communicate important information in case of unexpected events.

The Deadman's Switch project combines backend functionality utilizing Twilio SendGrid, cron-job.org for scheduling, MongoDB for data storage, and JWT for authentication with a frontend developed using Next.js and styled with Tailwind CSS, creating a robust and secure communication tool for various scenarios.

## Libraries Used

Here are some of the key libraries and technologies used to build this project:

- **NodeJS** - The primary programming language used for the backend.
- **Twilio SendGrid** - Used for sending email notifications, providing a reliable email delivery service.
- **Cron-Job.org** - Employed for scheduling and managing cron jobs, ensuring timely check-in intervals and payload sending.
- **Tailwind CSS** - Utilized for a sleek and responsive user interface design, making the application visually appealing and user-friendly.
- **MongoDB** - Chosen as the database system for storing and managing user data and payload information.
- **Next.js** - A React framework employed for building the frontend, enabling efficient client-side rendering and dynamic web applications.
- **JSON Web Tokens (JWT)** - Used for secure authentication and authorization, enhancing the application's overall security.
