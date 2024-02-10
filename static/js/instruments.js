class Color
{
    constructor(r, g, b, a = 255)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static fromHex(hex)
    {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            new Color(
                parseInt(result[1], 16), 
                parseInt(result[2], 16), 
                parseInt(result[3], 16))
            : null;
    }

    isEqual(color, deviation = 0)
    {
        if (Math.abs(this.r - color.r) / 255 > deviation) return false;
        if (Math.abs(this.g - color.g) / 255 > deviation) return false;
        if (Math.abs(this.b - color.b) / 255 > deviation) return false;
        if (Math.abs(this.a - color.a) / 255 > deviation) return false;
        return true;
    }

    toRGB()
    {
        let ratio = this.a / 255;
        if(ratio == 1) return this;
        return new Color(Math.round(this.r * ratio + 255 * (1 - ratio)),
                         Math.round(this.g * ratio + 255 * (1 - ratio)),
                         Math.round(this.b * ratio + 255 * (1 - ratio)), 255);
    }

    stringify()
    {
        return "rgba(" + this.r.toString() + ", " + this.g.toString() + ", " + this.b.toString() + ", " + this.a.toString() + ")";
    }
}

let black = new Color(0, 0, 0);
let white = new Color(255, 255, 255);
let transparent = new Color(255, 255, 255, 0);

class Canvas
{
    setup(divID, _width, _height, color = white)
    {
        this.color = color;
        this.drawn = false;
        this.canvasParent = createDiv();
        this.canvasParent.parent(divID);
        this.canvasParent.size(_width, _height);
        this.canvasParent.style("overflow: hidden");
        this.canvas = createCanvas(_width, _height);
        this.outerLayer = createGraphics(_width, _height);
        this.onlineLayer = createGraphics(_width, _height);
        this.canvas.parent(this.canvasParent);
        this.canvas.position(0, 0, "absolute");
        this.onlineLayer.parent(this.canvasParent);
        this.onlineLayer.position(0, 0, "absolute");
        this.onlineLayer.show();
        this.outerLayer.parent(this.canvasParent);
        this.outerLayer.position(0, 0, "absolute");
        this.outerLayer.show();
        this.zoom = { zoom : 1, zoomX : 0, zoomY : 0, delta : 0, zoomSensitivity : 0.001, zoomMin : 0.1, zoomMax : Math.max(_width, _height) / 25};
        this.translate = { x : 0, y : 0};
        this.origin = { x : 0, y : 0};
        this.canvasRect = this.canvas.elt.getBoundingClientRect();
        this.beforeDrawFuncs = [];
        this.afterDrawFuncs = [];
        background(color.r, color.g, color.b, color.a);
        this.instruments = [new SelectImage("SelectImage", this.outerLayer, true),
                            new Text("Text", this.outerLayer),
                            new Marker("Marker", new Thickness(1, 5), new Color(0, 0, 0, 255)),
                            new Fill("Fill", 0.3),
                            new Pencil("Pencil", new Thickness(1, 5), new Color(0, 0, 0, 255)),
                            new Spray("Spray", new Thickness(10, 100), new Color(0, 0, 0, 255)),
                            new Eraser("Eraser", new Thickness(10, 100)),
                            new Line("Line", this.outerLayer, new Thickness(1, 20)),
                            new Rect("Rect", this.outerLayer, new Thickness(1, 20)),
                            new Ellipse("Ellipse", this.outerLayer, new Thickness(1, 20))];
        this.dataInstruments = [new Marker("Marker"),
                                new Fill("Fill"),
                                new Pencil("Pencil"),
                                new Spray("Spray"),
                                new Eraser("Eraser")];
        this.setInstrument("Marker");
        this.canvas.loadPixels();
    }

    beforeDraw()
    {
        this.beforeDrawFuncs.forEach(func => func());
        this.beforeDrawFuncs = [];
    }

    afterDraw()
    {
        this.afterDrawFuncs.forEach(func => func());
        this.afterDrawFuncs = [];
    }

    doBeforeDraw(func)
    {
        this.beforeDrawFuncs.push(func);
    }

    doAfterDraw(func)
    {
        this.afterDrawFuncs.push(func);
    }

    setSelectImage(point1, point2, layer = canvas.outerLayer)
    {
        this.doBeforeDraw(() =>
        {
            let instrument = canvas.instruments.find(el => el.name == 'SelectImage');
            instrument.img = new Img(point1, point2, layer);
            instrument.point1 = point1;
            instrument.point2 = point2;
            instrument.selected = true;
            instrument.onSelectCalled = true;
            instrument.changedSourceLayer = true;
        });

        this.doAfterDraw(() => canvas.setInstrument("SelectImage"));
    }

