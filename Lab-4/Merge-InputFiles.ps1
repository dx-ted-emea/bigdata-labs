$sourceFolder = "C:\Users\kristol\Desktop\movies\"
$targetFolder = "C:\Users\kristol\Desktop\movies\output\" #REMEMBER TO INCLUDE TRAILING BACK SLASH \ IN PATH
$number_of_files_to_distribute_across = 3

$count = 1
$files = Get-ChildItem ($sourceFolder + "*.json")
foreach ($file in $files)
{
    

    $file.Name | Out-Default

    $movie = $file | Get-Content | ConvertFrom-Json

    # ID
    $id = $movie.id

    # TITLE
    if ([string]::IsNullOrWhiteSpace($movie.title))
    { 
        "Ignoring file " + $file.Name + " due to no title" | Out-Default
        continue
    }
    $title = $movie.title

    # YEAR
    if ([string]::IsNullOrWhiteSpace($movie.release_date))
    { 
        "Ignoring file " + $file.Name + " due to no release_date" | Out-Default
        continue
    }
    $year = ($movie.release_date | Get-Date).Year
    

    if ($movie.spoken_languages.Count -eq 0)
    {
        $spoken_languages = "unspecified"
    }
    else
    {
        $spoken_languages_array = @()
        foreach ($language in $movie.spoken_languages)
        {
            $spoken_languages_array += $language.iso_639_1
        }
        $spoken_languages = $spoken_languages_array -join ','
    }

    # VOTE AVERAGE
    $vote_average = $movie.vote_average.ToString([CultureInfo]::InvariantCulture);
    
    # VOTE COUNT
    $vote_count = $movie.vote_count

    # GENRES
    if ($movie.genres.Count -eq 0)
    { 
        "Ignoring file " + $file.Name + " due to no genres" | Out-Default
        continue
    }

    # Flatten structure and duplicate each movie per genre. I.e. a movie can be present several times in the output
    # files if it is tagged with more than one genre

    foreach ($genre in $movie.genres)
    {
        $row = @()
        $row += $id
        $row += $title
        $row += $year
        $row += $genre.name
        $row += $spoken_languages
        $row += $vote_average
        $row += $vote_count

        $outputfilename = "movies" + $count % $number_of_files_to_distribute_across + ".csv"
        $targetFile = $targetFolder + $outputfilename

        $row -join '|' | Out-File $targetFile -Append -Encoding ascii

        $count = $count + 1
    }
}
