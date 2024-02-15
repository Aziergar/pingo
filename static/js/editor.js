let thicknessSlider;
let thicknessText;
let transparencySlider;
let transparencyText;
let palette;
let mousePressedOverControl = false;
let mouseOverControl = false;
let mouseIsReleased = false;

let sendData = [];

async function setup()
{
    thicknessSlider = document.getElementById('ThicknessSlider');
    thicknessText = document.getElementById('ThicknessText');
    transparencySlider = document.getElementById('TransparencySlider');
    transparencyText = document.getElementById('TransparencyText');
    fontSize = document.getElementById('text-size');
    palette = document.getElementById('Palette');
    fontSelector = document.getElementById('select-text-font');
    transparencySlider.max = 255;
    transparencySlider.min = 1;
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
    fontSize.addEventListener('change', () =>
    {
        setFontSize(fontSize.value);
    });
    fontSelector.addEventListener('change', () =>
    {
        setFont(fontSelector.value);
    });
    buttonBold.addEventListener('click', () =>
    {
        setStyle(buttonBold.classList.contains('text-style-pressed'),
                 buttonItalic.classList.contains('text-style-pressed'));
    });
    buttonItalic.addEventListener('click', () =>
    {
        setStyle(buttonBold.classList.contains('text-style-pressed'),
                 buttonItalic.classList.contains('text-style-pressed'));
    });
}

async function draw()
{
    canvas.beforeDraw();
    canvas.outerLayer.clear();
    canvas.onlineLayer.clear();
    if (canvas.drawCheck())
    {
        canvas.drawn = true;
        sendData.push(canvas.instrument.use());
        socket.emit('edit-canvas', { room_id: room_id, sendData: sendData });
        sendData.length = 0;
    }
    mouseIsReleased = false;
    while(drawData.length > 0)
    {
        let instrument;
        let dataArray = drawData.shift();
        for(let i = 0; i < dataArray.length; i++)
        {
            let data = JSON.parse(dataArray[i]);
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

            if(data.paste) 
            {
                await pasteFunction(null, data, instrument);
                instrument.onDraw();
            }

            else instrument.useData(data);
        }
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
    }
    canvas.instrument.mousePressed();
}

function mouseWheel(event)
{
    if(!keyIsDown(CONTROL)) return;
    canvas.zoomByMouseWheel(event);
    event.preventDefault();
}