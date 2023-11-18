let nameInput = document.getElementById('input-name');

document.getElementById('button-create').addEventListener('click', async() =>
{
    let response = await fetch(`http://${window.location.host}/create-room?name=${nameInput.value}`);
    let room_id = await response.text();
    await Swal.fire(
    {
        title: 'This is your room code',
        text: room_id,
        icon: 'success',
        confirmButtonText: 'OK'
    });
    window.location = `/room?id=${room_id}`;
});

document.getElementById('button-back').addEventListener('click', () =>
{
    window.location = '/';
});