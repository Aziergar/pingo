socket.on('message', data =>
{
    document.querySelector('#chat-log').value += (data.name + ': ' + data.message + '\n');
});

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    if(message.length > 0) socket.emit('message', { room_id : room_id, user_id: user_id, message: message });
    messageInputDom.value = '';
};

// chatSocket.onopen = function(e){
//     chatSocket.send(
//         JSON.stringify({
//             type: "joined",
//             username: username,
//             status: status,
//         })
//     );
// };

// function ChangeStatus(selectObject) {
//     var value = selectObject.value;
//     chatSocket.send(JSON.stringify({
//         type: "change_status",
//         username: selectObject.getAttribute("id"),
//         status: value,
//     }));
// }

// chatSocket.onmessage = function(e) {
//     const data = JSON.parse(e.data);
//     const type = data.type;
//     if (type == "chat_message"){
//         document.querySelector('#chat-log').value += (data.username + ': ' + data.message + '\n');
//     }
//     if (type == "joined"){
//         var username2 = data.username;
//         document.querySelector('#chat-log').value += (username2 + ' ' + data.message + '\n');
//         picture = data.canvas;

//         var div = document.querySelector('#roommates');
//         let list = document.querySelector('#list_roommates');
//         if (username2 == username){
//         }
//         else{
//             if (document.getElementById("li_"+username2)){

//             }
//             else {
//                 if (status == "Creator"){
//                     let select = document.createElement('select');
//                     select.id = username2;
//                     select.setAttribute("onchange", "ChangeStatus(this)");
//                     select.style.marginLeft = '6px';

//                     let option_editor = document.createElement('option');
//                     let option_witness = document.createElement('option');
//                     option_editor.value = 'Editor';
//                     option_editor.innerHTML = 'Editor';
//                     option_witness.value = 'Witness';
//                     option_witness.innerHTML = 'Witness';
//                     select.appendChild(option_editor);
//                     select.appendChild(option_witness);

//                     let newDiv = document.createElement('li');
//                     newDiv.id = 'li_' + username2;
//                     let newDivText = document.createElement('span');
//                     newDivText.textContent = username2;
//                     let deleteButton = document.createElement('button');
//                     deleteButton.textContent = 'X';
//                     deleteButton.style.BackgroundColor = 'white';
//                     deleteButton.style.color = 'red';
//                     deleteButton.style.marginLeft='6px';
//                     deleteButton.id = 'delete_'+username2;
//                     newDiv.appendChild(newDivText);
//                     newDiv.appendChild(select);
//                     newDiv.appendChild(deleteButton);

//                     list.appendChild(newDiv);
//                 }
//                 else {
//                     let newDiv = document.createElement('li');
//                     let DivStatus =  document.createElement('span');
//                     DivStatus.id = ''+username2 +'_status';
//                     newDiv.id = 'li_' + username2;
//                     let newDivText = document.createElement('span');
//                     newDivText.textContent = username2 +': ';
//                     DivStatus.textContent = 'Editor';
//                     newDiv.appendChild(newDivText);
//                     newDiv.appendChild(DivStatus);

//                     list.appendChild(newDiv);
//                 }
//             }
//         }
//     }
//     if (type == "edit_canvas"){
//         drawData.push(data.data);
//     }

//     if (type == "close"){
//         document.querySelector('#chat-log').value += ( data.message + '\n');
//     }
//     if (type == "exit"){
//         document.querySelector('#chat-log').value += ( data.message + '\n');
//         if (data.username == username){window.location.pathname = '/';}
//     }
//     if (type == "creator_close"){
//         alert('Creator left, the room does no longer exists ;(');
//         window.location.pathname = '/';
//     }
//     if (type == "change_status"){
//         if (status != 'Creator'){
//             id = data.username + '_status';
//             console.log(id);
//             if (data.username == username){
//                 document.querySelector('#my_status').textContent = data.status;
//             }
//             else{
//                 console.log(document.getElementById(id));
//                 document.getElementById(id).textContent = data.status;
//             }
//         }
//     }
// };


// chatSocket.onclose = function(e) {
//     console.error('Chat socket closed unexpectedly');
// };

// document.querySelector('#chat-message-input').focus();
// document.querySelector('#chat-message-input').onkeyup = function(e) {
//     if (e.keyCode === 13) {
//         document.querySelector('#chat-message-submit').click();
//     }
// };


// document.querySelector('#chat-message-submit').onclick = function(e) {
//     const messageInputDom = document.querySelector('#chat-message-input');
//     const message = messageInputDom.value;
//     chatSocket.send(JSON.stringify({
//         type: "chat",
//         message: message,
//         username:username,
//     }));
//     messageInputDom.value = '';
// };