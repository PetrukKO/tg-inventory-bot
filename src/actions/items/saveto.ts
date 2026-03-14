import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function saveto(ctx: Context, locationId: string, itemName: string | null, pool: Pool) {
    if (!itemName) {
        return ctx.answerCbQuery('правильный формат add_item', { show_alert: true });
    }

    try {
        await pool.query(
            'INSERT INTO items (name, location_id) VALUES ($1, $2)',
            [itemName, locationId]
        );
        await ctx.editMessageText(`сохраняем ${itemName}`, { parse_mode: 'Markdown' });

        if (ctx.callbackQuery) {
            await ctx.answerCbQuery();
        }
    } catch (error) {
        console.error('ошибка при сохранении прежмета', error);
        if (ctx.callbackQuery) {
            await ctx.answerCbQuery('ошибка бд при сохранении', { show_alert: true });
        }
    }
}