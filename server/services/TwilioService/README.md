## Rate limiting verification codes
### How does it work?
We use Twilio's Create Verification API to send verification codes to users via SMS or email. We configured a custom
rate limit following these [instructions](https://www.twilio.com/docs/verify/api/programmable-rate-limits), which can be summarized as:
- Create a RateLimit resource and define the key(s) on which to rate limit the request (i.e. phone number)
- Create a RateLimitBucket resource, associated to the RateLimit, which establishes the rate limiting interval and number of allowed retries
- Pass the RateLimit SID to the Create Verification request, keying each request according to how you set up your RateLimit

### How can I view and update the current config?
You can do this with the Twilio CLI, cURL, etc to call the Twilio APIs. Twilio explains it well [here](https://www.twilio.com/docs/verify/api/service-rate-limits).

### Rate limit error codes
Find them [here](https://www.twilio.com/docs/api/errors#6-anchor).
