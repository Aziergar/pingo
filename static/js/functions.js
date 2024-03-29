function pseudoRandom(seed, _min, _max)
{
  return ((seed * 1664525 + 1013904223) % ((_max - _min) * 1000)) / 1000 + _min;
}

function getPixelColor(x, y)
{
    x = Math.trunc(x);
    y = Math.trunc(y);
    let d = pixelDensity();
    let index = Math.trunc(4 * (y * width * d + x));
    return new Color(pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]);
}

function setPixelColor(x, y, color, isReplace = false, isRealPixel = true)
{
    if(isReplace) color = color.toRGB();
    x = Math.trunc(x);
    y = Math.trunc(y);
    let d = pixelDensity();
    let ratio = color.a / 255;
    for (let i = 0; i < d; i++)
    {
        for (let j = 0; j < d; j++)
        {
            let index = isRealPixel ? 4 * (y * width * d + x)
                                    : 4 * ((y * d + j) * width * d + (x * d + i));
            pixels[index    ] = Math.round(pixels[index    ] * (1 - ratio) + color.r * ratio);
            pixels[index + 1] = Math.round(pixels[index + 1] * (1 - ratio) + color.g * ratio);
            pixels[index + 2] = Math.round(pixels[index + 2] * (1 - ratio) + color.b * ratio);
            pixels[index + 3] = 255;
            if(isRealPixel) return;
        }
    }
}

function copyArea(x, y, w, h)
{
    x = Math.trunc(x);
    y = Math.trunc(y);
    w = Math.trunc(w);
    h = Math.trunc(h);
    let d = pixelDensity();
    let area = [];
    area.length = w * h * d * 4;

    for(let i = 0; i < w; i++)
    {
        for(let j = 0; j < h; j++)
        {
            let index = 4 * ((y + j) * width * d + x + i);
            let areaIndex = 4 * (j * w * d + i);
            if(index < 0 || (index + 3) > pixels.length) continue;
            for(let k = 0; k < 4; k++)
            {
                area[areaIndex + k] = pixels[index + k];
            }
        }
    }
    return area;
}

function pasteArea(x, y, w, h, area)
{
    x = Math.trunc(x);
    y = Math.trunc(y);
    w = Math.trunc(w);
    h = Math.trunc(h);

    let d = pixelDensity();

    for(let i = 0; i < w; i++)
    {
        for(let j = 0; j < h; j++)
        {
            let index = 4 * ((y + j) * width * d + x + i);
            let areaIndex = 4 * (j * w * d + i);
            if(index < 0 || (index + 3) > pixels.length || (areaIndex + 3) > area.length) continue;
            for(let k = 0; k < 4; k++)
            {
                pixels[index + k] = area[areaIndex + k];
            }
        }
    }
}

function copyPasteArea(x1, y1, x2, y2, w, h)
{
    x1 = Math.trunc(x1);
    y1 = Math.trunc(y1);
    x2 = Math.trunc(x2);
    y2 = Math.trunc(y2);
    w = Math.trunc(w);
    h = Math.trunc(h);

    let d = pixelDensity();

    for(let x = 0; x < w; x++)
    {
        for(let y = 0; y < h; y++)
        {
            let index1 = 4 * ((y1 + y) * width * d + x1 + x);
            let index2 = 4 * ((y2 + y) * width * d + x2 + x);
            if(index1 < 0 || index2 < 0 || (index1 + 3) > pixels.length || (index2 + 3) > pixels.length) continue;
            for(let i = 0; i < 4; i++)
            {
                pixels[index2 + i] = pixels[index1 + i];
            }
        }
    }
}

function absDifference(num1, num2)
{
    return Math.abs(Math.abs(num1) - Math.abs(num2));
}

function isBetween(num1, num2, num3)
{
    return num1 >= num2 && num1 <= num3;
}

function isSameSign(num1, num2)
{
    return ((num1 >= 0 && num2 >= 0) || (num1 < 0 && num2 < 0));
}

class Img
{
    constructor(x, y, w, h, layer)
    {
        let rect = this.getRect(x, y, w, h);
        if(!layer && !h) layer = w;
        this.img = createImage(rect.w * pixelDensity(), rect.h * pixelDensity());
        if(!layer.r) this.img.copy(layer, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w * pixelDensity(), rect.h * pixelDensity());
        else this.setColor(layer);
        this.drawn = false;
        this.x = rect.x;
        this.y = rect.y;
        this.w = rect.w;
        this.h = rect.h;
    }

