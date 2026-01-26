USE [NARA]
GO
/****** Object:  Table [dbo].[STATIONS]    Script Date: 12/18/2025 10:13:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[STATIONS](
	[station_id] [varchar](32) NOT NULL,
	[name] [nvarchar](100) NULL,
	[latitude] [decimal](9, 6) NULL,
	[longitude] [decimal](9, 6) NULL,
	[location_description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[station_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MEASUREMENT_TYPES]    Script Date: 12/18/2025 10:13:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MEASUREMENT_TYPES](
	[measurement_type_id] [int] IDENTITY(1,1) NOT NULL,
	[code] [varchar](32) NOT NULL,
	[description] [nvarchar](255) NULL,
	[unit] [varchar](32) NULL,
PRIMARY KEY CLUSTERED 
(
	[measurement_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MEASUREMENTS]    Script Date: 12/18/2025 10:13:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MEASUREMENTS](
	[measurement_id] [bigint] IDENTITY(1,1) NOT NULL,
	[station_id] [varchar](32) NOT NULL,
	[measurement_ts] [datetime2](7) NOT NULL,
	[measurement_type_id] [int] NOT NULL,
	[value] [float] NULL,
	[quality_flag] [varchar](16) NULL,
PRIMARY KEY CLUSTERED 
(
	[measurement_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Measurement] UNIQUE NONCLUSTERED 
(
	[station_id] ASC,
	[measurement_type_id] ASC,
	[measurement_ts] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_LatestStationReadings]    Script Date: 12/18/2025 10:13:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_LatestStationReadings]
AS
WITH LatestTs AS (
    SELECT station_id, MAX(measurement_ts) AS latest_ts
    FROM MEASUREMENTS
    GROUP BY station_id
)
SELECT 
    s.station_id,
    s.name,
    l.latest_ts,
    MAX(CASE WHEN mt.code = 'AT' THEN m.value END) AS AT,
    MAX(CASE WHEN mt.code = 'BP' THEN m.value END) AS BP,
    MAX(CASE WHEN mt.code = 'HU' THEN m.value END) AS HU,
    MAX(CASE WHEN mt.code = 'RN' THEN m.value END) AS RN,
    MAX(CASE WHEN mt.code = 'WI' THEN m.value END) AS WI,
    MAX(CASE WHEN mt.code = 'WL' THEN m.value END) AS WL,
    MAX(CASE WHEN mt.code = 'WT' THEN m.value END) AS WT
FROM LatestTs l
JOIN MEASUREMENTS m 
    ON m.station_id = l.station_id 
   AND m.measurement_ts = l.latest_ts
JOIN STATIONS s ON s.station_id = m.station_id
JOIN MEASUREMENT_TYPES mt ON mt.measurement_type_id = m.measurement_type_id
GROUP BY s.station_id, s.name, l.latest_ts;
GO
ALTER TABLE [dbo].[MEASUREMENTS]  WITH CHECK ADD FOREIGN KEY([measurement_type_id])
REFERENCES [dbo].[MEASUREMENT_TYPES] ([measurement_type_id])
GO
ALTER TABLE [dbo].[MEASUREMENTS]  WITH CHECK ADD FOREIGN KEY([station_id])
REFERENCES [dbo].[STATIONS] ([station_id])
GO
/****** Object:  StoredProcedure [dbo].[GetLatestMeasurements]    Script Date: 12/18/2025 10:13:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetLatestMeasurements]
    @station_id VARCHAR(32)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT m.measurement_ts, mt.code, m.value, m.quality_flag
    FROM MEASUREMENTS m
    JOIN MEASUREMENT_TYPES mt ON m.measurement_type_id = mt.measurement_type_id
    WHERE m.station_id = @station_id
      AND m.measurement_ts = (
            SELECT MAX(measurement_ts)
            FROM MEASUREMENTS
            WHERE station_id = @station_id
      )
    ORDER BY mt.code;
END;
GO
/****** Object:  StoredProcedure [dbo].[InsertMeasurement]    Script Date: 12/18/2025 10:13:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[InsertMeasurement]
    @station_id VARCHAR(32),
    @measurement_ts DATETIME2,
    @measurement_type_code VARCHAR(32),
    @value FLOAT,
    @quality_flag VARCHAR(16) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @measurement_type_id INT;

    -- Lookup measurement_type_id
    SELECT @measurement_type_id = measurement_type_id
    FROM MEASUREMENT_TYPES
    WHERE code = @measurement_type_code;

    IF @measurement_type_id IS NULL
    BEGIN
        RAISERROR('Invalid measurement type code', 16, 1);
        RETURN;
    END

    -- Insert measurement, avoiding duplicates
    IF NOT EXISTS (
        SELECT 1
        FROM MEASUREMENTS
        WHERE station_id = @station_id
          AND measurement_type_id = @measurement_type_id
          AND measurement_ts = @measurement_ts
    )
    BEGIN
        INSERT INTO MEASUREMENTS(station_id, measurement_ts, measurement_type_id, value, quality_flag)
        VALUES (@station_id, @measurement_ts, @measurement_type_id, @value, @quality_flag);
    END
END;
GO