    addLayer(element)
    {
        element.parent(this.canvasParent);
    }

    setOrigin(x, y)
    {
        this.origin.x = x;
        this.origin.y = y;
        this.canvasParent.style("transform-origin: " + x.toString() + "px " + y.toString() + "px;");
    }

    setTranslate(x, y)
    {
        this.translate.x = x;
        this.translate.y = y;
        this.canvasParent.style("translate: " + x.toString() + "px " + y.toString() + "px;");
    }

    addTranslate(x, y)
    {
        this.translate.x += x;
        this.translate.y += y;
        this.setTranslate(this.translate.x, this.translate.y);
    }

    setZoom(zoom)
    {
        this.zoom.zoom = zoom;
        this.canvasParent.style("scale: " + zoom.toString() + ";");
    }

    zoomByMouseWheel(event)
    {
        let mouse = canvas.getMouseByEvent(event);

        this.addTranslate((mouse.x - this.zoom.zoomX) * (this.zoom.zoom - 1), (mouse.y - this.zoom.zoomY) * (this.zoom.zoom - 1));

        this.zoom.zoomX = mouse.x;
        this.zoom.zoomY = mouse.y;
        this.setOrigin(this.zoom.zoomX, this.zoom.zoomY);

        this.zoom.delta = event.delta * this.zoom.zoomSensitivity * this.zoom.zoom;
        this.zoom.zoom -= this.zoom.delta;
        this.zoom.zoom = constrain(this.zoom.zoom, this.zoom.zoomMin, this.zoom.zoomMax);
        this.setZoom(this.zoom.zoom);
    }

    getMouseByEvent(event)
    {
        this.canvasRect = this.canvas.elt.getBoundingClientRect();
        return {x : (event.clientX - this.canvasRect.left) / this.zoom.zoom, y : (event.clientY - this.canvasRect.top) / this.zoom.zoom };
    }

    getMouse()
    {
        return { x : mouseX / this.zoom.zoom, y : mouseY / this.zoom.zoom };
    }

    getMouseConstrained()
    {
        let mouse = this.getMouse();
        return {x : constrain(mouse.x, 0, width), y : constrain(mouse.y, 0, height)};
    }

    getPMouse()
    {
        return { x : pmouseX / this.zoom.zoom, y : pmouseY / this.zoom.zoom };
    }

    getMouseDelta()
    {
        let mouse = this.getMouse();
        let pMouse = this.getPMouse();
        return {x : mouse.x - pMouse.x, y : mouse.y - pMouse.y};
    }

    getMouseDeltaByEvent(event)
    {
        return {x : event.movementX / this.zoom.zoom, y : event.movementY / this.zoom.zoom};
    }

    onInstrumentChange()
    {
        thicknessSlider.max = this.instrument.thicknessRange.max;
        thicknessSlider.min = this.instrument.thicknessRange.min;
        thicknessSlider.step = this.instrument.thicknessRange.delta;
        setThickness(this.instrument.thickness, this.instrument);
        setTransparency(this.instrument.color.a, this.instrument);
        let thicknessDisabled = !this.instrument.thicknessRange.enabled();
        thicknessSlider.disabled = thicknessDisabled;
        thicknessText.disabled = thicknessDisabled;
        let transparencyDisabled = this.instrument.constTransparency;
        transparencySlider.disabled = transparencyDisabled;
        transparencyText.disabled = transparencyDisabled;
    }

    setInstrument(name)
    {
        this.instruments.forEach(instrument =>
        {
            if(instrument.name == name)
            {
                this.instrument = instrument;
            }
        });
        this.onInstrumentChange();
    }

    mouseInCanvas()
    {
        let rect = this.canvasParent.elt.getBoundingClientRect();
        let parentRect = this.canvasParent.parent().getBoundingClientRect();
        let dy = Math.min(0, (rect.top - parentRect.top) / this.zoom.zoom);
        let dY = Math.max(0, (rect.bottom - parentRect.bottom) / this.zoom.zoom);
        let dx = Math.min(0, (rect.left - parentRect.left) / this.zoom.zoom);
        let dX = Math.max(0, (rect.right - parentRect.right) / this.zoom.zoom);
        let mouse = this.getMouse();
        return (mouse.x + dx >= 0 && mouse.x + dX <= width && mouse.y + dy >= 0 && mouse.y + dY <= height);
    }

    drawCheck()
    {
        if(!mouseIsPressed && !mouseIsReleased) return false;
        if(mouseOverControl && !this.instrument.selected && !this.instrument.readyToDraw) return false;
        if(mouseButton != LEFT) return false;
        if(!this.mouseInCanvas() && !this.instrument.selected && !this.instrument.readyToDraw) return false;
        return true;
    }
}

