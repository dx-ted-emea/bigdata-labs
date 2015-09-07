Scenario:
A movie reviewing website is interested in getting an edge over its competitors by featuring site content that is immediately relevant to its readers. 
Specifically, to identify what topics are trending in real time on Twitter, they need real-time analytics about the tweet volume for key topics.

Pre-Req:
Visual Studio
Azure Subscription
Twitter Account

Running the generator code and setting up the Stream Analytics job is very simple.
This sample contains an event generator which calls the Twitter API (dev.twitter.com) to get tweet events. Application parses tweets for parameterized keywords. To run the sample you will need to first create an EventHub and configure the App.config with its connection string.
You can then create a Stream Analytics Job. Configure the input to point to the EventHub you have created. In the Query Window you can copy and paste the Query below:


SELECT Topic,count(*) AS Count, System.Timestamp AS Insert_Time
FROM TwitterInput TIMESTAMP BY CreatedAt
GROUP BY TumblingWindow(second,5), Topic

To see the output in a SQL table, you will need to create a SQL table with the command below and configure a SQL output for your ASA job to point to the database you have created.

In Azure DB, create a SQL Database:

CREATE DATABASE TwitterDemo
GO

Then create a table with the schema below:

USE [TweetCount]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[TweetCount](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[Topic] [nvarchar](128) NULL,
	[Count] [int] NULL,
	[Insert_Time] [datetime2](6) NULL,
 CONSTRAINT [PK_TweetCount] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO

Please note: This sample code calls the Twitter API, which is provided by Twitter, Inc. and not by Microsoft, to obtain tweets. Your use of the Twitter API is governed by your agreement(s) with Twitter, Inc. 