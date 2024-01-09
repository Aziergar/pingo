export async function tryAgain(funcTry, funcCatch = () => {}, { attempts = 5, error = "TryAgain Error", log = "TryAgain Iteration: ", endless = false, interval = 0} = {})
{
    for(let i = 0; i < attempts || endless; i++)
    {
        if(i > 0) await delay(interval);
        try
        {
            return await funcTry();
        }
        catch(e)
        {
            console.log(log + i + '\n' + e);
            await funcCatch();
        }
    }
    throw new Error(error);
}

export const delay = ms => new Promise(res => setTimeout(res, ms));

export function sendMessage(recipients, data)
{
    recipients.forEach(el =>
    {
        el.emit('message', data);
    });
}

const urlToFileMap = new Map();
urlToFileMap.set(new RegExp('^\/$'),               '/home.html');
urlToFileMap.set(new RegExp('^\/create$'),         '/createRoom.html');
urlToFileMap.set(new RegExp('^\/join$'),           '/joinRoom.html');
urlToFileMap.set(new RegExp('^\/room\\?id=\\w+$'), '/room.html');

class UrlToFile
{
    constructor()
    {
        this.map = urlToFileMap;
        this.urls = Array.from(this.map.keys());
    }

    replace(url)
    {
        for(let i in this.urls)
        {
            if(this.urls[i].test(url))
            {
                return this.map.get(this.urls[i]);
            }
        }
        return url;
    }
};

export const urlToFile = new UrlToFile();

const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function createID(length)
{
    let id = '';
    for(let i = 0; i < length; i++)
    {
        let index = Math.floor(Math.random() * characters.length);
        id += characters[index];
    }
    return id;
}

export async function generateUniqueID(id_length, rule = async(id) => false)
{
    let id;
    do
    {
        id = createID(id_length);
    } while(await rule(id));
    return id;
}

const default_name = 'x╬xJ0HNx╬x'

export function validateName(name)
{
    return (!name || name == "") ? default_name : name;  
}