let canvas = new Canvas();

class Thickness
{
    constructor(min, max, delta = 1)
    {
        this.min = min;
        this.max = max;
        this.delta = delta;
    }

    enabled = () => this.max != 0; 
}

class Instrument
{
    constructor(name, thickness = new Thickness(1, 1), color = black, colorable = true)
    {
        this.color = color;
        this.name = name;
        this.thickness = thickness.min;
        this.thicknessRange = thickness;
        this.colorable = colorable;
    }

    applyForLine(func, mouse, pmouse)
    {
        let current = createVector(pmouse.x, pmouse.y);
        let end = createVector(mouse.x, mouse.y);
        let delta = p5.Vector.sub(end, current);
        delta.normalize();
        while(!current.equals(end))
        {
            if(p5.Vector.sub(end, current).dot(delta) < 0) return;
            func(current.x, current.y, this.color, this.thickness);
            current.add(delta);
        }
        func(current.x, current.y, this.color, this.thickness);
    }

    draw(){}

    mousePressed(){}
    mouseReleased(){}
    mouseDragged(event){}

    drawEachFrame(){}

    use(data = {mouse : canvas.getMouse(), pmouse : canvas.getPMouse()})
    {
        this.applyForLine(this.draw, data.mouse, data.pmouse);
        this.data = data;
        return JSON.stringify(this);
    }

    applyData(instrumentData)
    {
        this.name = instrumentData.name;
        this.thicknessRange = instrumentData.thicknessRange;
        this.thickness = instrumentData.thickness;
        this.color = new Color(instrumentData.color.r, instrumentData.color.g, instrumentData.color.b, instrumentData.color.a);
        this.data = instrumentData.data;
        this.readyToDraw = instrumentData.readyToDraw;
    }

    useData(instrumentData)
    {
        this.applyData(instrumentData);
        this.use(instrumentData.data);
    }
}

class Pencil extends Instrument
{
    draw(x, y, col, thickness)
    {
        x = Math.round(x);
        y = Math.round(y);
        let d = pixelDensity();
        let area = [];
        if(col.a < 255)
        {
            area = copyArea(0, 0, thickness * d, thickness * d);
            copyPasteArea(Math.max((x - thickness / 2) * d, 0), Math.max((y - thickness / 2) * d, 0), 0, 0, thickness * d, thickness * d);
            for(let i = 0; i < thickness; i++)
            {
                for(let j = 0; j < thickness; j++)
                {
                    setPixelColor(i, j, col, false, false);
                }
            }
        }
        else
        {
            for(let i = 0; i < thickness; i++)
            {
                setPixelColor(0, i, col, true, false);
                setPixelColor(thickness - 1, i, col, true, false);
                setPixelColor(i, 0, col, true, false);
                setPixelColor(i, thickness - 1, col, true, false);
            }
        }
        updatePixels(x - thickness / 2, y - thickness / 2, thickness, thickness);
        if(col.a == 255)
        {
            rectMode(CENTER);
            fill(color(col.r, col.g, col.b, col.a));
            noStroke();
            rect(x, y, thickness, thickness);
        }
        else pasteArea(0, 0, thickness * d, thickness * d, area);
    }
}

class Eraser extends Pencil
{
    constructor(name, thickness)
    {
        super(name, thickness, canvas.color, false);
        this.constTransparency = true;
    }
}

class Marker extends Instrument
{
    use(data = {mouse : canvas.getMouse(), pmouse : canvas.getPMouse()})
    {
        push();
        strokeWeight(this.thickness);
        stroke(color(this.color.r, this.color.g, this.color.b, this.color.a));
        line(data.pmouse.x, data.pmouse.y, data.mouse.x, data.mouse.y);
        pop();
        this.data = data;
        return JSON.stringify(this);
    }
}

class Fill extends Instrument
{
    constructor(name, deviation = 0, color = black)
    {
        super(name, new Thickness(0, 0, 0), color);
        this.deviation = deviation;
    }

    static FillLine = class
    {
        constructor(x, y, color)
        {
            this.x1 = x;
            this.x2 = x;
            this.y = y;
            this.color = color;
        }

        draw()
        {
            for(let x = this.x1; x <= this.x2; x++)
            {
                setPixelColor(x, this.y, this.color);
            }
        }
    }

