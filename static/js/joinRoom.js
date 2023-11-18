let nameInput = document.getElementById('input-name');
let codeInput = document.getElementById('input-code');

function wrongCode()
{
    Swal.fire(
    {
        title: 'Error',
        text: 'Wrong room code',
        icon: 'error',
        confirmButtonText: 'OK'
    });
    codeInput.value = "";
}

document.getElementById('button-join').addEventListener('click', async() =>
{
    if(codeInput.value == "")
    {
        wrongCode();
        return;
    }
    let response = await fetch(`http://${window.location.host}/join-room?id=${codeInput.value}&name=${nameInput.value}`);
    let room_id = await response.text();
    if(response.status == 404)
    {
        wrongCode();
        return;
    }
    window.location = `/room?id=${room_id}`;
});

document.getElementById('button-back').addEventListener('click', () =>
{
    window.location = '/';
});