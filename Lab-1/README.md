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



#### Count of tweets by topic: Tumbling window with aggregation

To compare the number of mentions between topics, we'll leverage a [TumblingWindow](https://msdn.microsoft.com/library/azure/dn835055.aspx) to get the count of mentions by topic every 5 seconds.

1.	Change the query in the code editor to:

		SELECT System.Timestamp as Time, Topic, COUNT(*)
		FROM TwitterStream TIMESTAMP BY CreatedAt
		GROUP BY TUMBLINGWINDOW(s, 5), Topic

	Note that this query uses the **TIMESTAMP BY** keyword to specify a timestamp field in the payload to be used in the temporal computation.  If this field wasn't specified, the windowing operation would be performed using the time each event arrived at Event Hub.  Learn more under "Arrival Time Vs Application Time" in the [Stream Analytics Query Reference](https://msdn.microsoft.com/library/azure/dn834998.aspx).

	This query also accesses a timestamp for the end of each window with **System.Timestamp**.

2.	Click **RERUN** under the query editor to see the results of the query.

#### Identifying trending topics: Sliding window

To identify trending topics we'll look for topics that cross a threshold value for mentions in a given amount of time.  For the purposes of this tutorial, we'll check for topics that are mentioned more than 20 times in the last 5 seconds using a [SlidingWindow](https://msdn.microsoft.com/library/azure/dn835051.aspx).

1.	Change the query in the code editor to:

		SELECT System.Timestamp as Time, Topic, COUNT(*) as Mentions
		FROM TwitterStream TIMESTAMP BY CreatedAt
		GROUP BY SLIDINGWINDOW(s, 5), topic
		HAVING COUNT(*) > 20

2.	Click **RERUN** under the query editor to see the results of the query.

#### Count of mentions: Tumbling window with aggregation

The final query we will test uses a TumblingWindow to obtain the number of mentions for each topic every 5 seconds.

1.	Change the query in the code editor to:

		SELECT System.Timestamp as Time, Topic, COUNT(*)
		FROM TwitterStream TIMESTAMP BY CreatedAt
		GROUP BY TUMBLINGWINDOW(s, 5), Topic

2.	Click **RERUN** under the query editor to see the results of the query.
3.	This is the query we will use for our dashboard.  Click **SAVE** at the bottom of the page.


## Create output sink

Now that we have defined an event stream, an Event Hub input to ingest events, and a query to perform a transformation over the stream, the last step is to define an output sink for the job.  We'll write the aggregated tweet events from our job query to an Azure Blob.  You could also push your results to SQL Database, Table Store or Event Hub, depending on your specific application needs.

Follow the steps below to create a container for Blob storage, if you don't already have one:

1.	Use an existing Storage account or create a new Storage account by clicking **NEW** > **DATA SERVICES** > **STORAGE** > **QUICK CREATE** > and following the instructions on  the screen.
2.	Select the Storage account and then click **CONTAINERS** at the top of the page, and then click **ADD**.
3.	Specify a **NAME** for your container and set its **ACCESS** to Public Blob.

## Specify job output

1.	In your Stream Analytics job, click **OUTPUT** at the top of the page, and then click **ADD OUTPUT**. The dialog that opens will walk you through a number of steps to set up your output.
2.	Select **BLOB STORAGE**, and then click the right button.
3.	Type or select the following values on the third page:

* **OUTPUT ALIAS**: Enter a friendly name for this job output
* **SUBSCRIPTION**: If the Blob Storage you created is in the same subscription as the Stream Analytics job, select **Use Storage Account from Current Subscription**.  If your storage is in a different subscription, select **Use Storage Account from Another Subscription** and manually enter information for **STORAGE ACCOUNT**, **STORAGE ACCOUNT KEY**, **CONTAINER**.
* **STORAGE ACCOUNT**: Select the name of the Storage Account
* **CONTAINER**: Select the name of the Container
* **FILENAME PREFIX**: Type in a file prefix to use when writing blob output

4.	Click the right button.
5.	Specify the following values:
* **EVENT SERIALIZER FORMAT**: `JSON`
* **ENCODING**: `UTF8`
6.	Click the check button to add this source and to verify that Stream Analytics can successfully connect to the storage account.

## Start job

Since a job input, query and output have all been specified, we are ready to start the Stream Analytics job.

1.	From the job **DASHBOARD**, click **START** at the bottom of the page.
2.	In the dialog that appears, select **JOB START TIME**, and then click the checkmark button on the bottom of the dialog. The job status will change to **Starting** and will shortly move to **Running**.


## View output for sentiment analysis

Once your job is running and processing the real-time Twitter stream, choose how you want to view the output for twitter analysis. Use a tool like [Azure Storage Explorer](https://azurestorageexplorer.codeplex.com/) or [Azure Explorer](http://www.cerebrata.com/products/azure-explorer/introduction) to view your job output in real time. From here, you could extend your application to include a customized dashboard over your output, like the one pictured below using [Power BI](https://powerbi.com/).


## Get support
For further assistance, try our [Azure Stream Analytics forum](https://social.msdn.microsoft.com/Forums/en-US/home?forum=AzureStreamAnalytics).


## Next steps

- [Introduction to Azure Stream Analytics](stream-analytics-introduction.md)
- [Get started using Azure Stream Analytics](stream-analytics-get-started.md)
- [Scale Azure Stream Analytics jobs](stream-analytics-scale-jobs.md)
- [Azure Stream Analytics Query Language Reference](https://msdn.microsoft.com/library/azure/dn834998.aspx)
- [Azure Stream Analytics Management REST API Reference](https://msdn.microsoft.com/library/azure/dn835031.aspx)