    replaceColor(color1, color2)
    {
        this.img.loadPixels();
            for(let i = 0; i < this.img.height; i++)
            {
                for(let j = 0; j < this.img.width; j++)
                {
                    let index = (i * this.img.width + j) * 4;
                    if(this.img.pixels[index    ] == color1.r
                    && this.img.pixels[index + 1] == color1.g
                    && this.img.pixels[index + 2] == color1.b
                    && this.img.pixels[index + 3] == color1.a)
                    {
                        this.img.pixels[index    ] = color2.r;
                        this.img.pixels[index + 1] = color2.g;
                        this.img.pixels[index + 2] = color2.b;
                        this.img.pixels[index + 3] = color2.a;
                    }
                }
            }
        this.img.updatePixels();
    }

    setColor(color)
    {
        this.img.loadPixels();
            for(let i = 0; i < this.img.height; i++)
            {
                for(let j = 0; j < this.img.width; j++)
                {
                    let index = (i * this.img.width + j) * 4;
                    this.img.pixels[index    ] = color.r;
                    this.img.pixels[index + 1] = color.g;
                    this.img.pixels[index + 2] = color.b;
                    this.img.pixels[index + 3] = color.a;
                }
            }
        this.img.updatePixels();
    }

    getRect(x, y, w, h)
    {
        if(x == null)
        {
            x = this.x;
            y = this.y;
            w = this.w;
            h = this.h;
        }
        if(h == null)
        {
            w = y.x - x.x;
            h = y.y - x.y;
            y = x.y;
            x = x.x;
        }
        if(w < 0)
        {
            x += w;
            w = -w;
        }
        if(h < 0)
        {
            y += h;
            h = -h;
        }
        return {x : Math.round(x), y : Math.round(y), w : Math.round(w), h : Math.round(h)};
    }

    flip(flipDirection = 'X')
    {
        this.img.loadPixels();
        let h = flipDirection == 'Y' ? this.img.height / 2 : this.img.height;
        let w = flipDirection == 'X' ? this.img.width / 2 : this.img.width;
        for(let i = 0; i < h; i++)
        {
            for(let j = 0; j < w; j++)
            {
                let index1 = (i * this.img.width + j) * 4;
                let k = flipDirection == 'Y' ? this.img.height - 1 - i : i;
                let l = flipDirection == 'X' ? this.img.width - 1 - j : j;
                let index2 = (k * this.img.width + l) * 4;
                for(let m = 0; m < 4; m ++)
                {
                    [this.img.pixels[index1 + m], this.img.pixels[index2 + m]] = [this.img.pixels[index2 + m], this.img.pixels[index1 + m]];
                }
            }
        }
        this.img.updatePixels();
    }

    draw(layer, x, y, w, h)
    {
        let rect = this.getRect(x, y, w, h);
        if(layer == canvas.canvas) image(this.img, rect.x, rect.y, rect.w, rect.h);
        else layer.image(this.img, rect.x, rect.y, rect.w, rect.h);
        this.drawn = true;
        this.x = rect.x;
        this.y = rect.y;
        this.w = rect.w;
        this.h = rect.h;
    }

    resize(newW, newH, direction = 'RIGHT-CENTER')
    {

        if(direction.includes('LEFT')) this.x -= newW - this.w;
        if(direction.includes('TOP')) this.y -= newH - this.h;

        if(direction == 'RIGHT-CENTER' || direction == 'LEFT-CENTER') this.w = newW;
        else if(direction == 'TOP-CENTER' || direction == 'BOTTOM-CENTER') this.h = newH;
        else
        {
            this.w = newW;
            this.h = newH;
        }
    }

    resizeByDelta(deltaX, deltaY, direction = 'RIGHT-CENTER', isProportional = false)
    {
        if(direction.includes('LEFT')) deltaX *= -1;
        if(direction.includes('TOP')) deltaY *= -1;
        if(isProportional)
        {
            if(deltaX >= deltaY) this.resize(this.w + deltaX, 0, direction);
            else this.resize(0, this.h + deltaY, direction);
        }
        else
        {
            this.resize(this.w + deltaX, this.h + deltaY, direction);
        }
    }

