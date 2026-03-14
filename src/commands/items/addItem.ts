import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function addItem(ctx: Context, pool: Pool): Promise<string | null> {
    if(!ctx.message || !('text' in ctx.message) || !ctx.from ) return null;
    
    const itemName = ctx.message.text.replace('/add_item', '').trim();

    if (!itemName) {
        await ctx.reply('напиши название вещи. например: /add_item урановый стержень');
        return null;
    }

    try {
        const res = await pool.query('SELECT id, name FROM locations ORDER BY id ASC LIMIT 50');
        
        if (res.rows.length === 0) {
            await ctx.reply('нет локаций. сначала создай их через /addloc');
            return null;
        }

        const buttons = res.rows.map(loc => 
            Markup.button.callback(loc.name, `saveto_${loc.id}`)
        );

        const keyboard = Markup.inlineKeyboard(buttons, { columns: 2 });

        await ctx.reply(`где лежит ${itemName}?`, keyboard);
        
        return itemName; 

    } catch (error) {
        console.error(error);
        await ctx.reply('ошибка при загрузке локаций');
        return null;
    }
}