    fillByLines(x, y)
    {
        x = Math.trunc(x);
        y = Math.trunc(y);
        let iterations = 0;
        let d = pixelDensity();
        let stack = [];
        stack.push(new Fill.FillLine(x * d, y * d, this.color));

        let filler = this;
        function createIntervals(line, deltaY)
        {
            let newInterval = true;
            let y = line.y + deltaY;
            if(y == height * d * (0.5 + 0.5 * deltaY)) return;
            for(let x = line.x1; x <= line.x2; x++)
            {
                if(getPixelColor(x, y).isEqual(filler.baseColor, filler.deviation))
                {
                    if(newInterval)
                    {
                        stack.push(new Fill.FillLine(x, y, filler.color));
                        newInterval = false;
                    }
                    else
                    {
                        stack[stack.length - 1].x2 = x;
                    }
                }
                else newInterval = true;
            }
        }

        while(stack.length != 0)
        {
            iterations++;
            if(iterations > 10000) return;
            let line = stack.pop();

            while(line.x1 > 0 && getPixelColor(line.x1 - 1, line.y).isEqual(this.baseColor, this.deviation))
            {
                line.x1--;
            }

            while(line.x2 < width * d - 1 && getPixelColor(line.x2 + 1, line.y).isEqual(this.baseColor, this.deviation))
            {
                line.x2++;
            }

            line.draw();

            createIntervals(line,  1);
            createIntervals(line, -1);
        }
    }

    applyData(instrumentData)
    {
        super.applyData(instrumentData);
        this.deviation = instrumentData.deviation;
    }

    use(data = {mouse : canvas.getMouse()})
    {
        loadPixels();
        this.baseColor = getPixelColor(data.mouse.x * pixelDensity(), data.mouse.y * pixelDensity());
        if(!this.baseColor.isEqual(this.color, this.deviation))
        {
        this.fillByLines(data.mouse.x, data.mouse.y);
        updatePixels();
        }
        this.data = data;
        return JSON.stringify(this);
    }
}

class Spray extends Instrument
{
    use(data = {mouse : canvas.getMouse(), pmouse : canvas.getPMouse(), seed : random()})
    {
        push();
        strokeWeight(1);
        let r = this.thickness / 2;
        let rSquared = r * r;
        let sprayDensity = r * 2;
        let lerps = 10;

        for (let i = 0; i < lerps; i++)
        {
            let lerpX = lerp(data.mouse.x, data.pmouse.x, i / lerps);
            let lerpY = lerp(data.mouse.y, data.pmouse.y, i / lerps);

            for (let j = 0; j < sprayDensity; j++)
            {
                data.seed = pseudoRandom(data.seed, -r, r);
                let randX = data.seed;
                data.seed = pseudoRandom(data.seed, -1, 1);
                let randY = data.seed * sqrt(rSquared - randX * randX);

                let a = 255 * (1 - sqrt(pow(randX, 2) + pow(randY, 2)) / r);
                a = min(255, a * deltaTime / (lerps * 10));
                stroke(this.color.r, this.color.g, this.color.b, a * (this.color.a) / 255);
                point(lerpX + randX, lerpY + randY);
            }
        }
        pop();
        this.data = data;
        return JSON.stringify(this);
    }
}

class Select extends Instrument
{
    constructor(name, layer, isTransparent = false)
    {
        super(name, new Thickness(0, 0, 0), canvas.color, false);
        this.layer = layer;
        this.isTransparent = isTransparent;
        this.point1 = null;
        this.point2 = createVector(0, 0);
        this.area = new DashedLine(layer);
        this.selected = false;
        this.movePositions = ["INSIDE", "LEFT", "RIGHT", "TOP", "BOTTOM"];
        this.scalePositions = ["LEFT-CENTER", "RIGHT-CENTER", "TOP-CENTER", "BOTTOM-CENTER", "LEFT-TOP", "RIGHT-TOP", "LEFT-BOTTOM", "RIGHT-BOTTOM"];
        this.onSelectCalled = false;
        this.onDeselectCalled = false;
        this.onFlipCalled = false;
    }

    setTransparency(isTransparent)
    {
        this.isTransparent = isTransparent;
        if(this.img) this.img.replaceColor(canvas.color, transparent);
    }

    onSelect()
    {
        this.onSelectCalled = true;
        this.img = new Img(this.point1, this.point2, this.color);
    }
    onDeselect() {}
    onFlip() {}
    onDraw()
    {
        let rect = this.img.getRect(this.point1, this.point2);
        this.img.x = rect.x;
        this.img.y = rect.y;
        this.img.w = rect.w;
        this.img.h = rect.h;
        this.img.drawn = true;
    }

