const { RateLimiterMemory } = require('rate-limiter-flexible');

// Create a rate limiter for each user per post
const rateLimiter = new RateLimiterMemory({
    points: 1, 
    duration: 200, // Time window in seconds (1 minute)
});

const rateLimiterMiddleware = (req, res, next) => {
    const userId = req.user.id; // Get the user's ID (assuming req.user is populated)
    const postId = req.params.id; // Post ID from the route parameters

    // The key will be a combination of the userId and postId
    const rateLimiterKey = `${userId}_${postId}`;

    rateLimiter.consume(rateLimiterKey)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).json({
                message: 'You have exceeded the comment limit for this post. Please wait a minute.'
            });
        });
};

module.exports = rateLimiterMiddleware;