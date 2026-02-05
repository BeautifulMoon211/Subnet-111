/**
 * Transform Apify tweet data to Subnet-111 format
 * 
 * This module handles the transformation of raw Apify tweet data
 * into the standardized Subnet-111 format with all required fields.
 * 
 * @module utils/miner/types/x-tweets/transform
 */

/**
 * Transform a single tweet from Apify format to Subnet-111 format
 * 
 * @param {Object} apifyTweet - Raw tweet data from Apify actor
 * @returns {Object} Tweet in Subnet-111 format with all 12 required fields
 * 
 * @description
 * Subnet-111 format requires these 12 fields:
 * - tweetId: Unique tweet identifier
 * - username: Twitter handle (without @)
 * - text: Tweet content
 * - createdAt: ISO timestamp
 * - tweetUrl: Full URL to the tweet
 * - hashtags: Array of hashtag strings
 * - userId: User's unique identifier
 * - displayName: User's display name
 * - followersCount: Number of followers
 * - followingCount: Number of accounts following
 * - verified: Boolean verification status
 * - userDescription: User's bio/description
 */
export function transformTweetToSubnet111Format(apifyTweet) {
  return {
    tweetId: apifyTweet.id || String(Date.now()),
    username: apifyTweet.author?.userName || "unknown",
    text: apifyTweet.text || "",
    createdAt: apifyTweet.createdAt || new Date().toISOString(),
    tweetUrl: apifyTweet.url || `https://twitter.com/${apifyTweet.author?.userName || 'unknown'}/status/${apifyTweet.id || ''}`,
    hashtags: apifyTweet.entities?.hashtags?.map(h => h.text) || [],
    userId: apifyTweet.author?.id || "unknown",
    displayName: apifyTweet.author?.name || "Unknown User",
    followersCount: apifyTweet.author?.followers || 0,
    followingCount: apifyTweet.author?.following || 0,
    verified: apifyTweet.author?.isVerified || false,
    userDescription: apifyTweet.author?.profile_bio?.description || apifyTweet.author?.description || ""
  };
}

/**
 * Transform an array of tweets from Apify format to Subnet-111 format
 * 
 * @param {Array} apifyTweets - Array of raw tweet data from Apify
 * @returns {Array} Array of tweets in Subnet-111 format
 */
export function transformTweets(apifyTweets) {
  if (!Array.isArray(apifyTweets)) {
    return [];
  }
  
  return apifyTweets.map(tweet => transformTweetToSubnet111Format(tweet));
}

export default {
  transformTweetToSubnet111Format,
  transformTweets
};