    mouseDragged(event)
    {
        if(!this.img)
        {
            let mouse = canvas.getMouseConstrained();
            this.point2 = createVector(mouse.x, mouse.y);
        }
        else
        {
            let mouseDelta = canvas.getMouseDeltaByEvent(event);
            mouseDelta = createVector(mouseDelta.x, mouseDelta.y);
            if(this.movePositions.includes(this.dragPosition))
            {
                this.point1.add(mouseDelta);
                this.point2.add(mouseDelta);
            }
            else if(this.scalePositions.includes(this.dragPosition))
            {
                let dragPositions = [["RIGHT", "LEFT"], ["BOTTOM", "TOP"]];
                let sizes = [this.img.w, this.img.h];
                let deltas = [mouseDelta.x, mouseDelta.y];
                let axes = ["X", "Y"];
                for(let i = 0; i < dragPositions.length; i++)
                {
                    for(let j = 0; j < dragPositions[i].length; j++)
                    {
                        if(this.dragPosition.includes(dragPositions[i][j])
                            && sizes[i] + deltas[i] * Math.pow(-1, j) < Math.abs(deltas[i]))
                            {
                                this.dragPosition = this.dragPosition.replace(dragPositions[i][j],
                                    dragPositions[i][(j + 1) % dragPositions[i].length]);
                                this.onFlip(axes[i]);
                            }
                    }
                }
                this.img.resizeByDelta(mouseDelta.x, mouseDelta.y, this.dragPosition);
                this.point1 = createVector(this.img.x, this.img.y);
                this.point2 = createVector(this.img.x + this.img.w, this.img.y + this.img.h);
            }
        }
    }

    mousePressed()
    {
        if(!this.img || !this.img.mouseOver())
        {
            if(this.img) this.onDeselect();
            this.selected = false;
            let mouse = canvas.getMouseConstrained();
            this.point1 = createVector(mouse.x, mouse.y);
            this.img = null;
        }
        else this.dragPosition = this.img.mouseOver();
    }

    mouseReleased()
    {
        if(!this.selected)
        {
            this.selected = true;
            let mouse = canvas.getMouseConstrained();
            this.point2 = createVector(mouse.x, mouse.y);
            if((this.point1.x == this.point2.x || this.point1.y == this.point2.y) && 
               (!this.allowZeroSize || (this.point1.x == this.point2.x && this.point1.y == this.point2.y))) 
            {
                this.selected = false;
                this.point1 = null;
                this.point2 = null;
            }
            else this.onSelect();
        }
    }

    applyData(data)
    {
        super.applyData(data);
        this.point1 = data.point1 ? createVector(data.point1.x, data.point1.y) : null;
        this.point2 = data.point2 ? createVector(data.point2.x, data.point2.y) : null;
        this.isTransparent = data.isTransparent;
        this.selected = data.selected;
        this.onDeselectCalled = data.onDeselectCalled;
        this.onSelectCalled = data.onSelectCalled;
        this.onFlipCalled = data.onFlipCalled;
        this.changedSourceLayer = data.changedSourceLayer;
        this.axis = data.axis;
        if(this.img && data.img)
        {
            this.img.x = data.img.x;
            this.img.y = data.img.y;
            this.img.w = data.img.w;
            this.img.h = data.img.h;
        }
    }

    use()
    {
        if(!this.selected && this.point1)
        {
            let mouse = canvas.getMouseConstrained();
            this.area.drawRect(this.point1, createVector(mouse.x, mouse.y));
        }
        this.username = user_name;
        let layer = this.layer;
        let area = this.area;
        let img = this.img;
        if(img) this.img = {x : img.x, y : img.y, w : img.w, h : img.h};
        this.area = null;
        this.layer = null;
        let data = JSON.stringify(this);
        this.layer = layer;
        this.area = area;
        this.img = img;
        this.onSelectCalled = false;
        this.onDeselectCalled = false;
        this.onFlipCalled = false;
        return data;
    }

    useData(data)
    {
        this.applyData(data);
        if(this.onSelectCalled) this.onSelect();
        if(this.onDeselectCalled) this.onDeselect();
        if(this.onFlipCalled) this.onFlip(this.axis);
    }

