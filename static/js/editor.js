let thicknessSlider;
let thicknessText;
let transparencySlider;
let transparencyText;
let palette;
let mousePressedOverControl = false;
let mouseOverControl = false;
let mouseIsReleased = false;

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
    document.getElementById("Download").addEventListener('click', saveFile);
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
    canvas.beforeDraw();
    canvas.outerLayer.clear();
    canvas.onlineLayer.clear();
    if (canvas.drawCheck())
    {
        canvas.drawn = true;
        let sendData = canvas.instrument.use();
        socket.emit('edit-canvas', { room_id: room_id, sendData: sendData });
    }
    mouseIsReleased = false;
    while(drawData.length > 0)
    {
        let instrument;
        let data = JSON.parse(drawData.shift());
        if(data.username != null)
        {
            instrument = canvas.dataInstruments.find(element => element.name == data.name && element.username == data.username);
            if(!instrument)
            {
                switch(data.name)
                {
                    case 'SelectImage':
                        instrument = new SelectImage('SelectImage', canvas.onlineLayer);
                        break;
                    case 'Text':
                        instrument = new Text('Text', canvas.onlineLayer);
                        break;
                    case 'Line':
                        instrument = new Line('Line', canvas.onlineLayer);
                        break;
                    case 'Rect':
                        instrument = new Rect('Rect', canvas.onlineLayer);
                        break;
                    case 'Ellipse':
                        instrument = new Ellipse('Ellipse', canvas.onlineLayer);
                }
                instrument.username = data.username;
                canvas.dataInstruments.push(instrument);
            }
        }
        else instrument = canvas.dataInstruments.find(element => element.name == data.name);
        instrument.useData(data);
    }
    canvas.dataInstruments.forEach(instrument =>
    {
        if(instrument.selected || instrument.readyToDraw)
        {
            instrument.onDraw();
        }
    });
    canvas.instrument.drawEachFrame();
    canvas.afterDraw();
}

function mouseReleased()
{
    mouseIsReleased = true;
    if(mouseOverControl && mousePressedOverControl) canvas.instrument.mousePressed();
    if(mouseOverControl || !mousePressedOverControl) canvas.instrument.mouseReleased();
    mousePressedOverControl = false;
    if(canvas.drawn)
    {
        canvas.drawn = false;
        loadPixels();
    }
}

function mouseDragged(event)
{
    if(mousePressedOverControl) return;
    canvas.instrument.mouseDragged(event);
}

function mousePressed()
{
    if(mouseOverControl) 
    {
        mousePressedOverControl = true;
        return;
    }
    canvas.instrument.mousePressed();
}

function mouseWheel(event)
{
    if(!keyIsDown(CONTROL)) return;
    canvas.zoomByMouseWheel(event);
    event.preventDefault();
}