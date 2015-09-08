#
# This product uses the TMDb API but is not endorsed or certified by TMDb.
#
import tmdbsimple as tmdb
import csv,time,unicodedata

#headers
tmdb.API_KEY = ''
HighLowNum = 2000
firstPass = True

#Basic Api Key Check
if (tmdb.API_KEY==''):raise Exception ('Missing API Key:',"Enter Tmdb API Key on Line 5")


#Helper Methods
def findCrewMember(crew,role):
    try:
      for crewMem in crew:   
          if toAscii(crewMem['job'])==role:
                return crewMem['name']
    except:
        return ''     

def toAscii(someStr):
    try: result = unicodedata.normalize('NFKD', someStr).encode('ascii','ignore').replace(',',' ')
    except: 
        if (someStr == 0): return ""
        result =someStr
    return result

#instance varibles
topTwoThousand =[]
lowTwoThousand =[]

print "Grabbing the HighLowNum Highest and Lowest Grossing Movies from TMDb"

for pIndex in range (1,int(HighLowNum/5)+1): #there are about 20 results to a page

    if (len(topTwoThousand)>HighLowNum) & (len(lowTwoThousand)>HighLowNum):break
    try:
        discoverT = tmdb.Discover()
        responseT = discoverT.movie(sort_by='revenue.desc',include_adult=False, page =pIndex)

        discoverL = tmdb.Discover()
        responseL = discoverT.movie(sort_by='revenue.asc',include_adult=False, page =pIndex)
    except:
        time.sleep(10) #TMBb only allows 40 calls every 10 seconds

        discoverT = tmdb.Discover()
        responseT = discoverT.movie(sort_by='revenue.desc',include_adult=False, page =pIndex)

        discoverL = tmdb.Discover()
        responseL = discoverT.movie(sort_by='revenue.asc',include_adult=False, page =pIndex)
    
    print "Page " + str(pIndex)

    if (len(topTwoThousand)<HighLowNum):topTwoThousand = topTwoThousand + responseT['results'] 
    if (len(lowTwoThousand)<HighLowNum):lowTwoThousand = lowTwoThousand + responseL['results']


MovieList =topTwoThousand[:HighLowNum]+lowTwoThousand[:HighLowNum]

#open file to write to
output = csv.writer(open('CuratedMovieData.csv', 'wb'))

print "populating full movie and credit data a write to curated.csv"
for m in MovieList:

    #Get Full Movie and Credit Data
    try:movie =tmdb.Movies(m['id'])
    except: 
        time.sleep(10)#TMBb only allows 40 calls every 10 seconds
        movie =tmdb.Movies(m['id'])
           
    credits= movie # clone movie for credits

    #if movie or credit data is corrupted skip movie
    try:
        movie =movie.info()
        credits = credits.credits()
    except:
        print str(m['id'])+' skipped'
        continue
    
    #Clean Values
    try:movie['production_countries']=movie['production_countries'][0]['iso_3166_1']
    except:movie['production_countries']=''

    try:movie['genres'] = movie['genres'][0]['name']
    except: movie['genres']=''

    try:movie['production_companies'] = movie['production_companies'][0]['name']
    except:movie['production_companies'] =''

    try:
        movie['release_month']= time.strftime('%m',time.strptime(toAscii(movie['release_date']).encode('ascii','ignore'), "%Y-%m-%d"))
        movie['release_year']= time.strftime('%Y',time.strptime(toAscii(movie['release_date']).encode('ascii','ignore'), "%Y-%m-%d"))
    except:
        movie['release_month']= ''
        movie['release_year']= ''

    movie['director']= findCrewMember(credits['crew'],'Director')
    movie['producer'] =findCrewMember(credits['crew'],'Producer')
    movie['screen_writer']=findCrewMember(credits['crew'],'Screenplay')

    try:movie['lead_star']=credits['cast'][0]['name']
    except:movie['lead_star']=''

    #Remove Unessesary Columns
    del movie['poster_path']
    del movie['homepage']
    del movie['adult']
    del movie['backdrop_path']
    del movie['popularity']
    del movie['vote_average'] 
    del movie['vote_count']

    #write keys on first pass
    if firstPass:
        output.writerow(movie.keys())
        firstPass = False

    #convert Value strings to ascii
    values= [toAscii(movie) for movie in  movie.values()] 

    #write values
    output.writerow(values)

    print 'Wrote Movie Id:' +  str(m['id'])