    drawEachFrame()
    {
        if(!this.selected)
        {
            if(!this.point1) return;
            let mouse = canvas.getMouseConstrained();
            this.area.drawRect(this.point1, createVector(mouse.x, mouse.y));
            return;
        }
        this.onDraw();
        this.area.patternOffset += deltaTime / 40;
        this.point1.x = this.img.x;
        this.point1.y = this.img.y;
        this.point2.x = this.img.x + this.img.w;
        this.point2.y = this.img.y + this.img.h;
        this.area.drawRect(this.point1, this.point2);
        this.layer.push();
        this.layer.rectMode(CENTER);
        this.layer.stroke(0);
        this.layer.strokeWeight(constrain(1 / canvas.zoom.zoom, 1, 100));
        this.layer.fill(color(255, 255, 255, 100));
        let width = constrain(10 / canvas.zoom.zoom, 4, 100);
        if(this.scalePositions.includes("LEFT-TOP")) this.layer.rect(this.img.x, this.img.y, width);
        if(this.scalePositions.includes("LEFT-BOTTOM")) this.layer.rect(this.img.x, this.img.y + this.img.h, width);
        if(this.scalePositions.includes("RIGHT-TOP")) this.layer.rect(this.img.x + this.img.w, this.img.y, width);
        if(this.scalePositions.includes("RIGHT-BOTTOM")) this.layer.rect(this.img.x + this.img.w, this.img.y + this.img.h, width);
        if(this.scalePositions.includes("LEFT-CENTER")) this.layer.rect(this.img.x, this.img.y + this.img.h / 2, width);
        if(this.scalePositions.includes("TOP-CENTER")) this.layer.rect(this.img.x + this.img.w / 2, this.img.y, width);
        if(this.scalePositions.includes("RIGHT-CENTER")) this.layer.rect(this.img.x + this.img.w, this.img.y + this.img.h / 2, width);
        if(this.scalePositions.includes("BOTTOM-CENTER")) this.layer.rect(this.img.x + this.img.w / 2, this.img.y + this.img.h, width);
        this.layer.pop();
    }
}

class SelectImage extends Select
{
    onSelect()
    {
        this.onSelectCalled = true;
        this.img = new Img(this.point1, this.point2, canvas.canvas);
        if(this.isTransparent) this.img.replaceColor(canvas.color, transparent);
        let img = new Img(this.point1, this.point2, this.color);
        img.draw(canvas.canvas, this.point1, this.point2);
    }

    onDeselect()
    {
        this.onDeselectCalled = true;
        this.img.draw(canvas.canvas, this.img.x, this.img.y, this.img.w, this.img.h);
        this.point1 = null;
        this.point2 = null;
        this.readyToDraw = false;
    }

    onFlip(axis)
    {
        this.onFlipCalled = true;
        this.axis = axis;
        this.img.flip(axis);
    }

    onDraw()
    {
        this.img.draw(this.layer, this.point1, this.point2);
    }
}

class Text extends Select
{
    constructor(name, layer, color = black, bold = false, italic = false, fontSize = 14, font = "Arial")
    {
        super(name, layer);

        this.text = "";

        this.movePositions = ["LEFT", "RIGHT", "TOP", "BOTTOM", "LEFT-CENTER", "RIGHT-CENTER", "TOP-CENTER", "BOTTOM-CENTER", "LEFT-TOP", "RIGHT-TOP", "LEFT-BOTTOM", "RIGHT-BOTTOM"];
        this.scalePositions = [];
        this.textArea = createElement("textarea");
        canvas.addLayer(this.textArea);
        this.textArea.style("background: transparent");
        this.textArea.style("border: none");
        this.textArea.style("outline: none");
        this.textArea.style("resize: none");
        this.textArea.style("overflow: hidden");
        this.textArea.style("line-height: 1.2");

        this.setTextStyle(this.textArea, color, bold, italic, fontSize, font);

        this.textArea.hide();

        this.div = createDiv();
        this.pDiv = createDiv();
        this.pDiv.style("overflow: hidden; width: 0px; height: 0px");
        this.div.parent(this.pDiv);
        this.div.style("background: transparent; width: fit-content; height: fit-content; line-height: 1.2");
        this.setTextStyle(this.div, color, bold, italic, fontSize, font);
        this.div.style("color: transparent");

        this.minWidth = this.fontSize * 5;
        this.minHeight = parseFloat(this.textArea.style("line-height")) + parseFloat(this.textArea.style("padding")) * 2;
    }

    setTextStyle(element, color, bold, italic, fontSize, font)
    {
        this.style = NORMAL;
        if(bold && italic) this.style = BOLDITALIC;
        else if(bold) this.style = BOLD;
        else if(italic) this.style = ITALIC;
        this.fontSize = fontSize;
        this.fontColor = color;
        this.font = font;

        element.style("font-size", fontSize);
        element.style("font-family", font);
        element.style("color: " + color.stringify());
        element.style("font-style:", italic ? "italic" : "normal");
        element.style("font-weight:", bold ? "bold" : "normal");
    }

    mousePressed()
    {
        super.mousePressed();
        if(this.deselected) this.point1 = createVector(this.textArea.x, this.textArea.y);
    }

