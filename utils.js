module.exports = {
    handleResponse: (res, data) => {
        res.writeHead(...data.writeHead);
        res.end(data.end);
    },
    getRequestURI: (req) => {
        return `${req.connection.encrypted ? 'https' : 'http'}://${req.headers.host}${req.url}`;
    }
}