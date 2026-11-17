
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userService = require('../user/user.service');
const LogoutList = require('./logoutList.model');
const RefreshToken = require('./refreshToken.model');

const publicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
});

const generateTokenPair = async (user) => {
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
    };

    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        {
            id: user.id,
            jti: crypto.randomUUID()
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    const decoded = jwt.decode(refreshToken);

    await RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(decoded.exp * 1000)
    });

    return {
        accessToken,
        refreshToken,
        user: publicUser(user)
    };
};

const authService = {
    login: async (email, password) => {
        const user = await userService.findByEmail(email);

        if (!user || user.active === false) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        return await generateTokenPair(user);
    },

    refresh: async (token) => {
        if (!token) {
            throw new Error('Refresh token is required');
        }

        const storedToken = await RefreshToken.findOne({
            where: { token }
        });

        if (!storedToken) {
            throw new Error('Invalid refresh token');
        }

        if (storedToken.revoked) {
            await RefreshToken.update(
                { revoked: true },
                { where: { userId: storedToken.userId } }
            );

            throw new Error(
                'Refresh token reuse detected. All sessions revoked.'
            );
        }

        let decoded;

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_REFRESH_SECRET
            );
        } catch (error) {
            storedToken.revoked = true;
            await storedToken.save();

            throw new Error('Invalid or expired refresh token');
        }

        if (decoded.id !== storedToken.userId) {
            throw new Error('Invalid refresh token');
        }

        if (
            new Date(storedToken.expiresAt).getTime() <= Date.now()
        ) {
            storedToken.revoked = true;
            await storedToken.save();

            throw new Error('Refresh token expired');
        }

        const user = await userService.findById(storedToken.userId);

        if (!user || user.active === false) {
            await RefreshToken.update(
                { revoked: true },
                { where: { userId: storedToken.userId } }
            );

            throw new Error('User inactive or not found');
        }

        storedToken.revoked = true;
        await storedToken.save();

        return await generateTokenPair(user);
    },

    logout: async (refreshToken, accessToken) => {
        if (refreshToken) {
            await RefreshToken.update(
                { revoked: true },
                { where: { token: refreshToken } }
            );
        }

        if (accessToken) {
            const alreadyRevoked = await LogoutList.findOne({
                where: { token: accessToken }
            });

            if (!alreadyRevoked) {
                await LogoutList.create({
                    token: accessToken
                });
            }
        }
    },

    verifyToken: async (token) => {
        try {
            const isBlacklisted = await LogoutList.findOne({
                where: { token }
            });

            if (isBlacklisted) {
                throw new Error('Token revoked');
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const user = await userService.findById(decoded.id);

            if (!user || user.active === false) {
                throw new Error('User inactive or not found');
            }

            return decoded;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
};

module.exports = authService;
