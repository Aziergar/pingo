let thicknessSlider;
let thicknessText;
let transparencySlider;
let transparencyText;
let palette;
let mouseOverControl = false;

function setup()
{
    thicknessSlider = document.getElementById('ThicknessSlider');
    thicknessText = document.getElementById('ThicknessText');
    transparencySlider = document.getElementById('TransparencySlider');
    transparencyText = document.getElementById('TransparencyText');
    palette = document.getElementById('Palette');
    transparencySlider.max = 255;
    transparencySlider.min = 0;
    transparencySlider.step = 1;

    document.getElementsByClassName('control').forEach(control =>
    {
       control.addEventListener('mouseenter', () => mouseOverControl = true);
       control.addEventListener('mouseleave', () => mouseOverControl = false);
    });

    canvas.setup("Content", 800, 600);
    Array.from(document.getElementsByClassName('Mode')).forEach(button =>
    {
        button.addEventListener('click', () =>
        {
            canvas.setInstrument(button.id);
        });
    });
    document.addEventListener('copy', copyFunction);
    document.addEventListener('paste', pasteFunction);
    document.getElementById("Download").addEventListener('click', () =>
    {
        saveCanvas(canvas.canvas, createFileName(), 'png');
    });
    thicknessSlider.addEventListener('change', () =>
    {
        setThickness(thicknessSlider.value);
    });
    thicknessText.addEventListener('change', () =>
    {
        setThickness(thicknessText.value);
    });
    transparencySlider.addEventListener('change', () =>
    {
        setTransparency(transparencySlider.value);
    });
    transparencyText.addEventListener('change', () =>
    {
        setTransparency(transparencyText.value);
    });
    palette.addEventListener('change', () =>
    {
        setColor(Color.fromHex(palette.getValue()));
    });
}

function draw()
{
    canvas.outerLayer.clear();
    canvas.onlineLayer.clear();
    if (canvas.drawCheck())
    {
        canvas.drawn = true;
        let sendData = canvas.instrument.use();
        socket.emit('edit-canvas', { room_id: room_id, sendData: sendData });
    }
    while(drawData.length > 0)
    {
        let instrument;
        let data = JSON.parse(drawData.shift());
        if(data.username != null)
        {
            instrument = canvas.dataInstruments.find(element => element.name == data.name && element.username == data.username);
            if(!instrument)
            {
                canvas.dataInstruments.push(data.name == 'SelectImage' ? new SelectImage('SelectImage', canvas.onlineLayer)
                                                                       : new Text('Text', canvas.onlineLayer));
                instrument = canvas.dataInstruments[canvas.dataInstruments.length - 1];
                instrument.username = data.username;
            }
        }
        else instrument = canvas.dataInstruments.find(element => element.name == data.name);
        instrument.useData(data);
    }
    canvas.dataInstruments.forEach(instrument =>
    {
        if(instrument.selected)
        {
            instrument.onDraw();
        }
    });
    canvas.instrument.drawEachFrame();
}

function mouseReleased()
{
    canvas.instrument.mouseReleased();
    if(canvas.drawn)
    {
        canvas.drawn = false;
        loadPixels();
    }
}

function mouseDragged(event)
{
    canvas.instrument.mouseDragged(event);
}

function mousePressed()
{
    canvas.instrument.mousePressed();
}

function mouseWheel(event)
{
    if(!keyIsDown(CONTROL)) return;
    canvas.zoomByMouseWheel(event);
    event.preventDefault();
}