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

