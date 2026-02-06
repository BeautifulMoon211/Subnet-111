import fetch from './index.js';
import logger from '#modules/logger/index.js';
import config from '#config';
import retryable from '#modules/retryable/index.js';
import apify from '#modules/apify/index.js';
import { transformTweets } from '../transform.js';

// Mock dependencies
jest.mock('#modules/logger/index.js', () => ({
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn()
}));

jest.mock('#config');
jest.mock('#modules/retryable/index.js');
jest.mock('#modules/apify/index.js');
jest.mock('../transform.js');

describe('X-Tweets Fetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock config
    config.MINER = {
      X_TWEETS: {
        DEFAULT_TWEET_LIMIT: 100,
        APIFY_ACTORS: {
          X_TWEETS: 'kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest'
        },
        DEFAULT_PARAMS: {
          lang: 'en',
          queryType: 'Latest'
        }
      }
    };

    // Mock environment variables
    process.env.APIFY_TOKEN = 'test-token';
    process.env.TWEET_LIMIT = '10';
  });

  afterEach(() => {
    delete process.env.APIFY_TOKEN;
    delete process.env.TWEET_LIMIT;
  });

  describe('fetch', () => {
    test('should fetch tweets successfully using Apify', async () => {
      const mockRawTweets = [
        {
          id: '123',
          text: 'Test tweet content',
          createdAt: '2024-01-01T00:00:00Z',
          url: 'https://x.com/testuser/status/123',
          author: {
            userName: 'testuser',
            id: '456',
            name: 'Test User',
            followers: 1000,
            following: 500,
            isVerified: true,
            description: 'Test description'
          },
          entities: {
            hashtags: [{ text: 'bitcoin' }]
          }
        }
      ];

      const mockTransformedTweets = [
        {
          tweetId: '123',
          username: 'testuser',
          text: 'Test tweet content',
          createdAt: '2024-01-01T00:00:00Z',
          tweetUrl: 'https://x.com/testuser/status/123',
          hashtags: ['bitcoin'],
          userId: '456',
          displayName: 'Test User',
          followersCount: 1000,
          followingCount: 500,
          verified: true,
          userDescription: 'Test description'
        }
      ];

      apify.runActorAndGetResults.mockResolvedValue(mockRawTweets);
      transformTweets.mockReturnValue(mockTransformedTweets);
      retryable.mockImplementation((fn) => fn());

      const result = await fetch({ keyword: 'bitcoin' });

      expect(apify.runActorAndGetResults).toHaveBeenCalledWith(
        'kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest',
        {
          twitterContent: 'bitcoin',
          lang: 'en',
          url: '',
          maxItems: 10,
          queryType: 'Latest'
        }
      );

      expect(transformTweets).toHaveBeenCalledWith(mockRawTweets);
      expect(result).toEqual(mockTransformedTweets);
    });

    test('should use default tweet limit when env var not set', async () => {
      delete process.env.TWEET_LIMIT;

      const mockRawTweets = [];
      const mockTransformedTweets = [];

      apify.runActorAndGetResults.mockResolvedValue(mockRawTweets);
      transformTweets.mockReturnValue(mockTransformedTweets);
      retryable.mockImplementation((fn) => fn());

      await fetch({ keyword: 'bitcoin' });

      expect(apify.runActorAndGetResults).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          maxItems: 100 // DEFAULT_TWEET_LIMIT
        })
      );
    });

    test('should use custom tweet limit from env var', async () => {
      process.env.TWEET_LIMIT = '50';

      const mockRawTweets = [];
      const mockTransformedTweets = [];

      apify.runActorAndGetResults.mockResolvedValue(mockRawTweets);
      transformTweets.mockReturnValue(mockTransformedTweets);
      retryable.mockImplementation((fn) => fn());

      await fetch({ keyword: 'bitcoin' });

      expect(apify.runActorAndGetResults).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          maxItems: 50
        })
      );
    });

    test('should handle empty response from Apify', async () => {
      const mockRawTweets = [];
      const mockTransformedTweets = [];

      apify.runActorAndGetResults.mockResolvedValue(mockRawTweets);
      transformTweets.mockReturnValue(mockTransformedTweets);
      retryable.mockImplementation((fn) => fn());

      const result = await fetch({ keyword: 'bitcoin' });

      expect(result).toEqual([]);
    });

    test('should use retryable wrapper with 10 retries', async () => {
      const mockRawTweets = [];
      const mockTransformedTweets = [];

      apify.runActorAndGetResults.mockResolvedValue(mockRawTweets);
      transformTweets.mockReturnValue(mockTransformedTweets);
      retryable.mockImplementation((fn) => fn());

      await fetch({ keyword: 'bitcoin' });

      expect(retryable).toHaveBeenCalledWith(expect.any(Function), 10);
    });

    test('should log appropriate messages', async () => {
      const mockRawTweets = [];
      const mockTransformedTweets = [];

      apify.runActorAndGetResults.mockResolvedValue(mockRawTweets);
      transformTweets.mockReturnValue(mockTransformedTweets);
      retryable.mockImplementation((fn) => fn());

      await fetch({ keyword: 'bitcoin' });

      expect(logger.info).toHaveBeenCalledWith(
        '[Miner] Fetching tweets - Keyword: bitcoin, Limit: 10'
      );
      expect(logger.info).toHaveBeenCalledWith(
        '[Miner] Starting Apify actor for tweets fetch...'
      );
    });

    test('should handle Apify errors', async () => {
      apify.runActorAndGetResults.mockRejectedValue(new Error('Apify error'));
      retryable.mockImplementation((fn) => fn());

      await expect(fetch({ keyword: 'bitcoin' }))
        .rejects
        .toThrow('Apify error');
    });

    test('should handle transformation errors', async () => {
      const mockRawTweets = [{ id: '123' }];

      apify.runActorAndGetResults.mockResolvedValue(mockRawTweets);
      transformTweets.mockImplementation(() => {
        throw new Error('Transformation error');
      });
      retryable.mockImplementation((fn) => fn());

      await expect(fetch({ keyword: 'bitcoin' }))
        .rejects
        .toThrow('Transformation error');
    });

    test('should log error messages on failure', async () => {
      apify.runActorAndGetResults.mockRejectedValue(new Error('Test error'));
      retryable.mockImplementation((fn) => fn());

      await expect(fetch({ keyword: 'bitcoin' }))
        .rejects
        .toThrow('Test error');

      expect(logger.error).toHaveBeenCalledWith(
        '[Miner] Error fetching tweets:',
        expect.any(Error)
      );
    });
  });
});