    mouseReleased()
    {
        if(!this.selected)
        {
            this.selected = true;
            this.point2 = createVector(this.point1.x + this.minWidth, this.point1.y + this.minHeight);
            this.onSelect();
        }
    }

    use()
    {
        this.username = user_name;
        let div = this.div;
        this.div = null;
        let pDiv = this.pDiv;
        this.pDiv = null;
        let img = this.img;
        let textArea = this.textArea;
        if(img) this.img = {x : img.x, y : img.y, w : img.w, h : img.h};
        this.textArea = null;
        let layer = this.layer;
        let area = this.area;
        this.layer = null;
        this.area = null;
        let data = JSON.stringify(this);
        this.onDeselectCalled = false;
        this.layer = layer;
        this.area = area;
        this.textArea = textArea;
        this.img = img;
        this.div = div;
        this.pDiv = pDiv;
        this.text = "";
        return data;
    }

    applyData(data)
    {
        super.applyData(data);
        this.textArea.value(data.text);
        this.bold = data.bold;
        this.italic = data.italic;
        this.fontSize = data.fontSize;
        this.font = data.font;
        this.fontColor = new Color(data.fontColor.r, data.fontColor.g, data.fontColor.b, data.fontColor.a);
        this.setTextStyle(this.textArea, this.fontColor, this.bold, this.italic, this.fontSize, this.font);
    }

    onSelect()
    {
        if(this.deselected) 
        {
            this.selected = false;
            this.onSelectCalled = false;
            this.deselected = false;
            this.img = null;
            this.point1 = null;
            this.point2 = null;
            this.text = "";
            return;
        }
        this.onSelectCalled = true;
        this.img = new Img(this.point1, this.point2, this.layer);
        this.textArea.show();
    }

    onDeselect()
    {
        this.deselected = true;
        this.onDeselectCalled = true;
        push();
        textSize(this.fontSize);
        textFont(this.font);
        textStyle(this.style);
        textWrap(WORD);
        fill(color(this.fontColor.r, this.fontColor.g, this.fontColor.b, this.fontColor.a));
        strokeWeight(0);
        let dx = parseFloat(this.textArea.style("padding"));
        let dy = dx + 2;
        this.text = this.textArea.value();
        let line = "";
        let dh = 0;
        if(this.text.length > 0)
        {
            for(let i = 0; i <= this.text.length; i++)
            {
                if(this.text[i] == "\n" || i == this.text.length)
                {
                    text(line, this.img.x + dx, this.img.y + dy + dh, this.img.w, this.img.h - dh);
                    dh += parseFloat(this.textArea.style("line-height"));
                    line = "";
                }
                else line += this.text[i];
            }
        }
        pop();
        this.textArea.hide();
        this.textArea.value("");
    }

    onDraw()
    {
        super.onDraw();
        this.div.html(this.textArea.value().replaceAll("\n", "W<br>") + "W");
        this.textArea.position(this.img.x, this.img.y);
        let w = this.div.elt.clientWidth;
        let h = this.div.elt.clientHeight + parseFloat(this.textArea.style("padding")) * 2;
        h = Math.max(h, this.minHeight);
        w = Math.max(w, this.minWidth);
        this.img.w = w;
        this.img.h = h;
        this.textArea.size(this.img.w, this.img.h);
    }

    drawEachFrame()
    {
        if(this.deselected) return;
        super.drawEachFrame();
    }
}

class Primitive extends SelectImage
{
    constructor(name, layer = canvas.outerLayer, thickness = new Thickness(1, 1), color = black)
    {
        super(name, layer, true);
        this.color = color;
        this.thickness = thickness.min;
        this.thicknessRange = thickness;
        this.point2 = null;
        this.allowZeroSize = true;
    }

    onSelect()
    {
        this.onSelectCalled = true;
        let i1 = this.point1.x < this.point2.x ? -1 : 1;
        this.point1.x += i1 * this.thickness;
        this.point2.x += -i1 * this.thickness;
        i1 = this.point1.y < this.point2.y ? -1 : 1;
        this.point1.y += i1 * this.thickness;
        this.point2.y += -i1 * this.thickness;
        this.layer.loadPixels();
        this.img = new Img(this.point1, this.point2, this.layer);
        if(this.isTransparent) this.img.replaceColor(canvas.color, transparent);
    }

    draw(){}

