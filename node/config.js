export default {
  MINER: {
    GOOGLE_MAPS_REVIEWS: {
      // Miner review count - how many reviews miners should fetch
      REVIEW_COUNT: 100,

      // Apify actor names
      APIFY_ACTORS: {
        GOOGLE_MAPS_REVIEWS: 'agents/google-maps-reviews'
      },
    },

    X_TWEETS: {
      // Miner tweet count - how many tweets miners should fetch (from env var)
      // This is set via TWEET_LIMIT environment variable
      // Default value if not set
      DEFAULT_TWEET_LIMIT: 100,

      // Apify actor names
      APIFY_ACTORS: {
        X_TWEETS: 'kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest'
      },

      // Default query parameters
      DEFAULT_PARAMS: {
        lang: 'en',
        queryType: 'Latest'
      }
    }
  },
};
