import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function addLocation(ctx: Context, pool: Pool){
    if(!ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text.replace('/add_location', '').trim();
    const [name, whereabouts] = text.split('-').map(str => str.trim());

    if (!name) {
        return ctx.reply('неверный формат. правильно: /add_location название - местоположение');
    }

    try {
        await pool.query(
            'INSERT INTO locations (name, whereabouts) VALUES ($1, $2)',
            [name, whereabouts || null]
        );
        ctx.reply(`локация "*${name}*" успешно создана!!`, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error(error);
        ctx.reply('ошибка при сохранении в базу');
    }
}