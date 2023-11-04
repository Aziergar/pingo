import { createRequire } from "module";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as f from './functions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const fs = require('fs');
const express = require('express');
let pingo = express();
const mongoose = require('mongoose');

let users = [];
const port = 8080;

await f.tryAgain(async () =>
{
    await mongoose.connect('mongodb://127.0.0.1:27017/db');
}, () => {}, { endless: true, interval: 1000});

const server = require('http').createServer(pingo).listen(port, () => console.log('Server is running'));

const socket = require('socket.io')(server);

pingo.get(/^\/static\/.*(\.html|\.js|\.css|\.png)$/, (request, response) =>
{
    response.sendFile(__dirname + request.url);
});

socket.on('connection', user =>
{
    user.on('connected', data =>
    {
        users.push(user);
        f.sendMessage(users, {name: 'System', message: `${data.name} connected`});
    });
    user.on('message', data =>
    {
        f.sendMessage(users, data);
    });
    user.emit('connection');
});