    use()
    {
        if(!this.selected && this.point1) this.onDraw();
        this.username = user_name;
        this.readyToDraw = true;
        let layer = this.layer;
        let area = this.area;
        let img = this.img;
        if(img) this.img = {x : img.x, y : img.y, w : img.w, h : img.h};
        this.area = null;
        this.layer = null;
        let data = JSON.stringify(this);
        this.layer = layer;
        this.area = area;
        this.img = img;
        this.onSelectCalled = false;
        this.onDeselectCalled = false;
        this.onFlipCalled = false;
        return data;
    }

    useData(data)
    {
        if(data.onSelectCalled && this.point1) this.onDraw();
        super.useData(data);
    }

    onDraw()
    {
        if(this.selected)
        {
            super.onDraw();
            return;
        }
        if(!this.point1) return;
        this.layer.push();
        this.layer.fill(color(255, 255, 255, 0));
        this.layer.stroke(color(this.color.r, this.color.g, this.color.b, this.color.a));
        this.layer.strokeCap(ROUND);
        this.layer.strokeWeight(this.thickness);
        this.draw();
        this.layer.pop();
    }

    drawEachFrame()
    {
        if(this.selected) super.drawEachFrame();
        else if(this.point1) this.onDraw();
    }

    getPoint2 = () => this.point2 ? this.point2 : this.point1; 
}

class Line extends Primitive
{
    draw()
    {
        let point2 = this.getPoint2();
        this.layer.line(this.point1.x, this.point1.y, point2.x, point2.y);
    }
}

class Rect extends Line
{
    draw()
    {
        let point2 = this.getPoint2();
        this.layer.rectMode(CORNERS);
        this.layer.rect(this.point1.x, this.point1.y, point2.x, point2.y);
    }
}

class Ellipse extends Line
{
    draw()
    {
        let point2 = this.getPoint2();
        this.layer.ellipseMode(CORNERS);
        this.layer.ellipse(this.point1.x, this.point1.y, point2.x, point2.y);
    }
}

class DashedLinePattern
{
    constructor()
    {
        this.intervals = [];
    }

    addInterval(color, length)
    {
        this.intervals.push({color: color, length: length});
    }

    getLength()
    {
        let length = 0;
        this.intervals.forEach(interval =>
        {
            length += interval.length;
        });
        return length;
    }

    resize(length)
    {
        let ratio = this.getLength() / length;
        this.interals.forEach(interval =>
        {
            interval.length *= ratio;
        });
    }
}

let standartDashedLinePattern = new DashedLinePattern;
standartDashedLinePattern.addInterval(black, 10);
standartDashedLinePattern.addInterval(white, 10);

class DashedLine
{
    constructor(layer, weight = 1, patternOffset = 0, pattern = standartDashedLinePattern)
    {
        this.layer = layer;
        this.weight = weight;
        this.pattern = pattern;
        this.calculatePatternOffset(patternOffset);
    }

    calculatePatternOffset(patternOffset)
    {
        let length = this.pattern.getLength();
        this.patternOffset = patternOffset % length;
        if(this.patternOffset < 0) this.patternOffset = length + this.patternOffset;
    }

    connectVertices(vertice1, vertice2)
    {
        let path = p5.Vector.sub(vertice2, vertice1);
        let direction = p5.Vector.normalize(path);
        let distance = path.mag();

        let offset = this.patternOffset;
        let i;

        for(i = 0; i < this.pattern.intervals.length; i++)
        {
            if(offset > this.pattern.intervals[i].length)
            {
                offset -= this.pattern.intervals[i].length;
            }
            else break;
        }
        if(i == this.pattern.intervals.length) i--;

        while(distance > 0)
        {
            let length = Math.min(this.pattern.intervals[i].length - offset, distance);
            let color = this.pattern.intervals[i].color;

            this.layer.stroke(color.r, color.g, color.b, color.a);
            vertice2 = p5.Vector.add(vertice1, p5.Vector.mult(direction, length));
            this.layer.line(vertice1.x, vertice1.y, vertice2.x, vertice2.y);
            vertice1 = vertice2;
            distance -= length;
            this.patternOffset += length;
            offset = 0;
            i++;
            i %= this.pattern.intervals.length;
        }
        this.patternOffset %= this.pattern.getLength();
    }

    drawShape(vertices)
    {
        this.calculatePatternOffset(this.patternOffset);
        this.layer.strokeCap(SQUARE);
        this.layer.strokeWeight(this.weight);
        let startOffset = this.patternOffset;

        for(let i = 0; i < vertices.length - 1; i++)
        {
            this.connectVertices(vertices[i], vertices[i + 1]);
        }

        this.patternOffset = startOffset;
    }

    drawRect(vertice1, vertice2)
    {
        this.drawShape([vertice1, createVector(vertice2.x, vertice1.y), vertice2, createVector(vertice1.x, vertice2.y), vertice1]);
    }
}