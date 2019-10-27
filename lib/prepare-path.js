const {platform} = require('os')
const {dirname, join} = require('path')
const {mkdir, unlink} = require('fs').promises

const readPkgUp = require('read-pkg-up')

async function getPath(options) {
	if (options && options.path) {
		return options.path
	}

	const result = await readPkgUp()
	const pkgName = result.package.name

	if (!pkgName) {
		// This is the method to uniquely pair client and server
		// So, it is necessary until another solution comes up.
		throw new Error('default socket path requires package.json name')
	}

	const base = platform() === 'win32' ? '\\\\?\\pipe' : '/tmp'

	return join(base, 'node-socks-ipc', `${pkgName}.sock`)
}

module.exports = async (options, ensure) => {
	const path = await getPath(options)

	if (ensure) {
		await mkdir(dirname(path), {recursive: true})
		try {
			await unlink(path)
		} catch (error) {
			if (error.code !== 'ENOENT') {
				throw error
			}
		}
	}

	return path
}