# NARA System: Personas and Scenarios

This document provides a reverse-engineered look at the intended users and operational context of the NARA (Integrated Aquatic Resources Research and Development) system based on the current implementation.

## Personas

### 1. Dr. Nuwan Perera (Senior Oceanographic Researcher)

* **Role** : Internal Subject Matter Expert.
* **Primary Goals** : Monitioring real-time environmental data (sea level, temperature, salinity) to identify patterns and anomalies.
* **Usage Pattern** : Spends most of his time in the **Data Visualization** and **Historical Data** modules. He relies on accurate time-series graphs to compare current station readings against historical averages for research papers and disaster warnings.
* **Pain Points** : Needs high-granularity data and hates gaps in sensor transmission.

### 2. Saman Kumara (Station Field Technician)

* **Role** : Technical Support & Maintenance.
* **Primary Goals** : Ensuring the physical sensor stations (Mirissa, Dondra, etc.) are healthy and transmitting data correctly to the integrated server.
* **Usage Pattern** : Monitors the **Admin Dashboard** and **System Logs** . He uses the station summary views to quickly identify which stations have gone offline or are reporting "Bad Quality" flags.
* **Pain Points** : Needs to know the exact timestamp of the last successful transmission to debug network issues.

### 3. Anula Silva (Administrative Officer / RTI Coordinator)

* **Role** : Operations and Compliance.
* **Primary Goals** : Managing the agency's public interface, ensuring RTI (Right to Information) requests are processed, and coordinating division schedules.
* **Usage Pattern** : Heavy user of the **RTI Portal** , **Internal Mail/Messages** , and the **Agency Calendar** . She manages the **Library** by uploading official documents and reports for public consumption.
* **Pain Points** : Overwhelming volume of public inquiries and tight legal deadlines for RTI responses.

### 4. Kasun Jayawardena (Public Citizen / Local Stakeholder)

* **Role** : External User / Information Seeker.
* **Primary Goals** : Accessing public safety data, downloading research reports, or seeking assistance from the agency.
* **Usage Pattern** : Interacts with the **Contact Us** form, the **Downloads/Library** section, and the public-facing **Sea Level** dashboard. He uses the RTI system only when specific, non-public data is required for his own business or community projects.
* **Pain Points** : Complex scientific data can be hard to interpret without clear visualizations.

---

## System Scenario

The NARA Integrated Aquatic Monitoring System operates as a bridge between high-precision scientific instrumentation and public service delivery. The system is designed to handle the continuous flow of environmental data while simultaneously managing the administrative workflows of a national research agency.

**In a typical operational scenario** , the system begins its day by autonomously receiving and sorting high-frequency sensor data from coastal stations. As packets of data arrive via the `/api/data` endpoint, the system’s processing engine splits them by location (e.g., Mirissa, MJ) and parameter (e.g., Water Level, Wind Speed), updating the MSSQL database in real-time. This automated pipeline ensures that when **Dr. Nuwan** logs in at 8:00 AM, he is greeted with an up-to-date visualization of the morning's sea temperatures across the island. If a station like Dondra stops transmitting, the system immediately flags this in the administrator's view, allowing **Saman** to investigate the hardware fault before critical data gaps occur.

While the scientific data flows in the background, the system’s front-facing modules facilitate human interaction and accountability. **Anula** manages the agency's pulse through the integrated calendar and mail systems; she might spend her morning reviewing a new RTI request submitted by **Kasun** . She uses the system to route this request to the Oceanography division, tracking its progress through the internal dashboard. Once the requested report is ready, she uploads it to the digital Library, which automatically updates the public Downloads section, allowing Kasun to receive a notification and download his document securely. By integrating these diverse threads—from raw telemetry to formal bureaucratic processes—the NARA system ensures that Sri Lanka's aquatic data is not only collected with scientific rigor but also utilized for the benefit of all citizens.
