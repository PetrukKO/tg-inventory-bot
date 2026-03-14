import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function delloc(ctx: Context, pool: Pool, locationId: string) {
    try {
        const locRes = await pool.query('SELECT name FROM locations WHERE id = $1', [locationId]);
        if (locRes.rows.length === 0) {
            return ctx.answerCbQuery('эта локация уже удалена', { show_alert: true });
        }
        
        const locName = locRes.rows[0].name;
        await pool.query('DELETE FROM locations WHERE id = $1', [locationId]);
        await ctx.editMessageText(`локация ${locName} и все её содержимое были удалены`);
        
        if (ctx.callbackQuery) {
            await ctx.answerCbQuery('удалено');
        }

    } catch (error) {
        console.error('ошибка при удалении локации:', error);
        if (ctx.callbackQuery) {
            await ctx.answerCbQuery('ошибка бд при удалении', { show_alert: true });
        }
    }
}