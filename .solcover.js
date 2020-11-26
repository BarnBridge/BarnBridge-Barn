// This is already a dependency of solidity-coverage
const shell = require('shelljs')

module.exports = {
    onCompileComplete: async function (_config) {
        await run('typechain')
    },
    // We need to do this because solcover generates bespoke artifacts.
    onIstanbulComplete: async function (_config) {
        shell.rm('-rf', './artifacts') // Or your config.paths.artifacts path
    },
    skipFiles: [
        'mocks',
    ],
}