    mouseOver()
    {
        if(this.drawn && canvas.mouseInCanvas())
        {
            let mouse = canvas.getMouse();
            let distance = null;
            let scaleDirection = null;
            if(isBetween(mouse.x, this.x, this.x + this.w) && isBetween(mouse.y, this.y, this.y + this.h)) scaleDirection = 'INSIDE';
            function checkEdgeDistance(edge, img)
            {
                let mouseButtons;
                let borders;
                let dif = null;
                switch(edge)
                {
                    case 'LEFT':
                        mouseButtons = [mouse.y, mouse.x];
                        borders = [img.y, img.y + img.h, img.x];
                        break;
                    case 'RIGHT':
                        mouseButtons = [mouse.y, mouse.x];
                        borders = [img.y, img.y + img.h, img.x + img.w];
                        break;
                    case 'TOP':
                        mouseButtons = [mouse.x, mouse.y];
                        borders = [img.x, img.x + img.w, img.y];
                        break;
                    case 'BOTTOM':
                        mouseButtons = [mouse.x, mouse.y];
                        borders = [img.x, img.x + img.w, img.y + img.h];
                        break;
                    case 'LEFT-TOP':
                        dif = dist(img.x, img.y, mouse.x, mouse.y);
                        break;
                    case 'RIGHT-TOP':
                        dif = dist(img.x + img.w, img.y, mouse.x, mouse.y);
                        break;
                    case 'RIGHT-BOTTOM':
                        dif = dist(img.x + img.w, img.y + img.h, mouse.x, mouse.y);
                        break;
                    case 'LEFT-BOTTOM':
                        dif = dist(img.x, img.y + img.h, mouse.x, mouse.y);
                        break;
                    case 'LEFT-CENTER':
                        dif = dist(img.x, img.y + img.h / 2, mouse.x, mouse.y);
                        break;
                    case 'RIGHT-CENTER':
                        dif = dist(img.x + img.w, img.y + img.h / 2, mouse.x, mouse.y);
                        break;
                    case 'BOTTOM-CENTER':
                        dif = dist(img.x + img.w / 2, img.y + img.h, mouse.x, mouse.y);
                        break;
                    case 'TOP-CENTER':
                        dif = dist(img.x + img.w / 2, img.y, mouse.x, mouse.y);
                }
                if(dif || isBetween(mouseButtons[0], borders[0], borders[1]))
                {
                    if(!dif) dif = absDifference(mouseButtons[1], borders[2]);
                    if(dif <= 20 / canvas.zoom.zoom && (edge.includes('-') || (!distance || dif < distance)))
                    {
                        distance = dif;
                        scaleDirection = edge;
                    }
                }
            }
            checkEdgeDistance('LEFT', this);
            checkEdgeDistance('RIGHT', this);
            checkEdgeDistance('TOP', this);
            checkEdgeDistance('BOTTOM', this);
            checkEdgeDistance('LEFT-TOP', this);
            checkEdgeDistance('RIGHT-TOP', this);
            checkEdgeDistance('RIGHT-BOTTOM', this);
            checkEdgeDistance('LEFT-BOTTOM', this);
            checkEdgeDistance('LEFT-CENTER', this);
            checkEdgeDistance('RIGHT-CENTER', this);
            checkEdgeDistance('TOP-CENTER', this);
            checkEdgeDistance('BOTTOM-CENTER', this);
            return scaleDirection;
        }
        return null;
    }
}

function copyFunction(event)
{
    if(!canvas.instrument.name == 'SelectImage') return;
    if(!canvas.instrument.selected) return;
    let img = createGraphics(canvas.instrument.img.w, canvas.instrument.img.h);
    img.image(canvas.instrument.img.img, 0, 0, canvas.instrument.img.w, canvas.instrument.img.h);
    let url = img.elt.toDataURL();
    img.remove();
    event.clipboardData.setData('Text', url);
    event.preventDefault();
}

