export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                error: `Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource.` 
            });
        }
        next();
    };
};

