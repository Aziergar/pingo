(() =>
{


let Names = {
    tag_palette: 'color-palette',
    tag_edit_button: 'color-palette-edit-button',
    tag_row: 'color-palette-row',
    tag_colors_div: 'color-palette-colors',

    class_selected: 'color-palette-selected',
    class_picker: 'color-palette-picker',
    class_pressed: 'color-palette-pressed'
};

standartColors = [
    '#ffffff', '#c3c3c3', '#585858', '#000000', '#88001b', '#ec1c24', '#ff7f27', '#ffca18', 
    '#fdeca6', '#fff200', '#bfff00', '#00f044', '#00992b', '#8cfffb', '#00a8f3', '#707aff', 
    '#0011ff', '#fda3ff', '#e343e5', '#af27b2', '#ffaec8', '#b97a56', '#7d3e17', '#552302', 
    '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']

let palettes = document.getElementsByTagName(Names.tag_palette);

function setSelected(picker, value)
{
    if(value) picker.classList.add(Names.class_selected);
    else picker.classList.remove(Names.class_selected);
}

function onPickerClick(event)
{
    let picker = event.currentTarget;
    let palette = picker.parentElement.parentElement.parentElement;
    if(palette.editable) return;
    let previous = picker.parentElement.parentElement.getElementsByClassName(Names.class_selected)[0];
    if(picker != previous)
    {
        if(previous) setSelected(previous, false)
        setSelected(picker, true);
        palette.dispatchEvent(new Event('change'));
    }
    event.preventDefault();
}

function onEditClick(event)
{
    let button = event.currentTarget;
    if(button.classList.contains(Names.class_pressed))
    {
        button.classList.remove(Names.class_pressed)
        button.parentElement.editable = false;
        return;
    }
    button.classList.add(Names.class_pressed)
    button.parentElement.editable = true;
}

function createEditButton(palette)
{
    let size = palette.attributes.edit_button_size;
    size = size ? size.value : '20px';
    let button = document.createElement(Names.tag_edit_button);
    button.style = `width: ${size}; height: ${size};`;
    palette.appendChild(button);
    button.addEventListener('click', onEditClick);
    return button;
}

function createRow(height)
{
    let row = document.createElement(Names.tag_row);
    row.style = `height: ${height}%;`;
    return row;
}

function createPicker(row, width)
{
    let picker = document.createElement('input');
    picker.setAttribute('type', 'color');
    picker.setAttribute('class', Names.class_picker);
    picker.style = `width: ${width}%;`;
    picker.addEventListener('click', onPickerClick);
    row.appendChild(picker);
    return picker;
}

function setupPalette(palette)
{
    function setColors(colors)
    {
        let pickers = this.getElementsByClassName(Names.class_picker);
        if(Array.isArray(colors))
        {
            for(let i = 0; i < colors.length && i < pickers.length; i++)
            {
                if(colors[i] != '') pickers[i].value = colors[i];
            }
            return;
        }
        pickers.forEach(picker => picker.value = colors);
    }

    function getColors()
    {
        let result = [];
        this.getElementsByClassName(Names.class_picker).forEach(picker => result.push(picker.value));
        return result;
    }

    function setColor(color, index)
    {
        this.getElementsByClassName(Names.class_picker)[index].value = color;
    }

    function getColor(index)
    {
        return this.getElementsByClassName(Names.class_picker)[index].value;
    }

    function getValue()
    {
        return this.getElementsByClassName(Names.class_selected)[0].value;
    }

    palette.editable = false;
    palette.setColors = setColors;
    palette.getColors = getColors;
    palette.setColor = setColor;
    palette.getColor = getColor;
    palette.getValue = getValue;
    palette.getElementsByClassName(Names.class_picker)[0].click();
    palette.setColors(standartColors);
}

palettes.forEach(palette =>
{
    let rows = palette.attributes.rows;
    let columns = palette.attributes.columns;
    rows = rows ? parseInt(palette.attributes.rows.value) : 8;
    columns = columns ? parseInt(palette.attributes.columns.value) : 4;
    let row_height = 100.0 / rows;
    let picker_width = 100.0 / columns;
    
    let colors = document.createElement(Names.tag_colors_div);
    for(let i = 0; i < rows; i++)
    {
        let row = createRow(row_height);
        for(let j = 0; j < columns; j++) createPicker(row, picker_width);
        colors.appendChild(row);
    }
    palette.appendChild(colors);

    createEditButton(palette);

    setupPalette(palette);
});

styleText = `
${Names.tag_palette} {
    display: block;
    background-color: black;
    container-type: size;
}
${Names.tag_colors_div} {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
}
${Names.tag_edit_button} {
    display: inline-block;
    position: relative;
    left: 100%;
    margin-left: 1%;
    bottom: 50%;
    transform: translateY(-50%);
    border: solid 2px;
    border-radius: 20%;
    background-size: cover;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='48px' viewBox='0 0 24 24' width='48px' fill='%23000000'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E");
}
.${Names.class_pressed} {
    transform: translateY(-50%) scale(0.85);
}
.${Names.class_picker} {
    -webkit-appearance: none;
    border: solid 2cqmin transparent;
    background-clip: padding-box;
    padding: 1cqmin;
    height: 100%;
    background-color: white;
}
.${Names.class_selected} {
    background-clip: border-box;
    transform: scale(0.85);
}
.${Names.class_picker}::-webkit-color-swatch-wrapper {
    padding: 0;
}
.${Names.class_picker}::-webkit-color-swatch {
    border: none;
}`;

let style = document.createElement('style');
if(style.styleSheet)
    style.styleSheet.cssText = styleText;
else
    style.appendChild(document.createTextNode(styleText));
document.getElementsByTagName('head')[0].appendChild(style);


})();