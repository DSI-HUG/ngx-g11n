// @ts-check
/** @typedef {import('node:http').IncomingMessage} IncomingMessage  */
/** @typedef {import('node:http').ServerResponse} ServerResponse  */

export default {
    '/api/g11n': {
        target: 'http://localhost:4200',
        /** @type { (req: IncomingMessage, res: ServerResponse) => boolean }  */
        bypass: (req, res) => {
            res.end(JSON.stringify({
                g11n: req.headers['accept-language']
            }));
            return true;
        }
    }
};