async function pasteFunction(event, instrumentData, dataInstrument)
{
    let data = { paste: true, name: 'SelectImage', username: user_name };
    let url = null;
    let x, y;

    if(!instrumentData)
    {
        if(event.clipboardData.types.indexOf('text/plain') != -1 && event.clipboardData.getData('text/plain').startsWith('data:image/png;base64,'))
        {
            url = event.clipboardData.getData('text/plain');
            data.url = url;
        }
        else if(event.clipboardData.files.length == 0
            || (!event.clipboardData.files[0].name.endsWith('.png')
            && !event.clipboardData.files[0].name.endsWith('.jpg')
            && !event.clipboardData.files[0].name.endsWith('.jpeg')
            && !event.clipboardData.files[0].name.endsWith('.bmp'))) return;

        canvas.setInstrument('SelectImage');
        x = (canvas.canvasParent.parent().getBoundingClientRect().left - canvas.canvasParent.elt.getBoundingClientRect().left) / canvas.zoom.zoom;
        y = (canvas.canvasParent.parent().getBoundingClientRect().top - canvas.canvasParent.elt.getBoundingClientRect().top) / canvas.zoom.zoom;
        x = Math.max(x, 0);
        y = Math.max(y, 0);
        if(canvas.instrument.img) canvas.instrument.onDeselect();
        data.x = x;
        data.y = y;
    }
    else 
    {
        url = instrumentData.url;
        x = instrumentData.x;
        y = instrumentData.y;
    }

    async function pasteImage()
    {
        let promise = new Promise(resolve =>
        {
            loadImage(url, img =>
            {
                let instrument = instrumentData ? dataInstrument : canvas.instrument;
                let layer = instrumentData ? canvas.onlineLayer : canvas.canvas;
                instrument.img = new Img(x, y, 1, 1, layer);
                instrument.img.img = img;
                instrument.point1 = createVector(x, y);
                instrument.point2 = createVector(x + img.width / pixelDensity(), y + img.height / pixelDensity());
                instrument.selected = true;
                resolve();
            });
        });
        await promise;
    }

    if(url) await pasteImage();
    else
    {
        let reader = new FileReader();
        url = '';
        let promise = new Promise(resolve =>
        {
            reader.onload = async function(e) {
                url = reader.result;
                data.url = url;
                await pasteImage();
                resolve();
            }
        })
        reader.readAsDataURL(event.clipboardData.items[0].getAsFile());
        await promise;
    }

    if(event) event.preventDefault();

    if(instrumentData) return;
    sendData.push(JSON.stringify(data));
    //canvas.instrument.on
    //sendData.push(canvas.instrument.use());
}

function createFileName()
{
    let options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    return 'Pingo_' + new Date().toLocaleDateString(undefined, options).replaceAll(/\W/g, '_');
}

async function getImageBlob(type)
{
    switch(type)
    {
        case "image/jpeg":
            break;
        case "image/bmp":
            break;
        default:
            type = "image/png";
    }
    let blob = new Promise((resolve) =>
    {
        canvas.canvas.elt.toBlob(async (_blob) => resolve(_blob), type, 1);
    });
    return await blob;
}

async function saveFile()
{
    let options = {
        suggestedName: createFileName(),
        startIn: 'downloads',
        types: [
            {
                description: 'PNG',
                accept: { 'image/png': ['.png'] }
            },
            {
                description: 'JPEG',
                accept: { 'image/jpeg': ['.jpg', '.jpeg'] }
            },
            {
                description: 'Bitmap',
                accept: { 'image/bmp': ['.bmp'] }
            }
        ]
    };
    try {
        let file = await window.showSaveFilePicker(options);
        let type = "image/" + await file.name.substring(file.name.length - 3);
        let stream = await file.createWritable();
        await stream.write(await getImageBlob(type));
        await stream.close();
    } catch{}
}

function setThickness(newValue, instrument)
{
    if(!instrument) instrument = canvas.instrument;
    newValue = constrain(newValue - newValue % instrument.thicknessRange.delta, instrument.thicknessRange.min, instrument.thicknessRange.max);
    instrument.thickness = newValue;
    thicknessSlider.value = newValue;
    thicknessText.value = newValue;
}

function setTransparency(newValue, instrument)
{
    if(!instrument) instrument = canvas.instrument;
    if(instrument == canvas.getInstrument('SelectImage')) return;
    newValue = constrain(newValue - newValue % 1, transparencySlider.min, transparencySlider.max);
    if(instrument.constTransparency) newValue = instrument.color.a;
    if(instrument == canvas.getInstrument('Text')) 
    {
        instrument.fontColor.a = newValue;
        instrument.setColor(instrument.fontColor);
    }
    else instrument.color.a = newValue;
    transparencySlider.value = newValue;
    transparencyText.value = newValue;
}

function setColor(newValue, instrument, alpha = false)
{
    if(!instrument)
    {
        canvas.instruments.forEach(el =>
        {
            if(el.name == "Text") 
            {
                if(!alpha) newValue.a = el.fontColor.a;
                el.setColor(new Color(newValue));
            }
            else if(el.colorable) 
            {
                if(!alpha) newValue.a = el.color.a;
                el.color = new Color(newValue); 
            }
        });
    }
    else 
    {
        if(!alpha) newValue.a = instrument.color.a;
        instrument.color = new Color(newValue);
    }
}

function setFontSize(newValue)
{
    instrument = canvas.getInstrument("Text");
    newValue = constrain(newValue, fontSize.min, fontSize.max);
    instrument.setFontSize(newValue);
    fontSize.value = newValue;
}

function setFont(newValue)
{
    instrument = canvas.getInstrument("Text");
    instrument.setFont(newValue);
}

function setStyle(bold, italic)
{
    canvas.getInstrument('Text').setStyle(bold, italic);
}