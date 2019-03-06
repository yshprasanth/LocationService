// /app/common/logger.js

const env = require('../../../conf/env');
var winston = require('winston');


// -----------------------------------------------------------------------------
//     PRIVATE    --------------------------------------------------------------
// -----------------------------------------------------------------------------

const alignedWithColorsAndTime = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info) => {
        const {
            timestamp, level, message, ...args
        } = info;

        const ts = timestamp.slice(0, 19).replace('T', ' ');
        return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
    })
);

const MESSAGE = Symbol.for('message');

const jsonFormatter = (logEntry) => {
    const base = {timestamp: new Date()};
    const json = Object.assign(base, logEntry);
    logEntry[MESSAGE] = JSON.stringify(json);
    return logEntry;
};


// -----------------------------------------------------------------------------
//     PUBLIC    --------------------------- (Update EXPORTS too) --------------
// -----------------------------------------------------------------------------

var logger = winston.createLogger(
    {
        level: 'info',
        handleExceptions: true,
        transports: [
            new winston.transports.File({
                format: winston.format(jsonFormatter)(),
                filename: 'logs/combined.log',
                level: 'info'
            }),
            new winston.transports.File({
                format: winston.format(jsonFormatter)(),
                filename: 'logs/errors.log',
                level: 'warn'
            }),
            new winston.transports.Console({
                format: alignedWithColorsAndTime,
                level: 'debug'
            })
        ],
        exitOnError: false
    }
);

// Stream method to log morgan catched petition info
logger.stream = {
    write: function(message, encoding){
        logger.debug("[TRAFFIC] - " + message);
    }
};

logger.morgan = {
    format: env.env === "DEV" ? 'combined' : 'short', 
    stream: logger.stream,
    immediate: true
};

// -----------------------------------------------------------------------------
//     EXPORTS    --------------------------------------------------------------
// -----------------------------------------------------------------------------

module.exports = logger;

