import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function safeDeleteLocation(ctx: Context, pool: Pool) {
    try {
        const res = await pool.query('SELECT id, name FROM locations ORDER BY id ASC');

        if (res.rows.length === 0) {
            return ctx.reply('локаций для удаления нет');
        }
        const buttons = res.rows.map(loc => {
            return Markup.button.callback(`удалить: ${loc.name}`, `safedel_src_${loc.id}`);
        });

        const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });

        await ctx.reply('какую локацию удалить? вещи будут перемещены в другую', {
            ...keyboard,
        });

    } catch (error) {
        console.error('ошибка при выводе локаций для удаления', error);
        ctx.reply('ошибка бд при выводе локаций для удаления');
    }
}