#Move data from Azure DocumentDB to Azure Blob Storage using Azure Data Factory#
Azure Data Factory has a built in support for data movement data across a variety of data stores. 
In this tutorial you will learn how to use Azure Data Factory to move data from DocumentDB to Azure blob Storage. 
https://azure.microsoft.com/en-us/documentation/articles/data-factory-data-movement-activities/

##Contents##
  1. **What is Azure Data Factory?**  
  2. **Setting up Azure DocumentDB**
  3. **Setting up Azure Storage**
  4. **Creating a Data Factory Pipeline**
  
##What is Azure Data Factory?##
Data Factory is a cloud-based data integration service that orchestrates and automates the movement and transformation of data. Just like a manufacturing factory that runs equipment to take raw materials and transform them into finished goods, Data Factory orchestrates existing services that collect raw data and transform it into ready-to-use information.

Azure Data Factory has a few key entities that work together to define the input and output data, processing events, and the schedule and resources required to execute the desired data flow.
![alt tag] (./media/datafactoryEntities.JPG)


Follow this article to learn more about Azure Data Factory  https://azure.microsoft.com/en-us/documentation/articles/data-factory-introduction/

##Setting up a DocumentDB##
Azure DocumentDB is a fully-managed NoSQL document database service. You will learn how to create a Document DB account and load sample data to it.

  1. In the Azure Portal click on **New --> Data + Storage --> Azure DocumentDB**
  2. Set a name for the account, select the resource group the account will reside in (or create a new one), select the subscription and location.
  
   ![alt tag] (./media/createdocdb.JPG)
 
  3. A new DocumentDB account was created. Click on the account you just created, and in the DocumentDB blade click on the **key** icon. Make a note of the primary connection string. We will use it later.
  
  4. To create a database, click on **Add Database** in the DocumentDB blade and enter the database name

   ![alt tag] (./media/addDB.JPG)
   
  5. Now we will add a collection to the database by clicking on **Add Collection** in the database blade - set the collection name, pricing tier and indexing policy. For this tutorial we will use the default policy. 
  
   ![alt tag] (./media/addCollection.JPG)
   
  6. Last step is pulling data into the collection. For this tutorial we will import the into the collection from a csv file using the [DocumentDB Migration Tool](https://azure.microsoft.com/en-us/documentation/articles/documentdb-import-data/) to import data into the collection. The file can be found under the data folder in this repository ./data/raw_data.csv
  
  ![alt tag] (./media/importData.JPG)
  
  To learn more about adding documents to DocumentDB https://azure.microsoft.com/en-us/documentation/articles/documentdb-view-json-document-explorer/
  
  7. To query the data in the collection, use the Query Explorer. Click on **Query Documents** in the collection blade, and write your query. To execute click on **Run Query**
  
  ![alt tag] (./media/queryData.JPG)
  
  
##Setting up Azure Storage##
Since we will copy data from DocumentDB to Azure Storage, we will need to setup the Storage account in advance. You can either use an existing account, or create a new one for this tutorial.
Following are steps to create the account from the Azure Portal. To learn more about Storage account, follow this [article](https://azure.microsoft.com/en-us/documentation/articles/storage-introduction/)

  1. In the Azure Portal click on **New --> Data + Storage --> Storage account**
  2. Select "Resource Manager" as the deployment model and click on **Create**
  3. Set the name, type, subscription, resource group and location
  
  ![alt tag] (./media/createStorage.JPG)
  
###Using powershell to create Storage account###
Alternatively, you can create a Storage account using powershell script:

```
	# create a new resource group (comment out if you are using an existing resource group)
	New-AzureRmResourceGroup -Name Test_BigData_RG  -Location "North Europe"
	
	# new azure account
	New-AzureRmStorageAccount -Location "North Europe" -Name teststoragedfdemo -ResourceGroupName Test_BigData_RG -Type Standard_LRS
 
 ```
  
  4. In the new create Storage account, click on the **key** icon. Make a note of the primary connection string. We will use it later.
  
##Creating a Data Factory Pipeline##
 We will create a Data Factory account, and a pipeline that will copy the data from the DocumentDB into a blob storage.
 All the json scripts are located under ./src folder in this lab.
 
1. In the Azure portal click on **New --> Data + Analytics --> Data Factory**. Set a name, select the subscription, resource group and location and click on Create.
   
   ![alt tag] (./media/createDataFactory.JPG)

2. In the Data Factory blade, click on **Author and deploy** 
3. Click on *New data store* to create the Storage linked service. Copy the following script to the editor:
   
   ```
   {
		"name": "StorageLinkedService",
		"properties": {
			"description": "",        
			"type": "AzureStorage",
			"typeProperties": {
				"connectionString": "<replace with storage connection string>"
			}
		}
	}
	```
	Replace the connection string with the one you obtained in previous steps.
	
4. Repeat step 3 to create a DocumentDB linked service. This time use the following script, and click on **deploy**
	
	```
	{
		"name": "DocumentDbLinkedService",
		"properties": {        
			"type": "DocumentDb",
			"typeProperties": {
				"connectionString": "<replace with account connection string>;database=<replace with database name>"
			}
		}
	}
	```
	
	Replace the connection string with the one you obtained in previous steps.
	
5. Click on *New dataset* and copy the following script to the editor, and click on **deploy**
   
   ```
   {
		"name": "DocumentDbIn",
		"properties": {
			"published": false,
			"type": "DocumentDbCollection",
			"linkedServiceName": "DocumentDbLinkedService",
			"typeProperties": {
				"collectionName": "<enter collection name>"
			},
			"availability": {
				"frequency": "Day",
				"interval": 1
			},
			"policy": {
				"externalData": {
					"dataDelay": "00:10:00",
					"retryInterval": "00:01:00",
					"retryTimeout": "00:10:00",
					"maximumRetry": 3
				}
			}
		}
	}
	```

	Enter the collection name you created for the data
	
6. Click on *New dataset* and copy the following script to the editor, and click on **deploy**
	
	```
	{
		"name": "BlobTableOut",
		"properties": {
			"published": false,
			"type": "AzureBlob",
			"linkedServiceName": "StorageLinkedService",
			"typeProperties": {
				"folderPath": "data",
				"format": {
					"type": "TextFormat",
					"columnDelimiter": ",",
					"nullValue": "NULL"
				}
			},
			"availability": {
				"frequency": "Day",
				"interval": 1
			}
		}
	}
	```
	
	This will create a container named **data** under the storage account. If you want to use a different name, simply change the value of the "folderPath" property.
	
7. Now we are ready to create the pipeline. Click on **New pipeline** and copy this to the editor, and click on **deploy**
	```
	{
    "name": "DocDbToBlobPipe",
    "properties": {
        "activities": [
            {
                "type": "Copy",
                "typeProperties": {
                    "source": {
                        "type": "DocumentDbCollectionSource",
                        "query": "SELECT persons.id, persons.name, persons.town FROM persons",
                        "nestingSeparator": "."
                    },
                    "sink": {
                        "type": "BlobSink",
                        "blobWriterAddHeader": true,
                        "writeBatchSize": 1000,
                        "writeBatchTimeout": "00:00:59"
                    }
                },
                "inputs": [
                    {
                        "name": "DocumentDbIn"
                    }
                ],
                "outputs": [
                    {
                        "name": "BlobTableOut"
                    }
                ],
                "policy": {
                    "concurrency": 3
                },
                "scheduler": {
                    "frequency": "Day",
                    "interval": 1
                },
                "name": "CopyFromDocDbToBlob"
            }
        ],
        "start": "2015-09-02T00:00:00Z",
        "end": "2015-09-03T00:00:00Z"        
    }
}
	```
	
	This will copy the result of the query to a text file in the storage account. 
	```
	SELECT persons.id, persons.name, persons.town FROM persons
	```	
	To use any other query, change the value of the "query" property in the json script for the pipeline.
	
	Make sure to set a valid start and end time for the pipeline. In this example, the flow will be executed once, as the frequency was set to **Day** and the time internal is only a day long.
	
8. In order to see a diagram of the flow, return to the Data Factory blade and click on **Diagram**
	
	![alt tag] (./media/diagram.JPG)
	
	The colour of each item in the diagram represents the status. To see more data double click on the item.

###Using powershell to create a Data factory pipeline###
You can automate the precess of creating the data factory by executing the powershell script **createdatafactory.ps1** located under ./src folder.
Make sure to update all the json files with the correct connection strings and time internals before creating the pipeline.

```
# create resource group - uncomment if the resource group was not created yet
New-AzureRmResourceGroup -Name Test_BigData_RG  -Location "North Europe"

# create data factory - make sure to update the json files with the correct connection string
New-AzureRmDataFactory -ResourceGroupName Test_BigData_RG -Name DFBigDatatutorialTest -Location "North Europe"
$df=Get-AzureRmDataFactory -ResourceGroupName Test_BigData_RG -Name DFBigDatatutorialTest

New-AzureRmDataFactoryLinkedService $df -File .\StorageLinkedService.json
New-AzureRmDataFactoryLinkedService $df -File .\DocumentDbLinkedService.json
New-AzureRmDataFactoryDataset $df -File .\BlobTableOut.json
New-AzureRmDataFactoryDataset $df -File .\DocumentDbIn.json
New-AzureRmDataFactoryPipeline $df -File .\DocDbToBlobPipe.json

```
	
##Results##
the output of the pipeline will result in a text file, located under the storage account and containing the output of the query executed against the DocumentDB.
   
  
  
   
   
