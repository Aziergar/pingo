import { createRequire } from "module";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as u from './utilities.js';
import * as db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const fs = require('fs');
const express = require('express');
let pingo = express();
const mongoose = require('mongoose');
const cookie_parser = require('cookie-parser');

let rooms = new Map();
const port = 8080;

await db.connect('mongodb://127.0.0.1:27017/pingo');

const server = require('http').createServer(pingo).listen(port, () => console.log('Server is running'));

const socket = require('socket.io')(server);

pingo.use(cookie_parser(u.createID(20)));

pingo.get('/create-room', async (request, response) =>
{
    let room = await db.createRoom();
    let user = await db.addUser(room._id, { name : request.query.name });
    response.cookie('user_id', user._id);
    response.send(room._id);
});

pingo.get('/join-room', async (request, response) =>
{
    let room_id = request.query.id;
    let room = await db.getRoom(room_id);
    if(!room)
    {
        response.sendStatus(404);
        return;
    }
    let user = await db.addUser(room._id, { name : request.query.name });
    response.cookie('user_id', user._id);
    response.send(room._id);
});

pingo.get('/room', async(request, response, next) =>
{
    let room_id = request.query.id;
    let room = await db.getRoom(room_id);
    if(!room)
    {
        response.sendStatus(404);
        return;
    }
    let user = db.getUser(room, request.cookies.user_id);
    if(!user)
    {
        user = await db.addUser(room_id, {});
    }
    response.cookie('user_id', user._id);
    response.cookie('user_name', user.name);
    response.cookie('room_id', room._id);
    next();
});

pingo.use('/', (request, response, next) =>
{
    request.url = u.urlToFile.replace(request.url);
    next();
});

pingo.use(express.static('static/html'));
pingo.use(express.static('static/js'));
pingo.use(express.static('static/css'));
pingo.use(express.static('static/img'));

socket.on('connection', user =>
{
    user.emit('connected');
    user.on('join-room', async data =>
    {
        let roomUser = await db.getRoomUser(data.room_id, data.user_id);
        if(!roomUser) return;
        user.join(data.room_id);
        socket.to(data.room_id).emit('message', { type: 'system-message', name: 'System', message: `${roomUser.user.name} connected`});
    });
    user.on('message', async data =>
    {
        let roomUser = await db.getRoomUser(data.room_id, data.user_id);
        if(!roomUser) return;
        socket.in(data.room_id).emit('message', { type: 'user-message', name: roomUser.user.name, message: data.message });
    });
    user.on('edit-canvas', data =>
    {
        user.to(data.room_id).emit('edit-canvas', { data: data.sendData });
    });
});