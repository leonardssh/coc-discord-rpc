const { resolve } = require('path');
const download = require('download');

const DOWNLOAD_URL = 'https://raw.githubusercontent.com/neoclide/coc.nvim/master/typings/index.d.ts';
const DOWNLOAD_DESTINATION = './node_modules/coc.nvim';

async function handleDownload() {
	return new Promise(async (resolve) => {
		await download(DOWNLOAD_URL, DOWNLOAD_DESTINATION).catch((err) => {
			throw err;
		});

		resolve();
	});
}

handleDownload().catch(console.error);
