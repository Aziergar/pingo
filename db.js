import mongoose from 'mongoose';
import * as u from './utilities.js';

const id_length = 6;

export async function connect(uri, interval = 1000)
{
    await u.tryAgain(async () =>
    {
        await mongoose.connect(uri);
    }, () => {}, { endless: true, interval: interval});
}

export const roomSchema = new mongoose.Schema(
{
    _id : String,
    users: [{ _id: String, socket_id: Number, name: String }]
});

export const Room = mongoose.model('Room', roomSchema);

export async function createRoom()
{
    let id = await u.generateUniqueID(id_length, async(id) =>
    {
        return await Room.countDocuments({ _id: id }) != 0;
    });
    let room = new Room({ _id: id });
    room.save();
    return await room;
}

// function getUniqueName(room, name)
// {
    
// }

export async function addUser(room_id, user)
{
    user.name = u.validateName(user.name);

    let room = await Room.findById(room_id);
    user._id = await u.generateUniqueID(id_length, (id) =>
    {
        return room.users.filter(el => el._id == id).length != 0;
    });
    await Room.updateOne({ _id: room_id }, { $push : { users : user } });
    return user;
}

export async function getRoom(room_id)
{
    let room = await Room.findById(room_id);
    return room;
}

export function getUser(room, user_id)
{
    return room.users.filter(user => user._id == user_id)[0];
}

export async function getRoomUser(room_id, user_id)
{
    let room = await getRoom(room_id);
    if(!room) return false;
    let user = await getUser(room, user_id);
    if(!user) return false;
    return { room: room, user: user };
}