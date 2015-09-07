
Switch-AzureMode AzureResourceManager 

# create resource group - uncomment if the resource group was not created yet
#New-AzureResourceGroup -Name Test_BigData_RG  -Location "North Europe"

# create data factory - make sure to update the json files with the correct connection string
New-AzureDataFactory -ResourceGroupName Test_BigData_RG -Name DFBigDatatutorialTest -Location "North Europe"
$df=Get-AzureDataFactory -ResourceGroupName Test_BigData_RG -Name DFBigDatatutorialTest

New-AzureDataFactoryLinkedService $df -File .\StorageLinkedService.json
New-AzureDataFactoryLinkedService $df -File .\DocumentDbLinkedService.json
New-AzureDataFactoryDataset $df -File .\BlobTableOut.json
New-AzureDataFactoryDataset $df -File .\DocumentDbIn.json
New-AzureDataFactoryPipeline $df -File .\DocDbToBlobPipe.json

