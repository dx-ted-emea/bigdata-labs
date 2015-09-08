#Building Predictive Models With Azure ML Studio to Gain Insight into Movie Data#

##Prerequisites##

### Configure TheMovieDB

You'll need an API key from [themoviedb.org](http://themoviedb.org). To do this:

* Visit themoviedb.org and sign up for a free account
* Once signed up, visit `https://www.themoviedb.org/account/<youraccountname>/api/details`.
  You will see your api key. Copy this key and use it in
  `MovieDataGenerator.py` (located in the `MovieDataGenerator` folder)
* Install the `simpletmdb` python package, by running: `pip install simpletmdb` at the command line
  (this assumes python v2.7.x is installed).

###Next:

* [Install Visual Studio 2015 with Python Tooling](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) (optional; you can also run
  the python app from the command-line, assuming you have python 2.7.x installed)
* Run the `MovieDataGenerator` script to generate the movie data csv file
* [Get an Azure Account and Sign In](https://azure.microsoft.com/en-us/pricing/free-trial/)


##Contents##
  1. **What is Machine Learning?**
  2. **Movie Distribution and Profit!**
  3. **Setting Up an Azure ML Studio Instance**
  4. **Getting Data into an Experiment** 
  5. **Data Normalization & Feature Engineering**
  6. **Classifier Selection & Training**
  7. **Benchmarking**
  8. **Publishing & Consuming**
  
##1. What is Machine Learning?##

####Intro####

From baseball to politics, Machine Learning (ML) helps developers draw insight from large datasets in new and interesting ways. Until recently however it took a tremendous amount of effort and technical background in Data Science to engage with ML. In this Lab we will walk through the Azure ML offering to build a ML API that can be consumed to try and predict whether a given movie will turn a profit.

####Types of Models and Insight####

There are three main types of ML models Regression, Clustering and Classification:

 * ***Regression***: used to forecast continuous values, often numbers such as prices, temperatures and ages. In the case of movie data regression can be used to forecast how much money a movie will make or how many people will show up to the opening night.
 *  ***Clustering***: used to categorize data into related buckets, often used for recommendation, finding relationships and determining trends. In the case of movies clustering can be used to find related movies or make recommendations to viewers about what to see next.
 * ***Classification***: used to determine which class label should be applied to an input, often used for detection, ranking, or grouping data into know categories. In the case of movies classification could be used to predict a movie's genre, MPAA rating or in the case of this lab whether or not a movie will turn a profit. 

####ML 101####

The ML Process can be broken down into the following stages:
 * ***Data Collection***: often overlooked yet is the most important step. If you train on bad data you will get bad insights and bad models. When selecting data for a model be sure to choose data that is representative of the phenomenon you want to model. For example in this lab when I compiled my dataset I made sure to select 2000 representative  movies that made a profit and 2000 that didn't. 
 
 *  ***Normalization***: In a perfect world, data is clean and ready to be mined for insight, but in reality this is rarely the case. In the data normalization stage we get rid of noisy data and attempt to clean missing values. In the case of our model an example of noisy data might be the year a movie was released. If we were to make our model dependent on the release year it might perform well in testing but would have trouble making predictions on movies that have not yet been released. The phenomenon of building a model that does not perform well outside of our test environment is called **Overfitting**.
 
 *  ***Feature Engineering***: how we **quantify data** for training. The main types of features are numerical, categorical, binary, text, image and inference. In azure ML data scientists often leverage scripts to generate new features. For a good primer in feature engineering see [Feature engineering and selection in Azure Machine Learning](https://azure.microsoft.com/en-us/documentation/articles/machine-learning-feature-selection-and-engineering/)
 
 *   ***Algorithm Selection***: how you **qualify data** the features we select our fed into these models that process them and provide a prediction or forecast. The main types of ML algorithms are Probabilistic, Graph, and Algebraic. For a good primer in how to choose a model see [How to choose algorithms for Microsoft Azure Machine Learning] (https://azure.microsoft.com/en-us/documentation/articles/machine-learning-algorithm-choice/). Note: the best models often use the aggregate results of multiple algorithms this is called an **ensemble approach**. Keep in mind that for every algorithm you add there is a trade off in the time it takes to process your input.
 
 * ***Training and Optimization***: where you feed your data into your model. A common mistake is to train and test your model using your whole dataset. Doing this will lead to Overfitting. To prevent overfitting it is recommended you shuffle all the features in your data set split them into the following three sets:
  - Training Set (60-70%) of your dataset for training your model.
  - Test Set (20-30%) of your data set for testing your model
  - Validation Set (10-20%) of your data for optimizing your model
  
 Most models have parameters available for fine tuning, while you can sometime gauge these values based on intuition a common approach, supported by Azure ML, is [Parameter Sweeping](https://msdn.microsoft.com/en-us/library/azure/Dn905810.aspx). Parameter Sweeping will search for the parameters that return the best model using your validation set.

* ***Benchmarking***: how you gauge the performance and quality of you model using your test set. While its often tempting to gauge a models performance just by looking at its accuracy or coefficient of determination doing so can be misleading. Azure ML provides a number of ways to gauge model performance for more information see [How to evaluate model performance in Azure Machine Learning](https://azure.microsoft.com/en-us/documentation/articles/machine-learning-evaluate-model-performance/)
 

##2. Movie Distribution and Profit!##


Before we get started lets briefly discuss how accounting in Hollywood works since it affects how we evaluate box office profits.

In elementary math you may have learned that **Profit = Revenue - Cost**. However since movie studios typically only release their production budget the determining the profitability is not so clear cut.

There are three main overheads in addition to production budget to consider when accounting for movie profit.

* ***Production***:  These are production costs beyond labor, scenery, and material that are not accounted for in the production budget typically tend to be equivalent to an additional 15% of the production budget.
* ***Distribution***: Most production companies do not deal directly with movie theaters they instead make arrangements with distributers who keep typically keep around 30% of what they receive from theaters.
* ***Marketing***: This number varies depending on the movie but tends to be an additional 10% to 15%.

To account for these costs the standard rule of thumb is to calculate movie profit with the formula:
 
 > Profit =Total World Gross /2 - Production Budget. 
 
Please note that this is a heuristic and sometimes movies with excessive marketing campaigns can lose money even if they are high grossing. A great example of this is the Star Wars movie [Return of The Jedi] (http://www.theatlantic.com/business/archive/2011/09/how-hollywood-accounting-can-make-a-450-million-movie-unprofitable/245134/
 ). However since this metric is the industry standard we will be using it in our model to determine whether a movie will make a profit.

##3. Setting Up an Azure ML Studio Instance##


***Step 1: Navigate to ML tab in Azure Portal***
media/new-hdinsight-cluster-settings.png
![alt tag](media/1%20Setting%20Up%20Azure%20ML%20Instance/2%20AzurePortalNavigateToML.jpg)

***Step 2: Create an ML Workspace***

* Choose a unique Workspace name
* Associate a pre-existing storage account or follow the steps to create your own.
* Select the South Central U.S. Datacenter

![alt tag](media/1%20Setting%20Up%20Azure%20ML%20Instance/3%20Create%20ML%20WorkSpace.jpg)

***Step 3: Sign into ML Studio***
![alt tag](media/1%20Setting%20Up%20Azure%20ML%20Instance/4%20Sign%20In%20to%20ML%20Studio.jpg)

##4. Getting Data into an Experiment##
***Step 1: Navigate to the Datasets tab in ML Studio and Click New***

![alt tag](media/2%20Getting%20Data%20into%20An%20Experiment/1%20Datasets%20Menu.jpg)

***Step 2: Select from local file***

![alt tag](media/2%20Getting%20Data%20into%20An%20Experiment/2%20New%20Dataset%20From%20Local%20File.jpg)

***Step 3: Upload Dataset***

* Click 'Choose File' and select the CuratedMovieData.csv that was generated by the Movie Data Generator Project
* Name the Dataset CuratedMovieData
* Select Generic CSV File with a header
* Click the Checkmark

![alt tag](media/2%20Getting%20Data%20into%20An%20Experiment/3%20Upload%20a%20new%20dataset.jpg)

***Step 4: Navigate to the Experiments tab in ML Studio and Click New***

![alt tag](media/2%20Getting%20Data%20into%20An%20Experiment/4%20Experiment%20Menu.jpg)

***Step 5: Create a New Blank Experiments***

![alt tag](media/2%20Getting%20Data%20into%20An%20Experiment/5%20New%20Experiment.jpg)

***Step 6: Name the Experiment and Import Curated Dataset***

* Rename the experiment to Movie Predictor
* Expand Saved Datasets -> My Datasets and Drag Curated Movie data on to the page

![alt tag](media/2%20Getting%20Data%20into%20An%20Experiment/6%20Name%20Experiment%20and%20Import%20Data.jpg)

***Step 7: Right Click the Bottom of Dataset and Select Visualize***

![alt tag](media/2%20Getting%20Data%20into%20An%20Experiment/7%20Visualize%20Data.jpg)

***Step 8: Visualize your dataset***

* Visualizing a dataset allows you to see useful analytics and gauge relationships between features.
* Click on the Revenue column
* On the right side of the screen you will see some analytics and a 'compare to' combobox
* Set the 'compare to' combo box to a couple different values 
* Does anything stand out to you? If so keep a note of it.
![alt tag](media/2%20Getting%20Data%20into%20An%20Experiment/8%20Data%20Visualized.jpg)

##5. Data Normalization & Feature Engineering##
***Step 1: Get rid of noisy columns***

When you visualized the data in the last step, you probably noticed that there were a lot of fields such as Id that had no noticeable statistical correlation to revenue or budget. You also may have noticed that many of these fields were contained text. Additionally you may have seen that release_date and release_year have some correlation to revenue and budget however if we were to train on these we would over fit and limit our accuracy with predicting the profitability of movies that have not yet been released.    

In a longer lab we could use some Azure ML's text processing tools to extract sentiment or other key features from text and would use the release_year as a foreign key to get more information from other existing datasets. For now though let’s just remove the following columns from our dataset.

* Expand the Data Transformation and Manipulation tabs and drag a Project Columns Module into our experiment.
* Connect the CuratedMovieData Module to the Project Columns Module.
* Select the Project Columns Module and Click the "Launch Column Selector" button.
* In the three combo boxes that appear select Begin with All Columns, Exclude and Column Names.
* In the TextBox enter the following values:
  * id, imdb_id, release_date, tagline, original_title, overview, title, release_year , runtime, production_companies
* Click the check button, run the experiment and visualize the results of the projection.

![alt tag](media/3%20Data%20Normalization%20and%20Feature%20Engineering/1%20Get%20Rid%20of%20Noisy%20Columns.jpg)

***Step 2: Clean Missing Data***

When you visualized the last transformation you probably saw that many of the movies are missing revenue and budget data. This is due to the limitations of TMDb. Luckily we know because we curated our dataset that an overwhelming amount of the missing data belongs to movies that were not successful. To account for this we will use a clean missing data module to replace missing data in these columns with the number 0 so that profit will be calculated as false. 

Note: Replacing empty values with teh number 0 is not the best technique, but for the purposes of this lab it is a quick heuristic that will provide us with better end results than we would get if we did not clean missing values.

* Expand the Data Transformation and Manipulation tabs then drag a 'Clean Missing Data' Module into the experiment.
* Connect the Project Columns Module to the Clean Missing Data Module.
* Select the Clean Missing Data Module, and Enter 0 in the 'Replacement Value' Field.
* Click the "Launch Column Selector" button.
* In the three combo boxes that appear select Begin with No Columns, Include, and Column Names.
* In the TextBox enter the following values:
  * revenue, budget
* Click the check button, run the experiment and visualize the results of the module.

![alt tag](media/3%20Data%20Normalization%20and%20Feature%20Engineering/2%20Clean%20Missing%20Revenue%20and%20Budget%20Data.jpg)

***Step 3: Add python script to calculate profit and determine if a movie is in a Franchise***

Now that we have normalized our data it is time to do some feature engineering. Lets use the following python script to calculate whether a movie is in a franchise and whether is has made a profit.

* Expand the Python Module tab and drag an Execute Python Experiment Module into the experiment.
* Connect the Clean Missing Data Module to the Execute Python Experiment Module as shown in the picture below.
* Copy the following code into the module
  ```python
      # This script calculates whether a  movie is profitable and is in a collection
      def azureml_main(dataframe1 = None, dataframe2 = None):
        # Generate new column profit 
        dataframe1['profit']= dataframe1['revenue'] 
        #Loop through values
        for i in range (len(dataframe1["revenue"])):
          #Check if in collection is filled and convert to bool
          try:
              if len(dataframe1['belongs_to_collection'][i])>0:dataframe1['belongs_to_collection'][i] = True
              else:dataframe1['belongs_to_collection'][i] = False
          except:
              dataframe1['belongs_to_collection'][i]= False
             
          try:
              # Calculate profit using the formulat TWG/2 - PB and store bool 
              profit = (dataframe1["revenue"][i]/2) -dataframe1["budget"][i]
              if profit >0:dataframe1['profit'][i]=True
              else:dataframe1['profit'][i]=False
          except:
              #If there is an error profitablity cannot be calcuated store none                
              dataframe1["profit"][i]=None
              
        # Return value must be of a sequence of pandas.DataFrame
        return [dataframe1]
  ```
* Run the experiment and visualize the results of the module.

![alt tag](media/3%20Data%20Normalization%20and%20Feature%20Engineering/3%20Python%20Script%20to%20Calculate%20Profit%20and%20Determine%20if%20in%20Collection.jpg)

***Step 4: Remove Revenue to Prevent Overfitting***

Now that we have calculated profitability in our training set, the revenue column will cause the model to over fit. Let’s project this column out of our dataset. Use what you learned in Step #1 combined with the image below to get rid of the revenue data, then run the experiment and visualize the results of the new projection module.

![alt tag](media/3%20Data%20Normalization%20and%20Feature%20Engineering/4%20Remove%20Revenue.jpg)

***Step 5: Process Categorical Features***

* In the visualize data mode from the last projection module select the genre column and compare it to the new profit column. 

![alt tag](media/3%20Data%20Normalization%20and%20Feature%20Engineering/5%20Make%20Categorical%20P1.jpg)

You should notice that profit is being measured on a scale from 0 to 1 even though it should be a binary feature. This is because some of our categorical fields are being treated as strings and numbers lets fix that.
* Expand the Data Transformation and Manipulation tabs and drag a 'Metadata Editor' Module into the experiment.
* Connect the 'Metadata Editor' Module to the last Project Columns Module 
* Select the 'Metadata Editor' and click the "Launch Column Selector" button
* In the three combo boxes that appear select Begin with No Columns, Include, and Column Names
* In the TextBox enter the following values:
  * genere, production_companies, original_language, release_month, lead_star, screen_writer, director, producer and profit
* Select the 'Metadata Editor' again and set the categorical combo box to 'Make Categorical'.
* Click the check button, run the experiment and visualize the results of the module.
 
![alt tag](media/3%20Data%20Normalization%20and%20Feature%20Engineering/6%20Make%20Categorical%20P2.jpg)

* In the visualize data mode from the last projection module select the genre Column and Compare it to the new profit column.

![alt tag](media/3%20Data%20Normalization%20and%20Feature%20Engineering/7%20Make%20Categorical%20P3.jpg)

You should now be able to better gauge the relationship between the different fields and profit. It is time to begin selecting and training our model.

##6. Classifier Selection & Training##
***Step 1: Test/Train Split***
* Expand the Data Transformation and 'Sample and Split' tabs then drag a 'Split' Module into the experiment
* Connect the Split Module to the Metadata Editor Module
* Select the Split Module, and Enter "**0.7**" in the 'Fraction of rows in the first dataset' Field 
* The left side of the split is our training set the right side will be our test/validation split

![alt%20tag](media/4%20Classifer%20Selection%20and%20Training/1%20Test%20Train%20Split.jpg)

***Step 2: Test/Validation Split***
* Expand the Data Transformation and 'Sample and Split' tabs then drag a 'Split' Module into the experiment.
* Connect the Split Module to the Test/Train Module.
* Select the Split Module, and Enter "**0.33**" in the 'Fraction of rows in the first dataset' field. 
* The left side of the split is the validation set the right side is the testing set for parameter sweep.

![alt%20tag](media/4%20Classifer%20Selection%20and%20Training/2%20Test%20Validation%20Split.jpg)

***Step 3: Model Selection and the Decision Jungle***
For this model we are going to use a Decision Jungle Classifier which tend to perform very well on categorical datasets like ours. Decision Jungles are the descendant of two earlier  ML classification algorithms, the decision tree and the random forest.

Decision trees are like flow charts for our feature set. Based on the features in a our training set  a decision tree algorithm will build a flow chart to determine exactly which category a document belongs. The catch is that decision trees by themselves over fit a dataset. In the old days the way around this was to build a decision tree based on a given training set and then trim branches from the tree until it was generalized. However this manual process was time consuming and also had to be redone every time new data was introduced into the training set. 

In 2001 Leo Breiman a statistician at U.C Berkeley came up with the Random Forest Classification algorithm. A random forest works by building large numbers of small decision trees from a random subset of our training feature set. The idea is that some of these trees will over fit our model and some will under fit it, but when we average the classification results from all the trees our model will be representative. 

More recently Microsoft research invented the [Decision Jungle Classification Algorthim](http://research.microsoft.com/pubs/205439/DecisionJunglesNIPS2013.pdf). Decision Jungles are like Random forests but instead of trees use more efficient and generalizable [Directed Acyclic Graphs](https://en.wikipedia.org/wiki/Directed_acyclic_graph) for their decision structure. 

* Expand the Machine Learning, Initialize Model and Classification tabs.
* Drag the Two-Class Decision Jungle into the experiment


![alt%20tag](media/4%20Classifer%20Selection%20and%20Training/3%20Random%20Jungle.jpg)

***Step 4: Training with Parameter Sweep***

Now that we have selected our model lets train it using parameter sweep.

* Expand the Machine Learning and Train tabs.
* Drag the 'Sweep Parameters' module into the experiment.
* Connect the Decision Jungle, Training Set and Validation Set to the 'Sweep Parameters' module.
* Select the 'Sweep Parameters' module. 
* Select the 'Sweep Parameters' module and select 'Entire Grid' from the sweeping mode combo box.
* Click the "Launch Column Selector" button.
* In the three combo boxes that appear, select Begin with No Columns, Include, and Column Names.
* In the text field add the Profit feature, this is the feature we are trying to predict.
* Run the experiment.

![alt%20tag](media/4%20Classifer%20Selection%20and%20Training/4%20train%20with%20parameter%20sweep.jpg)

Congratulations you have built your first machine learning model! Now let’s see how it well it performs.
 
##7. Benchmarking##
***Step 1: Score Model***

In order to evaluate our model the first thing we must do is score it.

* Expand the Machine Learning and Score tabs.
* Drag the 'Score Module' Module into the experiment.
* Connect the trained model from the 'Sweep Parameters' module and the Testing Set from our Test/Validation Split to the Score Module 

![alt%20tag](media/5%20Benchmarking/1.%20Score%20Model%20p1.jpg)

* Run the experiment and visualize the Score results
* Each row contains a Scored Label and a Scored Probability that tells you how confident the model was of its decision
* Compare the Scored Labels column to the Profit Column to gauge the accuracy of the model

![alt%20tag](media/5%20Benchmarking/2.%20Score%20Model%20p2.jpg)

Note as discussed in the ML 101 section, accuracy can be misleading in order to truly gauge our model perfomance we need to use the Evaluate Model Module

***Step 2: Evaluate Model***

* Expand the Machine Learning  and Evaluate tabs.
* Drag the 'Evaluate Model' Module into the experiment.
* Connect the scored data to left side of the Evaluate Model Module
![alt%20tag](media/5%20Benchmarking/3.%20Evaluate%20Results%20P1.jpg)

* Run the experiment and visualize the Evaluate Model results
* The key things to look at to gauge performance is Accuracy, the RoC Curve and the F1-Score results for more information see the Benchmarking Section of ML 101 at the top of the lab.
* Note: Results will vary from run to run, because the splits are random,. This is a good thing though as it prevents overfitting.  

![alt%20tag](media/5%20Benchmarking/4.%20Evaluate%20Results%20P2.jpg)

***Challenge how can you make this model better?***
Here are some tips
 * Look for API's with more and cleaner data (IMDb for example)
 * Generate a larger representative dataset from TMDb so that there are more data points
 * Combine Studio Branches together for the big companies like Paramount, Disney and Fox.
 * Add more features using inference techniques and the text analytics tools.
 * Try multiple models and ensemble their Scored Probabilities together

Now that we have a model let’s turn it to a web service and learn how to consume it in python, javascript and C#

##8. Publishing & Consuming##
***Step 1: Convert Training Model into Production Model***

* At the bottom right hand corner of the screen click the "Set Up as a Web Service Button"
* Select Predictive Web Service

![alt%20tag](media/7%20Publishing%20and%20Consuming/1.%20Convert%20Into%20Predictive%20Web%20Service%20P1.jpg)

A new predictive experiment will be generated this is your production experiment
* Follow the six steps in the tutorial that pops up in ML Studio.

![alt%20tag](media/7%20Publishing%20and%20Consuming/2.%20Convert%20Into%20Predictive%20Web%20Service%20P2.jpg)

***Step 2: Replace Service Input and Run***

Before you run the predictive experiment and deploy the service we need to make sure our web service input accounts for all the feature engineering we've done.
 
* Delete the generated web service input. 
* Replace the service following the instructions in the screenshot below.
* Run the predictive experiment.

![alt%20tag](media/7%20Publishing%20and%20Consuming/3.%20Repace%20Service%20Input%20and%20Build.jpg)

***Step 3: Click the Deploy Web Service Button***

![alt%20tag](media/7%20Publishing%20and%20Consuming/4.%20Deploy%20the%20Service.jpg)


***Step 4: Test the Service***

Congratulations you have now deployed your first predictive machine learning model. Now that we've published our model lets test it out.

* Click the blue 'Test Button'

![alt%20tag](media/7%20Publishing%20and%20Consuming/5.%20Test%20the%20Service%20Part%201.jpg)

* Enter some test data from a known movie, preferably not in our training set.
* Note you may see a field for the Profit value don't panic this value will not influence the model prediction it is there as a reference option.
* When done click the check mark

![alt%20tag](media/7%20Publishing%20and%20Consuming/6.%20Test%20the%20Service%20Part%202.jpg)

* When the test is done you will see the test result information at the bottom of your the page.
* The last two values are the prediction and the models confidence
*  0 = Money Loser, 1 = Profitable

![alt%20tag](media/7%20Publishing%20and%20Consuming/7.%20Test%20the%20Service%20Part%203.jpg)

***Step 5: Consume the Service***

* To consume the service in python click either the "Request/Response" or "Batch Execution" hyperlinks
* Service Documentation will appear scroll towards the bottom of the page until you see the following

![alt%20tag](media/7%20Publishing%20and%20Consuming/8.%20Consume%20the%20Service%20in%20python.jpg)

* Copy and paste the sample code into your Python, C# or JavaScript project 
* Replace the Service Api Key with the key that appears on the service endpoint page
* Run the script and enjoy!

## Conclusion & Next Steps ##

Once again congratulations! By completing this lab you have built and consumed your first Azure ML model. You can now add movie profit prediction to your apps. Additionally you have learned about and interacted with each of the six steps of the Machine Learning process. 

***Resources to learn more about Azure ML:***

* [MVA Getting Started with Microsoft Azure Machine Learning](https://www.microsoftvirtualacademy.com/en-us/training-courses/getting-started-with-microsoft-azure-machine-learning-8425)
*	[Azure Machine Learning (FAQ) Types](https://azure.microsoft.com/en-us/documentation/articles/machine-learning-faq/)
* [Blog: TechNet Machine Learning Blog](http://blogs.technet.com/b/machinelearning/)
* [Module Descriptions: Machine Learning Module Descriptions] (https://msdn.microsoft.com/en-us/library/azure/dn906013.aspx)




```
**ABOUT THE Author**

Ari Bornstein is a Microsoft Developer Evangelist out of NYC. He works with ISVs to develop Consumer Cloud and Client Solutions. Ari is passionate about many things ranging from computer science to desert archeology. Prior to working at Microsoft, Ari worked with the Inova Hospital System in Fairfax VA to build machine learning classifiers that detect references to new treatments in medical literature. Ari has written a series of blog posts on ML Classification on his blog at pythiccoder.com. 

``` 
