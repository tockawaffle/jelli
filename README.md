<div align="center">
  <img src="./public/images/logos/jelli.svg" alt="Jelli Logo" width="150">
  <h1>Jelli</h1>
  <p><strong>Go with the flow.</strong></p>
  <p>Effortless and fluid employee time tracking.</p>
  
  <p>
    <img src="https://img.shields.io/badge/status-alpha-orange.svg" alt="Project Status: Alpha">
    <img src="https://img.shields.io/badge/license-AGPL--3.0--only-blue.svg" alt="License: AGPLv3">
		<a href="https://wakatime.com/badge/user/e0979afa-f854-452d-b8a8-56f9d69eaa3b/project/75e8b4eb-1106-4289-8d37-41fe2099e16a"><img src="https://wakatime.com/badge/user/e0979afa-f854-452d-b8a8-56f9d69eaa3b/project/75e8b4eb-1106-4289-8d37-41fe2099e16a.svg" alt="wakatime"></a>
  </p>
</div>

> **Disclaimer: Project in Alpha Stage**
> Jelli is currently in active development and should be considered alpha software. It is **not ready for production usage.** Features may be incomplete, and breaking changes or data loss may occur. Please use it for testing and feedback purposes only.
>
> ⚠️ This README currently DOES NOT represent the actual state of how the project should be used an is a rough draft for future implementations. ⚠️

## What is Jelli?

Tired of rigid, punitive time clocks that create friction and distrust? Jelli reimagines employee time management as a seamless and transparent experience. Inspired by the graceful movement of a jellyfish, our platform is designed to help your team find its natural rhythm.

At its heart, Jelli is an open-source tool that allows businesses to easily manage employee hours, handle exceptions like late arrivals or early departures, and gain clear insight into their team's workflow. We believe time management should be about clarity and flexibility, not complexity and control.

### Core Features

*   **Fluid Time Tracking:** A simple, intuitive interface for employees to clock in and out.
*   **Transparent Management:** Easily view team schedules, manage attendance, and make adjustments.
*   **Insightful Reports:** Generate reports to understand attendance patterns and streamline payroll.
*   **FOSS & Self-Hostable:** Host Jelli on your own infrastructure for complete data sovereignty and control.
*   **Cloud Ready:** A managed cloud version is planned for those who want a hassle-free setup.

## Tech Stack

Jelli is built with a modern, real-time technology stack to ensure a fast and responsive user experience.

*   **Backend & Database:** [Convex](https://www.convex.dev/) - For a real-time, serverless backend.
*   **Frontend Framework:** [Next.js](https://nextjs.org/) - For a robust and performant React application.
*   **Authentication:** [BetterAuth](https://better-auth.com/) - For secure and flexible user management.

## How to Use

As the project is in alpha, we are focused on stabilizing the self-hosted version first.

### Cloud Version

The managed cloud version of Jelli is not yet available. We are working hard to bring you a stable, secure, and scalable platform.

### Self-Hosting (for Development & Testing)

You can run Jelli on your own machine for testing or contribution.

**Prerequisites:**
*   Node.js (v18 or later)
*   Git
*   A Convex account

**Steps:**

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nixyan/jelli.git
    cd jelli
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Configure your environment:**
    Create a `.env.local` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
    Now, fill in the required values in `.env.local`, such as your Convex deployment keys and BetterAuth credentials.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:3000`.

## Roadmap

We have a clear vision for Jelli's future. Here is a general outline of our goals.

*   **Phase 1: Alpha (Current)**
    *   [X] Core clock-in / clock-out functionality.
    *   [X] Basic user and organization management.
    *   [X] Foundational UI/UX based on our design system.
    *   [ ] Initial setup for self-hosting.

*   **Phase 2: Beta**
    *   [ ] Advanced team management roles (Managers, Admins, Custom Roles).
    *   [ ] Basic reporting and data exports (CSV, PDF or XLSX).
    *   [ ] Manual time entry and adjustments.
    *   [ ] Initial private beta of the Cloud version.

*   **Phase 3: Version 1.0 (Stable Release)**
    *   [ ] Advanced permissions and roles.
    *   [ ] Polished reporting and analytics dashboard.
    *   [ ] Stability and performance hardening.
    *   [ ] Public launch of the Cloud version with billing.

*   **Phase 4: Future**
    *   [ ] Third-party integrations (Slack, Payroll services).
    *   [ ] Public API for custom integrations.
    *   [ ] Native mobile applications.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our `CONTRIBUTING.md` file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the **GNU Affero General Public License v3.0**. See the `LICENSE` file for more details.

---

<div align="center">
  <p>All glory and honor to our Lord and Savior, Jesus Christ.</p>
  <p>May this project, and all the work of our hands, serve to honor Him.</p>
</div>
