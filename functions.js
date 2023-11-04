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