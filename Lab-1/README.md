<properties
	pageTitle="Real-time Twitter movie popularity analysis with Stream Analytics | Microsoft Azure"
	description="Learn how to use Stream Analytics for real-time Twitter analysis. Step-by-step guidance from event generation to data on a live dashboard."
	keywords="real-time twitter,social media analysis,social media analytics tools"
	services="stream-analytics"
	documentationCenter=""
	editor="zvisha"/>

<tags
	ms.service="stream-analytics"
	ms.devlang="na"
	ms.topic="article"
	ms.tgt_pltfrm="na"
	ms.workload="big-data"
	ms.date="09/01/2015"
	ms.author="zvish"/>


# Disclamer

This tutorial is heavily based on [this](https://azure.microsoft.com/en-us/documentation/articles/stream-analytics-twitter-sentiment-analysis-trends/) tutorial. Small modifications were made to apply it to the **Movies** DLD labs theme.

# Social media analysis: Real-time Twitter analysis in Azure Stream Analytics

In this tutorial, you'll learn how to build an analysis solution by bringing real-time Twitter events into Event Hubs, writing Stream Analytics queries to analyze the data, and then storing the results or using a dashboard to provide insights in real time.

Social media analytics tools help organizations understand trending topics, meaning subjects and attitudes with a high volume of posts in social media.

## Event Hubs
Azure Event Hubs is a highly scalable data ingress service that can ingest millions of events per second so that you can process and analyze the massive amounts of data produced by your connected devices and applications. Event Hubs acts as the "front door" for an event pipeline, and once data is collected into an event hub, it can be transformed and stored using any real-time analytics provider or batching/storage adapters. Event Hubs decouples the production of a stream of events from the consumption of those events, so that event consumers can access the events on their own schedule. [Know more …](https://azure.microsoft.com/en-in/documentation/articles/event-hubs-what-is-event-hubs/)

##Stream Analytics 
Azure Stream Analytics (ASA) is a fully managed, cost effective real-time event processing engine that helps to unlock deep insights from data. Stream Analytics makes it easy to set up real-time analytic computations on data streaming from devices, sensors, web sites, social media, applications, infrastructure systems, and more. [Know more …](https://azure.microsoft.com/en-in/documentation/articles/stream-analytics-introduction/)

## Scenario

A news media website is interested in getting an edge over its competitors by featuring site content that is immediately relevant to its readers. They use social media analysis on topics relevant to their readers by doing real time analysis on Twitter data. Specifically, to identify what topics are trending in real time on Twitter, they need real-time analytics about the tweet volume.

Movies are really fascinating and entertaining. In this exercise, let us use the Event Hub and Stream Analytics to find some interesting trends from tweets about movies such as finding the most popular movies, the movies which have got the highest positive tweets and so on. 

The exercise, uses a ready twitter application that fetches tweets using the twitter API about specific movies (which can be changed by modifying the keywords in the App.config) and assigns a sentiment score to it using an open source tool Sentiment140. 
Then these topics with the assigned sentiment score is streamed to Event Hubs on Azure. 

The ingested tweets with sentiment scores is then streamed into Stream Analytics, where we will use SQL like statements to analyze the incoming sentiments on the movies. 

The sentiment tweets then will be stored into Azure Blob Storage to be used in future as referential data. 

## Prerequisites
1.	A [Twitter account](https://twitter.com/signup) (with mobile number added to your profile)
2.	[Visual Studio](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx)
3.	[Azure Account](https://azure.microsoft.com/en-in/pricing/free-trial/) 
4.	Twitter client application which is located on GitHub.  Download it [here](https://github.com/Azure/azure-stream-analytics/tree/master/DataGenerators/TwitterClient) and follow the steps below to set up your solution.

## Create an Event Hub input and a Consumer Group

In this step, we will create the Event Hubs instance (Event Hub), the namespace for the service bus. We will create a consumer group, which is the end point that Stream Analytics can be connected to. We will also create the policy with appropriate permissions to allow Stream Analytics to read the stream. 

Follow the steps below to create an Event Hub.

1. Navigate to the [azure management portal](https://portal.azure.com) and sign in to it 
2. Select “New” from the top left of the screen and Navigate to “Data + Analytics”, “Event Hub”
3. Provide the “Event Hub Name”, example “bddemoeventhub”, select the “Region” and “Namespace Name” will be based on the “Event Hub Name”
4. Select the newly created Event Hub – “bddemoeventhub”, to move into the options for the event hub. 
5. Click on “Create Consumer Group” and provide a name for the consumer group, example “bddemotweets”. 
In case, there is no consumer group created, there will be always a consumer group created implicitly with the name “$Default”
6. Create the access policy by navigating to the “Configure” tab, provide the name for the policy, example bddemopolicy, and select appropriate permissions and save it
7. Navigate to the Service Bus Dashboard by clicking on the “Back” arrow
8. Select “Connection Information” from the bottom menu bar and copy the Event Hub connection string. 
 

## Configure and start the Twitter client application

We have provided a client application that will tap into Twitter data via [Twitter's Streaming APIs](https://dev.twitter.com/streaming/overview) to collect Tweet events about a parameterized set of topics. The 3rd party open source tool [Sentiment140](http://help.sentiment140.com/) is used to assign a sentiment value to each tweet (0: negative, 2: neutral, 4: positive) and then Tweet events are pushed to Event Hub.

1. Download the twitter application 
	a. Extract the zip file to find the twitter client solution 
	b. Open the twitter client solution in Visual Studio 
2. Create an empty Twitter app and extract the keys 
	a. Navigate to apps.twitter.com 
	b. Click on “Create New App” button  
	c. Provide App Name, a simple name, example MyTwitterApp 
	d. Provide Description, example “A demo twitter app”
	e. Provide Website, a dummy site, example mytwitterapp.com 
	f. Leave the Callback URL empty 
	g. Agree terms by checking the box
	h. Click on “Create your Twitter application” button 
	i. Navigate to the tab “Keys and Access Tokens”, copy the “Consumer Key” and “Consumer Secret”
	j. Click on “Create my Access Token” at the end of the page and copy the “Access Token” and “Access Token Secret”
3. Open the “App.config” file from the Solution Explorer and replace the keys in the app settings with the above values 
	a. Replace “Consumer Key” and “Consumer Secret”
	b. Replace “Access Token” and “Access Token Secret”
	c. Replace “Event Hub Name” and “Event Hub Connection String”
	d. You can also replace the names of the movies of your choice in the twitter keyword setting
4. Build and Run the application to start generating tweets with sentiment score for the movies of your choice 
	a. A console window opens up showing the generated tweets with values for “CreatedAt”, “Topic”, “Sentiment Score”



## Create Stream Analytics job

In this step, we will create and configure a Stream Analytics job to receive the tweets from the Event Hub. A Stream Analytics Job will comprise of input, transformations and output. 

### Provision a Stream Analytics job

1. Navigate to the azure management portal and sign in to it 
2. Select “New” from the bottom of the screen and Navigate to “Data Services”, “Stream Analytics”, “Quick Create”
3. Provide “Job Name”, example “bddemostream”, select the “Region” and either provide an existing storage account or create a new storage account to store monitoring data for the stream. Ensure that all resources are in the same region to avoid network latency and data transfer charges. 
4. Once the stream is created, we will need to configure it to define the input and output, as well as queries before the job is started. 
5. Select the newly created stream – “bddemostream” to navigate to the options for the stream. 
6. Select “Inputs” from the menu options and then click on “Add Input” to provide the input to the stream. 
7. Select “Data Stream” from the options provided to define input to the stream 
8. Select “Event Hub” from the options provided 
9. Provide an “Input Alias”, example “inputtweets” and select the “Event Hub Namespace”, “Event Hub”, “Event Hub Policy” and choose the “Consumer Group” 
10. Navigate to the next screen by clicking on the “Right arrow” at the bottom of the screen 
11. Select the “Event Serialization Format” as “JSON” and the “Encoding” as “UTF8”, by default these are the selections, we can leave it at that. 
12. Select the tick mark on the bottom to complete the creation of the Input. 
13. Select the option “Test Connection” from the bottom menu bar to verify the connection to the Event Hub


### Analyze the Stream in Real time

In this step, we will construct queries to analyze the incoming stream of data and test these queries against sample data captured from the same stream. Once the queries are verified, we will choose a specific query to save it as part of the job which will analyze the tweets in real time and store the aggregated tweets into an output store. 

Stream Analytics supports a simple, declarative query model for describing transformations. To learn more about the language, see the [Azure Stream Analytics Query Language Reference](https://msdn.microsoft.com/library/azure/dn834998.aspx).  This tutorial will help you author and test several queries over Twitter data.

#### Sample data input

To validate your query against actual job data, you can use the SAMPLE DATA feature to extract events from your stream and create a .JSON file of the events for testing.

1. Navigate to the “Inputs” tab from the menu options 
2. Select “Sample Data” from the menu bar at the bottom 
3. Specify the time from when you want to capture the tweets and for what duration. By default, it will be the current time and duration is 10 minutes
4. Select the tick mark on the right to start collecting the sample data 
5. Select “Details” from the notification bar at the bottom of the screen 
6. Select “Click here …” to download the sample json file to your system. By default it is stored in the “Downloads” folder unless you specify a different path. 


#### Pass-through query

To start with, we will do a simple query that projects all the fields in an event, as this query does not do any transformation, it is referred to as Pass-through query. 

1. Navigate to the “Query” tab from the menu options 
2. The Query editor opens up with a sample query. 
3. Replace it with this query – “SELECT * FROM inputtweets”
Ensure that the name of the input source matches the name of the input you specified earlier.
4. Select “Test” under the query editor, it prompts for the sample data file 
5. Browse to your sample .JSON file that you downloaded and Select it. 
6. Select the tick mark button and see the results displayed below the query definition

### Windowing

In applications that process real-time events, a common requirement is to perform some set-based computation (aggregation) or other operations over subsets of events that fall within some period of time. Because the concept of time is a fundamental necessity to complex event-processing systems, it’s important to have a simple way to work with the time component of query logic in the system. In Azure Stream Analytics, these subsets of events are defined through windows to represent groupings by time.

Tumbling windows are a series of fixed-sized, non-overlapping and contiguous time intervals. The following diagram illustrates a stream with a series of events and how they are mapped into 5-second tumbling windows.

When using a sliding window, the system is asked to logically consider all possible windows of a given length. As the number of such windows would be infinite, Azure Stream Analytics instead outputs events only for those points in time when the content of the window actually changes, in other words when an event entered or exists the window.

#### Query to determine the most popular movies based on number of tweets for it

To determine the most popular movies, we will consider the movies that are tweeted about for more than 10 times in the last 5 seconds using a SlidingWindow. The query also demonstrates the aggregation that can be done as part of transformation on the stream. 

1.	Navigate to the “Query” tab from the menu options 
2.	The Query editor opens up with a sample query. 
3.	Replace it with this query – 
		
		SELECT System.Timestamp as Time, Topic, COUNT(*) as Tweeted
		FROM inputtweets TIMESTAMP BY CreatedAt
		GROUP BY SLIDINGWINDOW(second, 5), topic
		HAVING COUNT(*) > 10
Ensure that the name of the input source matches the name of the input you specified earlier.
4.	Select “Test” under the query editor, it prompts for the sample data file 
5.	Browse to your sample .JSON file that you downloaded and Select it. 
6.	Select “Rerun” the query to evaluate the query for a next time window 


#### Query to determine the number of times a movie is tweeted about in a window of 5 seconds

To identify trending topics we'll look for topics that cross a threshold value for mentions in a given amount of time.  For the purposes of this tutorial, we'll check for topics that are mentioned more than 20 times in the last 5 seconds using a [SlidingWindow](https://msdn.microsoft.com/library/azure/dn835051.aspx).

1.	Navigate to the “Query” tab from the menu options 
2.	The Query editor opens up with a sample query. 
3.	Replace it with this query – 

		SELECT System.Timestamp as Time, Topic, COUNT(*) as Tweeted
		FROM inputtweets TIMESTAMP BY CreatedAt
		GROUP BY TUMBLINGWINDOW(second, 5), topic
Ensure that the name of the input source matches the name of the input you specified earlier.
4.	Select “Test” under the query editor, it prompts for the sample data file 
5.	Browse to your sample .JSON file that you downloaded and Select it. 
6.	Select “Rerun” the query to evaluate the query for a next time window 
7.	To use this query to analyze the real time tweets, select “Save” from the menu bar at the bottom 
8.	Confirm to save, when prompted. 


## Create output sink

In this step, we will create a Storage Account and a Container to store the aggregated tweets from the Stream Analytics job. 
It is also feasible to store the results of this job into SQL database, Table Store or Event Hub depending on your specific application needs and the further processing that is required on this aggregated data.

Follow the steps below to create a container for Blob storage, if you don't already have one:

1.	Navigate to the “Storage” option from the menu options in the left bar
2.	Select “New” from the menu bar at the bottom and navigate to “Data Services”, “Storage”, “Quick Create”
3.	Provide the name for the Storage Account, example “bddemostore” and the Region in which it should be created, example “Central US”, we can leave the Replication to the default option of “Geo-Redundant”
4.	Select “Create Storage Account” at the bottom to complete the creation
5.	Select the newly created storage account “bddemostore” and navigate to the “Containers” tab from the menu options at the top 
6.	Select “Create a Container” and provide the name of the container, example “movietrends” and change the “Access” policy to “Public Container” to allow the trends to be easily accessible from other tools and services. 
7.	Select the tick mark at the bottom to complete the creation 

## Specify job output

1.	Navigate to the “Stream Analytics” option from the menu options in the left bar
2.	Select the existing stream analytics “bddemostream”, to navigate to the stream options. 
3.	Select “Outputs” from the menu bar options at the top 
4.	Select “Add Output” from the menu bar at the bottom 
5.	Select “BLOB Storage” from the options provided and Select the tick mark to navigate to the next screen. The options given here give you a good picture about the different output stores that you can have for your stream job. 
6.	Provide the name for the “Output Alias”, example “outputtweets” and Select the storage account created in the previous step, “bddemostore”. Notice that the key will be automatically populated as well as the list of Containers. 
7.	Select the container we created for the purpose of storing tweets, “movietrends”
8.	Provide a prefix for the files that will be stored in the BLOB Storage to easily identify it, example “bddemo” and Select the tick mark to navigate to the next screen.
9.	Select the “Event Serialization Format” as “JSON”, “Encoding” as “UTF8” and “Format” as “Line Separated”. These are the options selected by default as well. 
10.	Select the tick mark at the bottom to complete the configuration of the Output. 

Now the Stream Analytics Job is completely configured with the Input, Query and the Output. It is ready to be started to analyze the stream of tweets and store the results. 

## Start job

1.	While you are on the “bddemostream” page, Select “Start” to initiate the job. The job can be started immediately or at a specified time. 
2.	Leave the selection on “Job Start” and select the tick mark to start the job
Ensure that the tweeter application is running and generating tweets before you start the stream job. 
3.	Once the job is started, navigate to the “Storage” option on the left bar, select “bddemostore” and navigate to the “Containers”. Select the container “movietrends” to view the output file generated. 


## View output for sentiment analysis

Once your job is running and processing the real-time Twitter stream, choose how you want to view the output for twitter analysis. Use a tool like [Azure Storage Explorer](https://azurestorageexplorer.codeplex.com/) or [Azure Explorer](http://www.cerebrata.com/products/azure-explorer/introduction) to view your job output in real time. From here, you could extend your application to include a customized dashboard over your output, like the one pictured below using [Power BI](https://powerbi.com/).


## Get support
For further assistance, try our [Azure Stream Analytics forum](https://social.msdn.microsoft.com/Forums/en-US/home?forum=AzureStreamAnalytics).


## References 

- [Introduction to Azure Stream Analytics](stream-analytics-introduction.md)
- [Get started using Azure Stream Analytics](stream-analytics-get-started.md)
- [Scale Azure Stream Analytics jobs](stream-analytics-scale-jobs.md)
- [Azure Stream Analytics Query Language Reference](https://msdn.microsoft.com/library/azure/dn834998.aspx)
- [Azure Stream Analytics Management REST API Reference](https://msdn.microsoft.com/library/azure/dn835031.aspx)



