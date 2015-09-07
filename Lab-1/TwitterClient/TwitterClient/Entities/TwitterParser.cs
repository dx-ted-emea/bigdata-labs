//********************************************************* 
// 
//    Copyright (c) Microsoft. All rights reserved. 
//    This code is licensed under the Microsoft Public License. 
//    THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF 
//    ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY 
//    IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR 
//    PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT. 
// 
//*********************************************************

using Newtonsoft.Json.Linq;
using System;
using System.Globalization;
using System.IO;
using System.Net;
using System.Text;
using System.Web;

namespace TwitterClient
{
    public static class TwitterParser
    {
        public static TwitterPayload ComputeScore(Tweet tweet, string twitterKeywords)
        {

            return new TwitterPayload
            {
                ID = tweet.Id,
                CreatedAt = ParseTwitterDateTime(tweet.CreatedAt),
                UserName = tweet.User != null ? tweet.User.Name : null,
                TimeZone = tweet.User != null ? (tweet.User.TimeZone != null ? tweet.User.TimeZone : "(unknown)") : "(unknown)", 
                ProfileImageUrl = tweet.User != null ? (tweet.User.ProfileImageUrl != null ? tweet.User.ProfileImageUrl : "(unknown)") : "(unknown)",
                Text = tweet.Text,
                Language = tweet.Language != null ? tweet.Language : "(unknown)",
                RawJson = tweet.RawJson,
                Topic = DetermineTopc(tweet.Text, twitterKeywords),
            };
        }

        static DateTime ParseTwitterDateTime(string p)
        {
            if (p == null)
                return DateTime.Now;
            p = p.Replace("+0000 ", "");
            DateTimeOffset result;

            if (DateTimeOffset.TryParseExact(p, "ddd MMM dd HH:mm:ss yyyy", CultureInfo.GetCultureInfo("en-us").DateTimeFormat, DateTimeStyles.AssumeUniversal, out result))
                return result.DateTime;
            else
                return DateTime.Now;
        }

    

        /// <summary>
        /// This is a simple text analysis from the twitter text based on some keywords
        /// </summary>
        /// <param name="tweetText"></param>
        /// <param name="keywordFilters"></param>
        /// <returns></returns>
        static string DetermineTopc(string tweetText, string keywordFilters)
        {
            if (string.IsNullOrEmpty(tweetText))
                return string.Empty;

            string subject = string.Empty;

            //keyPhrases are specified in app.config separated by commas.  Can have no leading or trailing spaces.  Example of key phrases in app.config
            //	<add key="twitter_keywords" value="Microsoft, Office, Surface,Windows Phone,Windows 8,Windows Server,SQL Server,SharePoint,Bing,Skype,XBox,System Center"/><!--comma to spit multiple keywords-->
            string[] keyPhrases = keywordFilters.Split(',');

            foreach (string keyPhrase in keyPhrases)
            {
                subject = keyPhrase;
                if (tweetText.ToLower().Contains(keyPhrase))
                {
                    return subject;
                }
            }

            return "Unknown";
        }
    }
}
