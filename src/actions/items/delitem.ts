import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function delitem(ctx: Context, pool: Pool, itemId: string) {
    try {
        const itemRes = await pool.query('SELECT name FROM items WHERE id = $1', [itemId]);
        if (itemRes.rows.length === 0) {
            return ctx.answerCbQuery('эта вещь уже удалена', { show_alert: true });
        }
        const itemName = itemRes.rows[0].name;
        await pool.query('DELETE FROM items WHERE id = $1', [itemId]);
        await ctx.editMessageText(`*${itemName}* удалено`);
        
        if (ctx.callbackQuery) {
            await ctx.answerCbQuery('удалено');
        }

    } catch (error) {
        console.error('ошибка при удалении вещи', error);
        if (ctx.callbackQuery) {
            await ctx.answerCbQuery('ошибка бд при удалении', { show_alert: true });
        }
    }
}