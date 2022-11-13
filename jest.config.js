/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    preset: 'ts-jest',
    setupFilesAfterEnv: ['./testSetup.js'],
    testEnvironment: 'node',
};
